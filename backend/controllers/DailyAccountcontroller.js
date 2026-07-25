const DailyAccount = require("../models/DailyAccount");

// CREATE a new daily account entry
exports.createEntry = async (req, res) => {
  try {
    const {
      entry_type,
      pipip_bank_balance,
      cash_in_hand,
      farhans_bank_balance,
      remarks,
    } = req.body;

    const today = new Date();
    // Normalize date to midnight (00:00:00.000) for clean comparison on a daily basis
    const normalizedDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );

    // Validation: Only one Morning and one Night entry per day
    const existingEntry = await DailyAccount.findOne({
      date: normalizedDate,
      entry_type: entry_type,
    });

    if (existingEntry) {
      return res.status(400).json({
        message: `A ${entry_type} entry has already been recorded for today (${today.toLocaleDateString()}).`,
      });
    }

    const timeString = today.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const entry = await DailyAccount.create({
      date: normalizedDate,
      time: timeString,
      entry_type,
      pipip_bank_balance: Number(pipip_bank_balance),
      cash_in_hand: Number(cash_in_hand),
      farhans_bank_balance: Number(farhans_bank_balance),
      remarks,
      filled_by: req.user._id,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET daily account entries with smart filters & role permissions
exports.getEntries = async (req, res) => {
  try {
    const { search, filter, startDate, endDate } = req.query;
    let query = {};

    // Role-based check: Staff see only their own, admin sees all
    if (req.user.role !== "admin") {
      query.filled_by = req.user._id;
    }

    const now = new Date();

    // 1. Date Range Filters (Preset ranges)
    if (filter) {
      let start, end;
      if (filter === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (filter === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
        end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
      } else if (filter === "week") {
        const day = now.getDay();
        const diff = now.getDate() - day; // Adjust to Sunday
        start = new Date(now.setDate(diff));
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - day), 23, 59, 59, 999);
      } else if (filter === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (filter === "custom" && startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        query.date = { $gte: start, $lte: end };
      }
    }

    // 2. Search Date Matches (Smart parses)
    if (search) {
      const orConditions = [];

      // A. Full YYYY-MM-DD
      const parsedDate = Date.parse(search);
      if (!isNaN(parsedDate) && search.includes("-")) {
        const searchDate = new Date(parsedDate);
        const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59, 999);
        orConditions.push({ date: { $gte: startOfDay, $lte: endOfDay } });
      }

      // B. Number query (matches day of month, month number, or year)
      const num = parseInt(search, 10);
      if (!isNaN(num)) {
        orConditions.push(
          { $expr: { $eq: [{ $dayOfMonth: "$date" }, num] } },
          { $expr: { $eq: [{ $month: "$date" }, num] } },
          { $expr: { $eq: [{ $year: "$date" }, num] } }
        );
      }

      // C. Month name prefix
      const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const monthIndex = monthNames.findIndex((m) => m.startsWith(search.toLowerCase()));
      if (monthIndex !== -1) {
        orConditions.push({
          $expr: { $eq: [{ $month: "$date" }, monthIndex + 1] }
        });
      }

      if (orConditions.length > 0) {
        // If query.date was already set by range filters, intersect them
        if (query.date) {
          query = {
            $and: [
              { date: query.date },
              { $or: orConditions }
            ]
          };
        } else {
          query.$or = orConditions;
        }
      }
    }

    const entries = await DailyAccount.find(query)
      .populate("filled_by", "fullName email")
      .sort({ date: -1, createdAt: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a daily account entry
exports.updateEntry = async (req, res) => {
  try {
    const entry = await DailyAccount.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Daily account entry not found" });
    }

    // Role check: Staff cannot edit other staff members' entries
    if (req.user.role !== "admin" && entry.filled_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied to edit this record" });
    }

    const {
      entry_type,
      pipip_bank_balance,
      cash_in_hand,
      farhans_bank_balance,
      remarks,
      date,
    } = req.body;

    const targetDate = date ? new Date(date) : new Date(entry.date);
    const normalizedDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0
    );
    const targetType = entry_type || entry.entry_type;

    // Check uniqueness constraint if date or entry_type changed
    if (normalizedDate.getTime() !== entry.date.getTime() || targetType !== entry.entry_type) {
      const existing = await DailyAccount.findOne({
        _id: { $ne: entry._id },
        date: normalizedDate,
        entry_type: targetType,
      });

      if (existing) {
        return res.status(400).json({
          message: `A ${targetType} entry already exists for the date (${normalizedDate.toLocaleDateString()}).`,
        });
      }
    }

    entry.date = normalizedDate;
    entry.entry_type = targetType;
    entry.pipip_bank_balance = Number(pipip_bank_balance);
    entry.cash_in_hand = Number(cash_in_hand);
    entry.farhans_bank_balance = Number(farhans_bank_balance);
    entry.remarks = remarks;

    const updatedEntry = await entry.save();
    const populated = await DailyAccount.findById(updatedEntry._id).populate("filled_by", "fullName email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a daily account entry
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await DailyAccount.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Daily account entry not found" });
    }

    // Role check: Staff cannot delete other staff members' entries
    if (req.user.role !== "admin" && entry.filled_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied to delete this record" });
    }

    await DailyAccount.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};