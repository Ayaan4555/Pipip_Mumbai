const DailyReport = require("../models/DailyReport");
const SystemSettings = require("../models/SystemSettings");
const Expense = require("../models/Expense");
const Booking = require("../models/Booking");
const cron = require("node-cron");

let activeCronJob = null;

// Helper function to calculate report data for a specific day
exports.calculateReportData = async (dateVal) => {
  const targetDate = new Date(dateVal);
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  // 1. Calculate Total Expense
  const expenses = await Expense.find({
    expense_date: { $gte: startOfDay, $lte: endOfDay },
  });
  const totalExpense = expenses.reduce((sum, exp) => sum + (exp.expense_amount || 0), 0);

  // 2. Calculate Total Amount Received
  // Summing amounts of bookings that were paid (or completed/active) and paid on this day
  const bookingsPaid = await Booking.find({
    payment_status: "paid",
    $or: [
      { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
    ],
  });

  const totalAmountReceived = bookingsPaid.reduce((sum, b) => {
    const rent = b.total_amount || 0;
    const penalty = b.penalty_amount || 0;
    const challan = b.challan_amount || 0;
    const damage = b.damage_cost || 0;
    return sum + rent + penalty + challan + damage;
  }, 0);

  // 3. Cumulative Deposit Float balance (latest totals in the system)
  const depositResult = await Booking.aggregate([
    {
      $match: {
        payment_status: "paid",
        status: { $in: ["confirmed", "active", "completed"] },
      },
    },
    {
      $group: {
        _id: null,
        totalDeposit: { $sum: "$deposit_amount" },
      },
    },
  ]);
  const depositAmountFloat = depositResult[0]?.totalDeposit || 0;

  return {
    date: startOfDay,
    total_expense: totalExpense,
    total_amount_received: totalAmountReceived,
    deposit_amount: depositAmountFloat,
  };
};

// GET live automated report for today
exports.getTodayReport = async (req, res) => {
  try {
    const report = await exports.calculateReportData(new Date());
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all historical reports saved in the system
exports.getHistoricalReports = async (req, res) => {
  try {
    const reports = await DailyReport.find().sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET system admin settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST/PUT updates to system settings
exports.updateSettings = async (req, res) => {
  try {
    const { admin_emails, auto_send_enabled, report_time } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    if (admin_emails !== undefined) settings.admin_emails = admin_emails;
    if (auto_send_enabled !== undefined) settings.auto_send_enabled = auto_send_enabled;
    if (report_time !== undefined) settings.report_time = report_time;

    await settings.save();

    // Re-initialize scheduled cron job immediately with updated settings
    await exports.initDailyReportScheduler();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Initialize / Update scheduled cron job
exports.initDailyReportScheduler = async () => {
  try {
    // Clear existing schedule
    if (activeCronJob) {
      activeCronJob.stop();
      activeCronJob = null;
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    if (!settings.auto_send_enabled) {
      console.log("Daily Report WhatsApp scheduler is currently disabled.");
      return;
    }

    const [hourStr, minuteStr] = settings.report_time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
      console.error("Invalid report time format. Schedule skipped.");
      return;
    }

    // Cron syntax: minute hour day-of-month month day-of-week
    const cronExpression = `${minute} ${hour} * * *`;
    console.log(`Registering automated daily business report schedule: ${cronExpression}`);

    activeCronJob = cron.schedule(cronExpression, async () => {
      console.log("[REPORT CRON] Automated daily business report calculation started...");
      try {
        const reportData = await exports.calculateReportData(new Date());

        // Save report snapshot
        await DailyReport.findOneAndUpdate(
          { date: reportData.date },
          reportData,
          { upsert: true, new: true }
        );
        console.log(`[REPORT CRON] Snapshot successfully saved in database for date: ${reportData.date.toLocaleDateString()}`);

        if (settings.admin_emails?.length > 0) {
          const formattedDate = reportData.date.toLocaleDateString("en-GB"); // DD/MM/YYYY
          const subject = `Daily Business Report - ${formattedDate}`;
          const messageText = `Daily Business Report\n\nDate:\n${formattedDate}\n\nTotal Expense:\n₹ ${reportData.total_expense}\n\nTotal Amount Received:\n₹ ${reportData.total_amount_received}\n\nDeposit Amount (Float):\n₹ ${reportData.deposit_amount}\n\nThis report was generated automatically by the Pipip Admin System.`;

          const { getReportHtmlTemplate } = require("../utils/emailTemplate");
          const htmlContent = getReportHtmlTemplate(reportData);

          const { sendBrevoEmail } = require("../utils/brevo");
          console.log(`[REPORT CRON] Dispatching automated HTML emails to: ${settings.admin_emails.join(", ")}`);

          for (const email of settings.admin_emails) {
            try {
              await sendBrevoEmail(email, subject, messageText, htmlContent);
              console.log(`[REPORT CRON SUCCESS] Automated HTML report successfully emailed to ${email}`);
            } catch (sendErr) {
              console.error(`[REPORT CRON ERROR] Failed sending automated HTML report to ${email}:`, sendErr.message);
            }
          }
        }
      } catch (err) {
        console.error("Error executing automated report cron job:", err);
      }
    });
  } catch (error) {
    console.error("Failed to initialize Daily Report scheduler:", error);
  }
};