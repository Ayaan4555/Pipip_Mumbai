const Expense = require("../models/Expense");

// CREATE a new expense
exports.createExpense = async (req, res) => {
  try {
    const {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount,
      approver_name,
      remarks,
    } = req.body;

    // Handle uploaded files
    let invoiceProofs = [];
    if (req.files?.invoice_proof) {
      invoiceProofs = req.files.invoice_proof.map((file) => file.path);
    }

    const paymentProof = req.files?.payment_proof?.[0]?.path || null;

    const expense = await Expense.create({
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount: Number(expense_amount),
      approver_name,
      remarks,
      invoice_proofs: invoiceProofs,
      payment_proof: paymentProof,
      created_by: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all expenses (with search/filters & role-based visibility)
exports.getExpenses = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Role-based visibility: Staff can only see their own expenses; Super Admin (admin) sees everything
    if (req.user.role !== "admin") {
      query.created_by = req.user._id;
    }

    if (search) {
      const orConditions = [
        { expense_name: { $regex: search, $options: "i" } },
        { expense_category: { $regex: search, $options: "i" } },
        { expense_done_by: { $regex: search, $options: "i" } },
        { vendor_receiver_name: { $regex: search, $options: "i" } },
        { approver_name: { $regex: search, $options: "i" } },
      ];

      // 1. Try parsing full standard date (YYYY-MM-DD)
      const parsedDate = Date.parse(search);
      if (!isNaN(parsedDate) && search.includes("-")) {
        const searchDate = new Date(parsedDate);
        const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59, 999);
        
        orConditions.push({
          expense_date: { $gte: startOfDay, $lte: endOfDay }
        });
      }

      // 2. Handle searching a simple number (like "12") to match day, month, or year
      const num = parseInt(search, 10);
      if (!isNaN(num)) {
        orConditions.push(
          { $expr: { $eq: [{ $dayOfMonth: "$expense_date" }, num] } },
          { $expr: { $eq: [{ $month: "$expense_date" }, num] } },
          { $expr: { $eq: [{ $year: "$expense_date" }, num] } }
        );
      }

      // 3. Handle month name matches (like "July", "Jul", "dec")
      const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const monthIndex = monthNames.findIndex((m) => m.startsWith(search.toLowerCase()));
      if (monthIndex !== -1) {
        orConditions.push({
          $expr: { $eq: [{ $month: "$expense_date" }, monthIndex + 1] }
        });
      }

      query.$or = orConditions;
    }

    const expenses = await Expense.find(query)
      .populate("created_by", "fullName email")
      .sort({ expense_date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single expense detail
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("created_by", "fullName email");
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Role check: Staff cannot view other staff members' expenses
    if (req.user.role !== "admin" && expense.created_by._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied to this expense record" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE an existing expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Role check: Staff cannot update other staff members' expenses
    if (req.user.role !== "admin" && expense.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied to edit this expense record" });
    }

    const {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount,
      approver_name,
      remarks,
      remaining_invoices, // existing invoice URLs that user kept
    } = req.body;

    const updateData = {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount: Number(expense_amount),
      approver_name,
      remarks,
    };

    // 1. Process invoice proofs
    let finalInvoices = [];
    if (remaining_invoices) {
      try {
        finalInvoices = JSON.parse(remaining_invoices);
      } catch (e) {
        // Fallback if not stringified JSON
        finalInvoices = Array.isArray(remaining_invoices) ? remaining_invoices : [remaining_invoices];
      }
    } else {
      finalInvoices = expense.invoice_proofs || [];
    }

    if (req.files?.invoice_proof) {
      const newInvoicePaths = req.files.invoice_proof.map((file) => file.path);
      finalInvoices = [...finalInvoices, ...newInvoicePaths];
    }
    updateData.invoice_proofs = finalInvoices.slice(0, 5);

    // 2. Process payment proof
    if (req.files?.payment_proof) {
      updateData.payment_proof = req.files.payment_proof[0].path;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate("created_by", "fullName email");

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};