import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Loader2,
  Paperclip,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  UploadCloud,
  X,
  Pencil,
  Coins,
  Clock,
  Trash2,
  ArrowRight,
  TrendingUp,
  Settings,
  Phone,
  Wrench,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../utils/AuthProvider";
import { useExpenses, useCreateExpense, useUpdateExpense } from "../../hooks/useExpenses";
import {
  useDailyAccounts,
  useCreateDailyAccount,
  useUpdateDailyAccount,
  useDeleteDailyAccount,
} from "../../hooks/useDailyAccounts";
import {
  useTodayReport,
  useHistoricalReports,
  useReportSettings,
  useUpdateReportSettings,
} from "../../hooks/useDailyReports";
import { useBikes } from "../../hooks/useBikes";
import {
  useVehicleServices,
  useBikeServiceTimeline,
  useCreateVehicleService,
  useUpdateVehicleService,
  useDeleteVehicleService,
} from "../../hooks/useVehicleServices";

const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const EXPENSE_CATEGORIES = [
  "Marketing",
  "Partner Share",
  "Inventory",
  "Vehicle Service",
  "Documentation",
  "Fine",
  "Penalty",
  "IT and Subscriptions",
  "Office Rent / Utilities",
  "Payroll",
  "Other",
];

export default function Expenses() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("claims"); // "claims" | "daily_account"

  /* ==========================================================================
     TAB 1: OPERATIONAL EXPENSE CLAIMS STATES & MUTATIONS
     ========================================================================== */
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    expense_date: format(new Date(), "yyyy-MM-dd"),
    expense_name: "",
    expense_category: "Marketing",
    expense_done_by: "",
    vendor_receiver_name: "",
    expense_amount: "",
    approver_name: "",
    remarks: "",
  });

  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [paymentFile, setPaymentFile] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [remainingInvoices, setRemainingInvoices] = useState([]);

  const { data: expenses, isLoading } = useExpenses(searchQuery);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const handleInvoiceChange = (e) => {
    const files = Array.from(e.target.files);
    if (invoiceFiles.length + remainingInvoices.length + files.length > 5) {
      alert("You can upload a maximum of 5 invoices.");
      return;
    }
    setInvoiceFiles((prev) => [...prev, ...files]);
  };

  const handlePaymentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentFile(file);
    }
  };

  const removeInvoiceFile = (index) => {
    setInvoiceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingInvoice = (url) => {
    setRemainingInvoices((prev) => prev.filter((u) => u !== url));
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      expense_date: format(new Date(exp.expense_date), "yyyy-MM-dd"),
      expense_name: exp.expense_name,
      expense_category: exp.expense_category,
      expense_done_by: exp.expense_done_by,
      vendor_receiver_name: exp.vendor_receiver_name,
      expense_amount: String(exp.expense_amount),
      approver_name: exp.approver_name,
      remarks: exp.remarks || "",
    });
    setRemainingInvoices(exp.invoice_proofs || []);
    setIsOpen(true);
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setFormData({
        expense_date: format(new Date(), "yyyy-MM-dd"),
        expense_name: "",
        expense_category: "Marketing",
        expense_done_by: "",
        vendor_receiver_name: "",
        expense_amount: "",
        approver_name: "",
        remarks: "",
      });
      setInvoiceFiles([]);
      setPaymentFile(null);
      setEditingExpense(null);
      setRemainingInvoices([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    invoiceFiles.forEach((file) => {
      data.append("invoice_proof", file);
    });

    if (paymentFile) {
      data.append("payment_proof", paymentFile);
    }

    if (editingExpense) {
      data.append("remaining_invoices", JSON.stringify(remainingInvoices));
      updateExpense.mutate(
        { id: editingExpense._id, expenseData: data },
        {
          onSuccess: () => {
            handleOpenChange(false);
          },
        }
      );
    } else {
      createExpense.mutate(data, {
        onSuccess: () => {
          handleOpenChange(false);
        },
      });
    }
  };

  /* ==========================================================================
     TAB 2: DAILY ACCOUNT INFORMATION STATES & MUTATIONS
     ========================================================================== */
  const [dailySearchQuery, setDailySearchQuery] = useState("");
  const [dailyFilter, setDailyFilter] = useState("today"); // today, yesterday, week, month, custom
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [dailyFormOpen, setDailyFormOpen] = useState(false);
  const [selectedDailyEntry, setSelectedDailyEntry] = useState(null);
  const [editingDailyEntry, setEditingDailyEntry] = useState(null);

  const [dailyFormData, setDailyFormData] = useState({
    pipip_bank_balance: "",
    cash_in_hand: "",
    farhans_bank_balance: "",
    entry_type: "Morning",
    remarks: "",
  });

  const { data: dailyEntries, isLoading: dailyLoading } = useDailyAccounts({
    search: dailySearchQuery,
    filter: dailyFilter,
    startDate: dailyStartDate,
    endDate: dailyEndDate,
  });

  const getTodayLogsStatus = () => {
    if (!dailyEntries) return { morning: false, night: false, both: false };
    const todayStr = new Date().toDateString();
    const todayLogs = dailyEntries.filter(
      (entry) => new Date(entry.date).toDateString() === todayStr
    );
    const morning = todayLogs.some((l) => l.entry_type === "Morning");
    const night = todayLogs.some((l) => l.entry_type === "Night");
    return { morning, night, both: morning && night };
  };

  const todayStatus = getTodayLogsStatus();

  const createDailyAccount = useCreateDailyAccount();
  const updateDailyAccount = useUpdateDailyAccount();
  const deleteDailyAccount = useDeleteDailyAccount();

  const handleDailyFormOpenChange = (open) => {
    setDailyFormOpen(open);
    if (!open) {
      setDailyFormData({
        pipip_bank_balance: "",
        cash_in_hand: "",
        farhans_bank_balance: "",
        entry_type: "Morning",
        remarks: "",
      });
      setEditingDailyEntry(null);
    } else {
      if (!editingDailyEntry) {
        setDailyFormData((prev) => ({
          ...prev,
          entry_type: todayStatus.morning ? "Night" : "Morning",
        }));
      }
    }
  };

  const handleLogBalancesClick = () => {
    if (todayStatus.both) {
      alert("Both Morning and Night logs have already been completed for today! If you need to make corrections, please edit the existing logs below.");
      return;
    }
    handleDailyFormOpenChange(true);
  };

  const handleDailyEdit = (entry) => {
    setEditingDailyEntry(entry);
    setDailyFormData({
      pipip_bank_balance: String(entry.pipip_bank_balance),
      cash_in_hand: String(entry.cash_in_hand),
      farhans_bank_balance: String(entry.farhans_bank_balance),
      entry_type: entry.entry_type,
      remarks: entry.remarks || "",
    });
    setDailyFormOpen(true);
  };

  const handleDailySubmit = (e) => {
    e.preventDefault();

    if (editingDailyEntry) {
      updateDailyAccount.mutate(
        {
          id: editingDailyEntry._id,
          entryData: {
            ...dailyFormData,
            date: editingDailyEntry.date, // Preserve date on edit
          },
        },
        {
          onSuccess: () => {
            handleDailyFormOpenChange(false);
          },
        }
      );
    } else {
      createDailyAccount.mutate(dailyFormData, {
        onSuccess: () => {
          handleDailyFormOpenChange(false);
        },
      });
    }
  };

  const handleDailyDelete = (id) => {
    if (confirm("Are you sure you want to delete this daily account entry?")) {
      deleteDailyAccount.mutate(id);
    }
  };

  /* ==========================================================================
     TAB 3: AUTOMATED DAILY BUSINESS REPORT STATES & MUTATIONS
     ========================================================================== */
  const { data: todayReport, isLoading: todayReportLoading } = useTodayReport();
  const { data: historicalReports, isLoading: historicalReportsLoading } = useHistoricalReports();
  const { data: settingsData } = useReportSettings();
  const updateSettingsMutation = useUpdateReportSettings();

  const [emailInput, setEmailInput] = useState("");
  const [settingsForm, setSettingsForm] = useState({
    auto_send_enabled: true,
    report_time: "20:00",
    admin_emails: [],
  });

  const [hasSyncedSettings, setHasSyncedSettings] = useState(false);
  if (settingsData && !hasSyncedSettings) {
    setSettingsForm({
      auto_send_enabled: settingsData.auto_send_enabled,
      report_time: settingsData.report_time,
      admin_emails: settingsData.admin_emails || [],
    });
    setHasSyncedSettings(true);
  }

  const handleAddEmail = (e) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (settingsForm.admin_emails.includes(email)) {
      alert("This email address has already been added.");
      return;
    }
    setSettingsForm((prev) => ({
      ...prev,
      admin_emails: [...prev.admin_emails, email],
    }));
    setEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setSettingsForm((prev) => ({
      ...prev,
      admin_emails: prev.admin_emails.filter((email) => email !== emailToRemove),
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsForm);
  };

  /* ==========================================================================
     TAB 4: VEHICLE SERVICE HISTORY STATES & HANDLERS
     ========================================================================== */
  const { data: bikesList } = useBikes();
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const { data: serviceRecords, isLoading: serviceRecordsLoading } =
    useVehicleServices(serviceSearchQuery);

  const createVehicleService = useCreateVehicleService();
  const updateVehicleService = useUpdateVehicleService();
  const deleteVehicleService = useDeleteVehicleService();

  // Searchable Bike selection state
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [bikeSearchText, setBikeSearchText] = useState("");
  const [isBikeDropdownOpen, setIsBikeDropdownOpen] = useState(false);

  // Service entry form state
  const [serviceFormData, setServiceFormData] = useState({
    service_date: format(new Date(), "yyyy-MM-dd"),
    service_amount: "",
    bill_link: "",
    remarks: "",
  });
  const [serviceBillFile, setServiceBillFile] = useState(null);
  const [editingServiceRecord, setEditingServiceRecord] = useState(null);

  // Bike Timeline Modal state
  const [viewingBikeId, setViewingBikeId] = useState(null);
  const { data: bikeTimelineData, isLoading: bikeTimelineLoading } =
    useBikeServiceTimeline(viewingBikeId);

  // Currently selected bike details
  const selectedBike = bikesList?.find(
    (b) => (b._id || b.id) === selectedBikeId
  );

  // Filtered bikes for dropdown search
  const filteredBikesForSelect = bikesList?.filter((b) => {
    const q = bikeSearchText.toLowerCase();
    const name = (b.bike_name || "").toLowerCase();
    const model = (b.model || "").toLowerCase();
    const plate = (b.number_plate || "").toLowerCase();
    return name.includes(q) || model.includes(q) || plate.includes(q);
  });

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBikeId) {
      alert("Please select a bike/vehicle from the dropdown.");
      return;
    }
    if (
      !serviceFormData.service_amount ||
      Number(serviceFormData.service_amount) <= 0
    ) {
      alert("Please enter a valid service amount.");
      return;
    }

    const payload = new FormData();
    payload.append("bike_id", selectedBikeId);
    payload.append("service_date", serviceFormData.service_date);
    payload.append("service_amount", serviceFormData.service_amount);
    payload.append("remarks", serviceFormData.remarks || "");

    if (serviceBillFile) {
      payload.append("bill_file", serviceBillFile);
    } else if (serviceFormData.bill_link) {
      payload.append("bill_link", serviceFormData.bill_link);
    }

    if (editingServiceRecord) {
      await updateVehicleService.mutateAsync({
        id: editingServiceRecord._id,
        serviceData: payload,
      });
      setEditingServiceRecord(null);
    } else {
      await createVehicleService.mutateAsync(payload);
    }

    // Reset Form & Clear Selection
    setSelectedBikeId("");
    setBikeSearchText("");
    setServiceFormData({
      service_date: format(new Date(), "yyyy-MM-dd"),
      service_amount: "",
      bill_link: "",
      remarks: "",
    });
    setServiceBillFile(null);
    setEditingServiceRecord(null);
  };

  const handleEditServiceRecord = (rec) => {
    setEditingServiceRecord(rec);
    const bikeId = rec.bike_id?._id || rec.bike_id;
    setSelectedBikeId(bikeId);
    setServiceFormData({
      service_date: format(new Date(rec.service_date), "yyyy-MM-dd"),
      service_amount: String(rec.service_amount),
      bill_link: rec.bill_link || "",
      remarks: rec.remarks || "",
    });
    setServiceBillFile(null);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteServiceRecord = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle service log?")) {
      await deleteVehicleService.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-display text-gradient-sunset">Expenses & Account Tracking</h1>
        <p className="text-muted-foreground">Manage claims and track daily operational balance logs</p>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-border gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("claims")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap ${
            activeTab === "claims"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expense Claims
          {activeTab === "claims" && (
            <motion.span
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            />
          )}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("daily_account")}
              className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap ${
                activeTab === "daily_account"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Account Information
              {activeTab === "daily_account" && (
                <motion.span
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("daily_report")}
              className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap ${
                activeTab === "daily_report"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Report
              {activeTab === "daily_report" && (
                <motion.span
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("service_history")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap ${
            activeTab === "service_history"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Vehicle Service History
          {activeTab === "service_history" && (
            <motion.span
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {(activeTab === "claims" || (!isAdmin && activeTab !== "service_history" && activeTab !== "daily_account")) && (
          <motion.div
            key="claims-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Claims Actions bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, category, receiver, date (YYYY-MM-DD)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

              <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="gradient-sunset text-primary-foreground shadow-golden w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-2xl font-display">
                      {editingExpense ? "Edit Operational Expense" : "Add Operational Expense"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expense Date</Label>
                        <Input
                          type="date"
                          value={formData.expense_date}
                          onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expense Category</Label>
                        <select
                          value={formData.expense_category}
                          onChange={(e) => setFormData({ ...formData, expense_category: e.target.value })}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Expense Title / Name</Label>
                      <Input
                        placeholder="e.g. Fuel refills, Office supplies"
                        value={formData.expense_name}
                        onChange={(e) => setFormData({ ...formData, expense_name: e.target.value })}
                        required
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expense Done By</Label>
                        <Input
                          placeholder="Staff/Admin name"
                          value={formData.expense_done_by}
                          onChange={(e) => setFormData({ ...formData, expense_done_by: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Approver Name</Label>
                        <Input
                          placeholder="Manager/Approver name"
                          value={formData.approver_name}
                          onChange={(e) => setFormData({ ...formData, approver_name: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vendor / Receiver Name</Label>
                        <Input
                          placeholder="Receiver party name"
                          value={formData.vendor_receiver_name}
                          onChange={(e) => setFormData({ ...formData, vendor_receiver_name: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expense Amount (INR)</Label>
                        <Input
                          type="number"
                          placeholder="Amount in ₹"
                          value={formData.expense_amount}
                          onChange={(e) => setFormData({ ...formData, expense_amount: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    {/* Invoice upload */}
                    <div className="space-y-2">
                      <Label>Invoice or Other Proofs (Max 5 files)</Label>
                      <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleInvoiceChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Click or Drag images here (Max 10MB per file)</p>
                      </div>
                      {(remainingInvoices.length > 0 || invoiceFiles.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {remainingInvoices.map((url, index) => (
                            <div key={`existing-${index}`} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full text-xs text-primary">
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">Existing Proof #{index + 1}</span>
                              <button type="button" onClick={() => removeExistingInvoice(url)} className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {invoiceFiles.map((file, index) => (
                            <div key={`new-${index}`} className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs">
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">{file.name}</span>
                              <button type="button" onClick={() => removeInvoiceFile(index)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payment Proof upload */}
                    <div className="space-y-2">
                      <Label>Payment Proof or Screenshot (Max 1 file)</Label>
                      <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePaymentChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {paymentFile ? `Selected: ${paymentFile.name}` : "Click or Drag image here (Max 10MB)"}
                        </p>
                      </div>
                      {editingExpense?.payment_proof && !paymentFile && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Has existing payment proof. Upload new to replace.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks (Optional)</Label>
                      <textarea
                        placeholder="Additional context or notes..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-sunset text-primary-foreground shadow-golden mt-4 font-bold"
                      disabled={createExpense.isPending || updateExpense.isPending}
                    >
                      {(createExpense.isPending || updateExpense.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingExpense ? "Update Expense Claim" : "Submit Expense Claim"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Claims Grid Listing */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : expenses?.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Expenses Found</h3>
                <p className="text-sm">Submit your first expense claim using the button above.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {expenses?.map((exp) => (
                  <Card
                    key={exp._id}
                    className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedExpense(exp)}
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <Badge className="bg-primary/10 text-primary border-none">
                            {exp.expense_category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            {format(new Date(exp.expense_date), "PP")}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                            {exp.expense_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Receiver: <span className="text-foreground/80 font-medium">{exp.vendor_receiver_name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            Amount
                          </p>
                          <p className="text-xl font-black text-foreground">
                            ₹{exp.expense_amount}
                          </p>
                        </div>

                        <div className="flex gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(exp);
                            }}
                            className="border-border gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button size="xs" variant="ghost" className="text-primary gap-1">
                            <Eye className="w-4 h-4" /> View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Claim details overlay */}
            <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
              {selectedExpense && (
                <DialogContent className="bg-card border-border max-w-md rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-2xl font-display">Expense Details</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">Expense Category</span>
                        <Badge className="bg-primary/10 text-primary border-none text-xs font-semibold mt-1">
                          {selectedExpense.expense_category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">Date</span>
                        <span className="font-medium text-foreground text-sm flex items-center gap-1 justify-end mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(selectedExpense.expense_date), "PPP")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Expense Name / Title</span>
                        <span className="font-bold text-foreground text-base">{selectedExpense.expense_name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">Done By</span>
                          <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {selectedExpense.expense_done_by}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Approver Name</span>
                          <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                            {selectedExpense.approver_name}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">Vendor / Receiver Name</span>
                          <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            {selectedExpense.vendor_receiver_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Created By (System User)</span>
                          <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {selectedExpense.created_by?.fullName || "Staff"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground block">Expense Amount</span>
                        <span className="font-black text-2xl text-foreground">₹{selectedExpense.expense_amount}</span>
                      </div>

                      {selectedExpense.remarks && (
                        <div className="bg-muted/50 p-3 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground block mb-1">Remarks / Notes</span>
                          <span className="text-foreground leading-relaxed">{selectedExpense.remarks}</span>
                        </div>
                      )}

                      {selectedExpense.invoice_proofs?.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground block">Invoice & Proof Attachments</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedExpense.invoice_proofs.map((proof, idx) => (
                              <a
                                key={idx}
                                href={proof}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl text-xs transition"
                              >
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <span>Invoice Proof #{idx + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedExpense.payment_proof && (
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground block">Payment Screenshot</span>
                          <a
                            href={selectedExpense.payment_proof}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl text-xs w-fit transition"
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span>View Payment Proof</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const exp = selectedExpense;
                          setSelectedExpense(null);
                          handleEdit(exp);
                        }}
                        className="flex-1 border-border gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Edit Record
                      </Button>
                      <Button onClick={() => setSelectedExpense(null)} className="flex-1 gradient-sunset text-white">
                        Close Detail Card
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </motion.div>
        )}

        {activeTab === "daily_account" && (
          /* ==========================================================================
             TAB 2: DAILY ACCOUNT INFORMATION UI
             ========================================================================== */
          <motion.div
            key="accounts-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Daily Account Actions & Filters Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Search Bar */}
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Date (YYYY-MM-DD)..."
                    value={dailySearchQuery}
                    onChange={(e) => setDailySearchQuery(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>

                {/* Preset filter select */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Filter Range:</Label>
                  <select
                    value={dailyFilter}
                    onChange={(e) => setDailyFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-border bg-input text-foreground text-xs focus:outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Custom Date Pickers */}
                {dailyFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={dailyStartDate}
                      onChange={(e) => setDailyStartDate(e.target.value)}
                      className="bg-input border-border text-xs h-10 w-36"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="date"
                      value={dailyEndDate}
                      onChange={(e) => setDailyEndDate(e.target.value)}
                      className="bg-input border-border text-xs h-10 w-36"
                    />
                  </div>
                )}
              </div>

              {/* Form Dialog */}
              <Dialog open={dailyFormOpen} onOpenChange={handleDailyFormOpenChange}>
                <Button
                  onClick={handleLogBalancesClick}
                  className="gradient-sunset text-primary-foreground shadow-golden shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Balances
                </Button>

                <DialogContent className="bg-card border-border max-w-md rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-2xl font-display">
                      {editingDailyEntry ? "Edit Account Balances" : "Log Account Balances"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleDailySubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <Label>Pipip Bank Account Balance (INR)</Label>
                      <Input
                        type="number"
                        placeholder="Balance in ₹"
                        value={dailyFormData.pipip_bank_balance}
                        onChange={(e) => setDailyFormData({ ...dailyFormData, pipip_bank_balance: e.target.value })}
                        required
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cash in Hand (INR)</Label>
                        <Input
                          type="number"
                          placeholder="Amount in ₹"
                          value={dailyFormData.cash_in_hand}
                          onChange={(e) => setDailyFormData({ ...dailyFormData, cash_in_hand: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Farhan's Bank Balance (INR)</Label>
                        <Input
                          type="number"
                          placeholder="Balance in ₹"
                          value={dailyFormData.farhans_bank_balance}
                          onChange={(e) => setDailyFormData({ ...dailyFormData, farhans_bank_balance: e.target.value })}
                          required
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entry Type / Shift</Label>
                      <select
                        value={dailyFormData.entry_type}
                        onChange={(e) => setDailyFormData({ ...dailyFormData, entry_type: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none"
                      >
                        <option value="Morning" disabled={todayStatus.morning && editingDailyEntry?.entry_type !== "Morning"}>
                          Morning {todayStatus.morning ? "(Completed)" : ""}
                        </option>
                        <option value="Night" disabled={todayStatus.night && editingDailyEntry?.entry_type !== "Night"}>
                          Night {todayStatus.night ? "(Completed)" : ""}
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks (Optional)</Label>
                      <textarea
                        placeholder="Additional remarks..."
                        value={dailyFormData.remarks}
                        onChange={(e) => setDailyFormData({ ...dailyFormData, remarks: e.target.value })}
                        rows={2.5}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none placeholder:text-muted-foreground font-medium"
                      />
                    </div>

                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-[10px] text-muted-foreground leading-normal flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Notice:</strong> Your current local date, time, and login email ({user?.email}) will be tracked and attached automatically as the creation stamp.
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-sunset text-primary-foreground shadow-golden font-bold"
                      disabled={createDailyAccount.isPending || updateDailyAccount.isPending}
                    >
                      {(createDailyAccount.isPending || updateDailyAccount.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Save Log
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Daily Account Log entries list */}
            {dailyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : dailyEntries?.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Entries Found</h3>
                <p className="text-sm">There are no operational balances logged for this range selection.</p>
              </Card>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm">
                  <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                    <thead className="bg-muted/50 text-foreground text-xs uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Shift Type</th>
                        <th className="px-6 py-4">Pipip Bank</th>
                        <th className="px-6 py-4">Cash In Hand</th>
                        <th className="px-6 py-4">Farhan's Bank</th>
                        <th className="px-6 py-4">Filled By</th>
                        <th className="px-6 py-4">Logged Time</th>
                        <th className="px-6 py-4">Last Updated</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dailyEntries?.map((entry) => (
                        <tr key={entry._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {format(new Date(entry.date), "PP")}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`border ${
                                entry.entry_type === "Morning"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                              }`}
                            >
                              {entry.entry_type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">₹{entry.pipip_bank_balance}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">₹{entry.cash_in_hand}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">₹{entry.farhans_bank_balance}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">{entry.filled_by?.fullName || "Staff"}</td>
                          <td className="px-6 py-4 font-semibold">{entry.time}</td>
                          <td className="px-6 py-4 text-xs">{format(new Date(entry.updatedAt), "PPp")}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setSelectedDailyEntry(entry)}
                                className="border-border gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleDailyEdit(entry)}
                                className="border-border gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </Button>
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => handleDailyDelete(entry._id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="block md:hidden space-y-4">
                  {dailyEntries?.map((entry) => (
                    <Card key={entry._id} className="bg-card border-border shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground text-sm">
                            {format(new Date(entry.date), "PP")}
                          </span>
                          <Badge
                            className={`border ${
                              entry.entry_type === "Morning"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            }`}
                          >
                            {entry.entry_type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block uppercase">Pipip</span>
                            <span className="font-bold text-foreground">₹{entry.pipip_bank_balance}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block uppercase">Cash</span>
                            <span className="font-bold text-foreground">₹{entry.cash_in_hand}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block uppercase">Farhan</span>
                            <span className="font-bold text-foreground">₹{entry.farhans_bank_balance}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pt-3 border-t border-border/60">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setSelectedDailyEntry(entry)}
                            className="border-border gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleDailyEdit(entry)}
                            className="border-border gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleDailyDelete(entry._id)}
                            className="gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Daily balance detail overlay */}
            <Dialog open={!!selectedDailyEntry} onOpenChange={(open) => !open && setSelectedDailyEntry(null)}>
              {selectedDailyEntry && (
                <DialogContent className="bg-card border-border max-w-sm rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-2xl font-display">Daily Account Log</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">Shift type</span>
                        <Badge
                          className={`border mt-1 ${
                            selectedDailyEntry.entry_type === "Morning"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                          }`}
                        >
                          {selectedDailyEntry.entry_type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">Log Date</span>
                        <span className="font-semibold text-foreground text-sm flex items-center gap-1 justify-end mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(selectedDailyEntry.date), "PPP")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-sm">
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/60 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Pipip Bank</span>
                          <span className="font-bold text-foreground">₹{selectedDailyEntry.pipip_bank_balance}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Cash in Hand</span>
                          <span className="font-bold text-foreground">₹{selectedDailyEntry.cash_in_hand}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Farhan's Bank</span>
                          <span className="font-bold text-foreground">₹{selectedDailyEntry.farhans_bank_balance}</span>
                        </div>
                        <div className="border-t border-border/80 pt-2 flex justify-between items-center font-bold text-foreground">
                          <span className="text-xs text-muted-foreground font-semibold">Total Funds</span>
                          <span className="text-primary text-base font-black">
                            ₹
                            {Number(selectedDailyEntry.pipip_bank_balance) +
                              Number(selectedDailyEntry.cash_in_hand) +
                              Number(selectedDailyEntry.farhans_bank_balance)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">Time Recorded</span>
                          <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {selectedDailyEntry.time}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Filled By</span>
                          <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {selectedDailyEntry.filled_by?.fullName || "Staff"}
                          </span>
                        </div>
                      </div>

                      {selectedDailyEntry.remarks && (
                        <div className="bg-muted/50 p-3 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground block mb-1">Remarks / Notes</span>
                          <span className="text-foreground leading-relaxed">{selectedDailyEntry.remarks}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const entry = selectedDailyEntry;
                          setSelectedDailyEntry(null);
                          handleDailyEdit(entry);
                        }}
                        className="flex-1 border-border gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button onClick={() => setSelectedDailyEntry(null)} className="flex-1 gradient-sunset text-white">
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </motion.div>
        )}

        {/* TAB 3: DAILY BUSINESS AUTOMATED REPORT */}
        {isAdmin && activeTab === "daily_report" && (
          <motion.div
            key="reports-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left/Middle Column: Today's Report Card + Historical List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's automated live snapshot card */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <div>
                      <h2 className="text-xl font-bold text-foreground font-display">Today's Live Report</h2>
                      <p className="text-xs text-muted-foreground">Automatically calculated in real-time</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none">
                      {format(new Date(), "PPP")}
                    </Badge>
                  </div>

                  {todayReportLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : todayReport ? (
                    <div className="grid sm:grid-cols-3 gap-4 pt-2">
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/60">
                        <span className="text-xs text-muted-foreground block mb-1">Total Expense</span>
                        <span className="text-2xl font-black text-foreground">{formatCurrency(todayReport.total_expense)}</span>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/60">
                        <span className="text-xs text-muted-foreground block mb-1">Total Amount Received</span>
                        <span className="text-2xl font-black text-foreground">{formatCurrency(todayReport.total_amount_received)}</span>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/60">
                        <span className="text-xs text-muted-foreground block mb-1">Deposit Amount (Float)</span>
                        <span className="text-2xl font-black text-foreground">{formatCurrency(todayReport.deposit_amount)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Failed to calculate report metrics</p>
                  )}
                </div>
              </Card>

              {/* Historical list */}
              <div>
                <h3 className="text-lg font-bold text-foreground font-display mb-4">Historical Daily Reports</h3>
                {historicalReportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : historicalReports?.length === 0 ? (
                  <Card className="bg-card border-border p-8 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-base font-semibold text-foreground mb-1">No Historical Reports Found</h4>
                    <p className="text-sm">Reports will be saved automatically at the end of the day based on your settings.</p>
                  </Card>
                ) : (
                  <>
                    {/* Desktop Historical Table */}
                    <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm">
                      <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                        <thead className="bg-muted/50 text-foreground text-xs uppercase tracking-wider font-bold">
                          <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total Expense</th>
                            <th className="px-6 py-4">Amount Received</th>
                            <th className="px-6 py-4">Deposit Amount (Float)</th>
                            <th className="px-6 py-4">Generated At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {historicalReports?.map((report) => (
                            <tr key={report._id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground">
                                {format(new Date(report.date), "PP")}
                              </td>
                              <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(report.total_expense)}</td>
                              <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(report.total_amount_received)}</td>
                              <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(report.deposit_amount)}</td>
                              <td className="px-6 py-4 text-xs">{format(new Date(report.generated_at), "PPp")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Historical Cards */}
                    <div className="block md:hidden space-y-4">
                      {historicalReports?.map((report) => (
                        <Card key={report._id} className="bg-card border-border shadow-sm">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground text-sm">
                                {format(new Date(report.date), "PP")}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(report.generated_at), "p")}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground block uppercase">Expense</span>
                                <span className="font-bold text-foreground">{formatCurrency(report.total_expense)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block uppercase">Received</span>
                                <span className="font-bold text-foreground">{formatCurrency(report.total_amount_received)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block uppercase">Deposit</span>
                                <span className="font-bold text-foreground">{formatCurrency(report.deposit_amount)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Settings Panel */}
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground font-display">Report Settings</h3>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    {/* Send toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Automatic Email Reports</Label>
                        <p className="text-xs text-muted-foreground">Send daily metrics automatically</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.auto_send_enabled}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            auto_send_enabled: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </div>

                    {/* Report Time */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Daily Send Time</Label>
                      <Input
                        type="time"
                        value={settingsForm.report_time}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            report_time: e.target.value,
                          }))
                        }
                        required
                        className="bg-input border-border text-sm"
                      />
                    </div>

                    {/* Admin Emails list */}
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold">Admin Email Addresses</Label>

                      {/* Add email form row */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. admin@example.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="bg-input border-border text-xs flex-1"
                        />
                        <Button type="button" onClick={handleAddEmail} size="sm" className="gradient-sunset text-white">
                          Add
                        </Button>
                      </div>

                      {/* Registered list rendering */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {settingsForm.admin_emails.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">No admin emails added.</p>
                        ) : (
                          settingsForm.admin_emails.map((email) => (
                            <div key={email} className="flex justify-between items-center bg-muted/30 border border-border px-3 py-1.5 rounded-xl text-xs">
                              <span className="font-semibold text-foreground flex items-center gap-1.5 truncate flex-1 mr-2">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{email}</span>
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleRemoveEmail(email)}
                                className="text-destructive hover:bg-destructive/10 p-1 h-auto shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-sunset text-primary-foreground shadow-golden font-bold"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Configuration
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 4: VEHICLE SERVICE HISTORY */}
        {activeTab === "service_history" && (
          <motion.div
            key="service-history-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            {/* 1. Form Card & Vehicle Stats Header */}
            <Card className="bg-card/50 border-border p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-primary" />
                    Record Vehicle Service
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select a bike to auto-fetch total service expense and record latest service details.
                  </p>
                </div>
                {editingServiceRecord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingServiceRecord(null);
                      setSelectedBikeId("");
                      setServiceFormData({
                        service_date: format(new Date(), "yyyy-MM-dd"),
                        service_amount: "",
                        bill_link: "",
                        remarks: "",
                      });
                      setServiceBillFile(null);
                    }}
                    className="text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    Cancel Editing
                  </Button>
                )}
              </div>

              <form onSubmit={handleServiceFormSubmit} className="space-y-6">
                {/* Searchable Bike Dropdown */}
                <div className="space-y-2 relative">
                  <Label htmlFor="bike_select" className="text-sm font-semibold text-foreground flex items-center justify-between">
                    <span>Select Vehicle / Bike *</span>
                    {selectedBike && (
                      <span className="text-xs text-primary font-bold">
                        Selected: {selectedBike.bike_name || selectedBike.model} ({selectedBike.number_plate})
                      </span>
                    )}
                  </Label>

                  {/* Combobox Trigger & Search Popup */}
                  <div className="relative">
                    <div
                      onClick={() => setIsBikeDropdownOpen(!isBikeDropdownOpen)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {selectedBike?.image_url ? (
                          <img
                            src={selectedBike.image_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          {selectedBike ? (
                            <p className="text-sm font-bold text-foreground">
                              {selectedBike.bike_name || selectedBike.model}{" "}
                              <span className="text-xs font-mono text-muted-foreground">({selectedBike.number_plate})</span>
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Search and select a bike by name or plate...</p>
                          )}
                        </div>
                      </div>
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Dropdown Menu Overlay */}
                    {isBikeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-72 flex flex-col">
                        <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-2">
                          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                          <input
                            type="text"
                            placeholder="Type bike name or number plate (e.g. Activa, MH12)..."
                            value={bikeSearchText}
                            onChange={(e) => setBikeSearchText(e.target.value)}
                            autoFocus
                            className="w-full bg-transparent border-none text-xs text-foreground focus:outline-none"
                          />
                          {bikeSearchText && (
                            <button
                              type="button"
                              onClick={() => setBikeSearchText("")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-border/50">
                          {filteredBikesForSelect?.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No matching vehicles found.</p>
                          ) : (
                            filteredBikesForSelect?.map((b) => {
                              const bId = b._id || b.id;
                              const isSel = bId === selectedBikeId;
                              return (
                                <div
                                  key={bId}
                                  onClick={() => {
                                    setSelectedBikeId(bId);
                                    setIsBikeDropdownOpen(false);
                                  }}
                                  className={`p-3 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors ${
                                    isSel ? "bg-primary/15 border-l-4 border-primary" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {b.image_url ? (
                                      <img src={b.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                                        {b.number_plate?.substring(0, 4)}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{b.bike_name || b.model}</p>
                                      <p className="text-xs text-muted-foreground font-mono">{b.number_plate}</p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-xs font-bold text-emerald-400">
                                      Total Spent: ₹{b.bike_expenses || 0}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Last Service: {b.last_service_date ? format(new Date(b.last_service_date), "dd MMM yyyy") : "—"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-fetched Bike Info Card */}
                {selectedBike && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Selected Vehicle</p>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        {selectedBike.bike_name || selectedBike.model} ({selectedBike.number_plate})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Last Service Date</p>
                      <p className="text-base font-bold text-amber-400 mt-0.5">
                        {selectedBike.last_service_date
                          ? format(new Date(selectedBike.last_service_date), "dd MMMM yyyy")
                          : "No previous service recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Amount Till Now</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">
                        {formatCurrency(selectedBike.bike_expenses || 0)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="service_date" className="text-xs font-semibold">Service Date *</Label>
                    <Input
                      id="service_date"
                      type="date"
                      value={serviceFormData.service_date}
                      onChange={(e) =>
                        setServiceFormData((prev) => ({
                          ...prev,
                          service_date: e.target.value,
                        }))
                      }
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_amount" className="text-xs font-semibold">Latest Service Amount (₹) *</Label>
                    <Input
                      id="service_amount"
                      type="number"
                      placeholder="e.g. 1500"
                      value={serviceFormData.service_amount}
                      onChange={(e) =>
                        setServiceFormData((prev) => ({
                          ...prev,
                          service_amount: e.target.value,
                        }))
                      }
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                {/* Bill Link / Proof File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="bill_file" className="text-xs font-semibold">Bill Invoice Proof (Upload File)</Label>
                    <Input
                      id="bill_file"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setServiceBillFile(e.target.files[0] || null)}
                      className="bg-input border-border cursor-pointer text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bill_link" className="text-xs font-semibold">Or Bill Invoice Link / URL</Label>
                    <Input
                      id="bill_link"
                      type="url"
                      placeholder="https://drive.google.com/... or bill link"
                      value={serviceFormData.bill_link}
                      onChange={(e) =>
                        setServiceFormData((prev) => ({
                          ...prev,
                          bill_link: e.target.value,
                        }))
                      }
                      className="bg-input border-border text-xs"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="service_remarks" className="text-xs font-semibold">Remarks / Work Done Details (Optional)</Label>
                  <Input
                    id="service_remarks"
                    placeholder="e.g. Oil change, brake pad replacement, general tuning..."
                    value={serviceFormData.remarks}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        remarks: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createVehicleService.isPending || updateVehicleService.isPending}
                  className="w-full gradient-sunset text-primary-foreground font-bold shadow-golden py-3 text-base"
                >
                  {(createVehicleService.isPending || updateVehicleService.isPending) && (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  )}
                  {editingServiceRecord ? "Update Vehicle Service Log" : "Save Vehicle Service Log"}
                </Button>
              </form>
            </Card>

            {/* 2. Service Logs Table Header & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Service History Log Records</h3>
                <p className="text-xs text-muted-foreground">All recorded services for company vehicles</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by bike name, number plate..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border text-xs"
                />
              </div>
            </div>

            {/* Service Records Table */}
            <Card className="bg-card/40 border-border overflow-hidden rounded-2xl">
              {serviceRecordsLoading ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p>Loading vehicle service logs...</p>
                </div>
              ) : serviceRecords?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-base font-semibold">No service history records found</p>
                  <p className="text-xs mt-1">Select a bike above and submit a service log to record your first entry.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card List View (Visible on small screens) */}
                  <div className="block md:hidden divide-y divide-border/60 p-4 space-y-4">
                    {serviceRecords?.map((rec) => {
                      const bike = rec.bike_id;
                      const bikeId = bike?._id || bike?.id;
                      return (
                        <div
                          key={rec._id}
                          className="bg-card/70 border border-border p-4 rounded-2xl space-y-3 shadow-md"
                        >
                          {/* Header: Bike Info & Actions */}
                          <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                            <div className="flex items-center gap-3">
                              {bike?.image_url ? (
                                <img
                                  src={bike.image_url}
                                  alt=""
                                  className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                  <Wrench className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-foreground text-sm">
                                  {bike?.bike_name || bike?.model || "Unknown Bike"}
                                </p>
                                <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 inline-block mt-0.5">
                                  {bike?.number_plate || "—"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleEditServiceRecord(rec)}
                                className="text-muted-foreground hover:text-foreground p-1.5 h-8 w-8"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleDeleteServiceRecord(rec._id)}
                                className="text-destructive hover:bg-destructive/10 p-1.5 h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl text-xs">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Service Date</p>
                              <p className="font-bold text-foreground mt-0.5">
                                {format(new Date(rec.service_date), "dd MMM yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Service Amount</p>
                              <p className="font-bold text-amber-400 mt-0.5">
                                {formatCurrency(rec.service_amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Amount Till Now</p>
                              <p className="font-black text-emerald-400 mt-0.5">
                                {formatCurrency(bike?.bike_expenses || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Logged By</p>
                              <p className="font-medium text-muted-foreground mt-0.5 truncate">
                                {rec.recorded_by?.fullName || "Admin"}
                              </p>
                            </div>
                          </div>

                          {/* Remarks if available */}
                          {rec.remarks && (
                            <p className="text-xs text-muted-foreground bg-muted/10 p-2.5 rounded-xl border border-border/40">
                              <strong>Notes:</strong> {rec.remarks}
                            </p>
                          )}

                          {/* Footer: Proof Link & Full History Trigger */}
                          <div className="flex items-center justify-between pt-1 gap-2">
                            {rec.bill_link ? (
                              <a
                                href={rec.bill_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20"
                              >
                                <Paperclip className="w-3.5 h-3.5" /> Proof
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">No proof attached</span>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingBikeId(bikeId)}
                              className="text-xs border-primary/40 text-primary hover:bg-primary/10 font-bold rounded-xl"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View History
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View (Visible on medium and larger screens) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                        <tr>
                          <th className="py-3.5 px-4">Vehicle</th>
                          <th className="py-3.5 px-4">Service Date</th>
                          <th className="py-3.5 px-4">Service Amount</th>
                          <th className="py-3.5 px-4">Total Amount Till Now</th>
                          <th className="py-3.5 px-4">Bill Proof</th>
                          <th className="py-3.5 px-4">Logged By</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {serviceRecords?.map((rec) => {
                          const bike = rec.bike_id;
                          const bikeId = bike?._id || bike?.id;
                          return (
                            <tr key={rec._id} className="hover:bg-muted/20 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {bike?.image_url ? (
                                    <img src={bike.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-border" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                      <Wrench className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-foreground">{bike?.bike_name || bike?.model || "Unknown Bike"}</p>
                                    <p className="text-xs font-mono text-primary font-semibold">{bike?.number_plate || "—"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-foreground">
                                {format(new Date(rec.service_date), "dd MMM yyyy")}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-amber-400">
                                {formatCurrency(rec.service_amount)}
                              </td>
                              <td className="py-3.5 px-4 font-black text-emerald-400">
                                {formatCurrency(bike?.bike_expenses || 0)}
                              </td>
                              <td className="py-3.5 px-4">
                                {rec.bill_link ? (
                                  <a
                                    href={rec.bill_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" /> View Proof
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-muted-foreground">
                                {rec.recorded_by?.fullName || "Admin"}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewingBikeId(bikeId)}
                                  className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" /> View History
                                </Button>

                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleEditServiceRecord(rec)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleDeleteServiceRecord(rec._id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>

            {/* Bike Timeline Dialog Modal */}
            {viewingBikeId && (
              <Dialog open={!!viewingBikeId} onOpenChange={() => setViewingBikeId(null)}>
                <DialogContent className="max-w-3xl bg-card border-border max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Vehicle Service Timeline History
                    </DialogTitle>
                  </DialogHeader>

                  {bikeTimelineLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Fetching vehicle timeline history...
                    </div>
                  ) : bikeTimelineData ? (
                    <div className="space-y-6 pt-2">
                      {/* Vehicle Header Card */}
                      <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {bikeTimelineData.bike?.image_url && (
                            <img
                              src={bikeTimelineData.bike.image_url}
                              alt=""
                              className="w-14 h-14 rounded-2xl object-cover border border-border"
                            />
                          )}
                          <div>
                            <h4 className="text-lg font-bold text-foreground">
                              {bikeTimelineData.bike?.bike_name || bikeTimelineData.bike?.model}
                            </h4>
                            <p className="text-xs font-mono text-primary font-bold">
                              {bikeTimelineData.bike?.number_plate}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-right">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Spent</p>
                            <p className="text-lg font-black text-emerald-400">
                              {formatCurrency(bikeTimelineData.total_service_expenses)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Last Service</p>
                            <p className="text-sm font-bold text-amber-400 mt-0.5">
                              {bikeTimelineData.last_service_date
                                ? format(new Date(bikeTimelineData.last_service_date), "dd MMM yyyy")
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline entries list */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
                          All Recorded Services ({bikeTimelineData.total_service_count})
                        </h5>

                        {bikeTimelineData.logs?.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">No service logs found for this vehicle.</p>
                        ) : (
                          <div className="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-6">
                            {bikeTimelineData.logs?.map((log, index) => (
                              <div key={log._id} className="relative">
                                {/* Bullet indicator */}
                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-card" />

                                <div className="bg-card/60 border border-border p-4 rounded-2xl space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                      {index === 0 ? "Latest Service" : `Service #${bikeTimelineData.logs.length - index}`}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {format(new Date(log.service_date), "dd MMMM yyyy")}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-black text-emerald-400">
                                      Amount Paid: {formatCurrency(log.service_amount)}
                                    </p>
                                    {log.bill_link && (
                                      <a
                                        href={log.bill_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                                      >
                                        <Paperclip className="w-3.5 h-3.5" /> View Proof / Bill
                                      </a>
                                    )}
                                  </div>

                                  {log.remarks && (
                                    <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/40">
                                      <strong>Notes:</strong> {log.remarks}
                                    </p>
                                  )}

                                  <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between border-t border-border/40">
                                    <span>Recorded by: {log.recorded_by?.fullName || "Admin"}</span>
                                    <span>Logged at: {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}