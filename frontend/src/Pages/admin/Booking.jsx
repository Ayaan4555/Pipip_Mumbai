// import { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { Card, CardContent } from "../../components/ui/card";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import { Textarea } from "../../components/ui/textarea";
// import { ScrollArea } from "../../components/ui/scroll-area";
// import { Button } from "../../components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "../../components/ui/dialog";
// import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

// // import { useAuth } from "../lib/auth";
// import {
//   Plus,
//   Search,
//   Phone,
//   Calendar,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Play,
//   Edit,
//   Upload,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";
// import { Badge } from "../../components/ui/badge";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { useBikes } from "../../hooks/useBikes";
// import {
//   useBookings,
//   useUpdateBookingStatus,
//   useAdminCreateBooking,
//   useUpdateBooking,
// } from "../../hooks/useBooking";
// import {
//   useCustomers,
//   useCreateCustomer,
//   useUpdateCustomer,
// } from "../../hooks/useCustomer";
// import { useBikeAvailability } from "../../hooks/useBikeAvailability";
// import { useEffect } from "react";

// const statusColors = {
//   pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
//   confirmed: "bg-blue-100 text-blue-800 border-blue-300",
//   active: "bg-green-100 text-green-800 border-green-300",
//   completed: "bg-gray-100 text-gray-800 border-gray-300",
//   cancelled: "bg-red-100 text-red-800 border-red-300",
// };

// const statusActions = {
//   pending: [
//     {
//       next: "confirmed",
//       label: "Confirm",
//       icon: <CheckCircle className="w-4 h-4" />,
//     },
//     {
//       next: "cancelled",
//       label: "Cancel",
//       icon: <XCircle className="w-4 h-4" />,
//     },
//   ],
//   confirmed: [
//     {
//       next: "active",
//       label: "Start Rental",
//       icon: <Play className="w-4 h-4" />,
//     },
//     {
//       next: "cancelled",
//       label: "Cancel",
//       icon: <XCircle className="w-4 h-4" />,
//     },
//   ],
//   active: [
//     {
//       next: "completed",
//       label: "Complete",
//       icon: <CheckCircle className="w-4 h-4" />,
//     },
//   ],
//   completed: [],
//   cancelled: [],
// };

// export default function Bookings() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [editingBooking, setEditingBooking] = useState(null);
//   const [editTimeData, setEditTimeData] = useState({
//     start_datetime: "",
//     end_datetime: "",
//   });
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [aadhaarPreview, setAadhaarPreview] = useState(null);
//   const aadhaarInputRef = useRef(null);

//   const [licensePreview, setLicensePreview] = useState(null);
//   const LicenseInputRef = useRef(null);

//   const { data: bookings, isLoading } = useBookings(activeTab);

//   const { data: bikes } = useBikes();
//   const { data: customers } = useCustomers();

//   const updateStatus = useUpdateBookingStatus();
//   const createBooking = useAdminCreateBooking();
//   const updateBooking = useUpdateBooking();
//   const createCustomer = useCreateCustomer();
//   const updateCustomer = useUpdateCustomer();
//   // const { user } = useAuth();

//   const [availabilityMessage, setAvailabilityMessage] = useState(null);
//   const [isAvailable, setIsAvailable] = useState(null);
//   const { checkAvailability, checking } = useBikeAvailability(); // Assuming you use the same hook

//   const uploading = false;
//   const progress = 0;

//   const [newBooking, setNewBooking] = useState({
//     bike_id: "",
//     customer_id: "",
//     start_datetime: "",
//     end_datetime: "",
//     notes: "",
//     customer_name: "",
//     customer_phone: "",
//     customer_email: "",
//     is_new_customer: false,
//     aadhaar_image: null,
//     license_image: null,
//   });
// const filteredBookings = bookings
//   ?.filter((booking) => {
//     if (activeTab === "all") return true;
//     return booking.status === activeTab;
//   })
//   ?.filter((booking) => {
//     if (!searchQuery) return true;

//     const query = searchQuery.toLowerCase();
//     return (
//       booking.customers?.name?.toLowerCase().includes(query) ||
//       booking.customers?.phone?.includes(query) ||
//       booking.bikes?.model?.toLowerCase().includes(query) ||
//       booking.bikes?.number_plate?.toLowerCase().includes(query)
//     );
//   });

//   const handleStatusUpdate = async (bookingId, newStatus) => {
//     await updateStatus.mutateAsync({ id: bookingId, status: newStatus });
//   };

//   const handleAadhaarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setNewBooking({ ...newBooking, aadhaar_image: file  });
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAadhaarPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleLicenseChange = (e) => {
//       const file = e.target.files?.[0];
//       if (file) {
//         setNewBooking({ ...newBooking, license_image: file });
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setLicensePreview(reader.result);
//         };
//         reader.readAsDataURL(file);
//       }
//   };
// const handleCreateBooking = async (e) => {
//   e.preventDefault();

//   // 1️⃣ VALIDATION
//   if (
//     !newBooking.bike_id ||
//     !newBooking.start_datetime ||
//     !newBooking.end_datetime ||
//     (!newBooking.is_new_customer && !newBooking.customer_id) ||
//     (newBooking.is_new_customer &&
//       (!newBooking.customer_name || !newBooking.customer_phone))
//   ) {
//     toast.error("Please fill in all required fields");
//     return;
//   }

//   if (!isAvailable) {
//     toast.error("Selected slot is not available");
//     return;
//   }

//   const selectedBike = bikes?.find((b) => b._id === newBooking.bike_id);
//   if (!selectedBike) {
//     toast.error("Selected bike not found");
//     return;
//   }

//   try {
//     // 2️⃣ PRICE CALCULATION
//     const start = new Date(newBooking.start_datetime);
//     const end = new Date(newBooking.end_datetime);

//     const totalHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

//     const days = Math.floor(totalHours / 24);
//     const remainingHours = totalHours % 24;

//     const total_amount =
//       days * Number(selectedBike.price_per_day || 0) +
//       remainingHours * Number(selectedBike.price_per_hour || 0);

//     let customerId = newBooking.customer_id;

//     // 3️⃣ CREATE CUSTOMER FIRST (IF NEW)
//     if (newBooking.is_new_customer) {
//       const customerFormData = new FormData();
//       customerFormData.append("name", newBooking.customer_name);
//       customerFormData.append("phone", newBooking.customer_phone);
//       customerFormData.append("email", newBooking.customer_email || "");

//       if (!newBooking.aadhaar_image) {
//         toast.error("Aadhaar photo is required");
//         return;
//       }

//        if (!newBooking.license_image) {
//          toast.error("License photo is required");
//          return;
//        }
//       customerFormData.append("aadhaar_image", newBooking.aadhaar_image);
//       customerFormData.append("license_image", newBooking.license_image);

//       const customer = await createCustomer.mutateAsync(customerFormData);
//       customerId = customer._id; // ✅ THIS IS THE KEY FIX
//     }

//     // 4️⃣ CREATE BOOKING
//     const bookingFormData = new FormData();
//     bookingFormData.append("bike_id", newBooking.bike_id);
//     bookingFormData.append("customer_id", customerId);
//     bookingFormData.append("start_datetime", start.toISOString());
//     bookingFormData.append("end_datetime", end.toISOString());
//     bookingFormData.append("total_amount", total_amount);
//     bookingFormData.append("notes", newBooking.notes || "");
//     bookingFormData.append("booking_source", "admin");
//     bookingFormData.append("created_by", "admin-temp-id");

//     // 🧪 DEBUG (optional – remove later)
//     for (let [k, v] of bookingFormData.entries()) {
//       console.log(k, v);
//     }

//     // 5️⃣ SAVE BOOKING
//     await createBooking.mutateAsync(bookingFormData);

//     toast.success("Booking created successfully!");
//     setIsOpen(false);
//     resetForm();
//   } catch (err) {
//     console.error("Booking Error:", err);
//     toast.error(err?.response?.data?.message || "Failed to create booking");
//   }
// };

//  // Helper function to reset form
//  const resetForm = () => {
//    setNewBooking({
//      bike_id: "",
//      customer_id: "",
//      start_datetime: "",
//      end_datetime: "",
//      notes: "",
//      customer_name: "",
//      customer_phone: "",
//      customer_email: "",
//      is_new_customer: false,
//      aadhaar_image: null,
//      license_image: null,
//    });
//    setAadhaarPreview(null);
//    setLicensePreview(null);
//    setAvailabilityMessage(null);
//  };
//  const handleEditTime = (booking) => {
//    setEditingBooking(booking._id);

//    // Apply rounding immediately when loading the edit data
//    setEditTimeData({
//      start_datetime: roundToHour(booking.start_datetime),
//      end_datetime: roundToHour(booking.end_datetime),
//    });
//  };

//  const handleSaveTimeEdit = async () => {
//    if (!editingBooking) return;

//    const booking = bookings?.find((b) => b._id === editingBooking);
//    if (!booking) return;

//    // Check bike_id correctly (handling both populated object or ID string)
//    const bikeId = booking.bike_id?._id || booking.bike_id;
//    const bike = bikes?.find((b) => b._id === bikeId);
//    if (!bike) {
//      toast.error("Bike data not found");
//      return;
//    }

//    const start = new Date(editTimeData.start_datetime);
//    const end = new Date(editTimeData.end_datetime);

//    const diffMs = end.getTime() - start.getTime();
//    if (diffMs <= 0) {
//      toast.error("End time must be after start time");
//      return;
//    }

//    // 1. Calculate Total Hours (Rounded Up)
//    const totalHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

//    // 2. Pricing Logic (Daily + Remaining Hours)
//    let total_amount = 0;
//    const hourlyRate = Number(bike.price_per_hour || 0);
//    const dailyRate = Number(bike.price_per_day || 0);

//    if (totalHours >= 24 && dailyRate > 0) {
//      const days = Math.floor(totalHours / 24);
//      const remainingHours = totalHours % 24;
//      total_amount = days * dailyRate + remainingHours * hourlyRate;

//      // Cap at the next full day if remaining hours are more expensive
//      if (remainingHours * hourlyRate > dailyRate) {
//        total_amount = (days + 1) * dailyRate;
//      }
//    } else {
//      total_amount = totalHours * hourlyRate;
//    }

//    try {
//      await updateBooking.mutateAsync({
//        id: editingBooking,
//        start_datetime: start.toISOString(),
//        end_datetime: end.toISOString(),
//        total_amount,
//      });

//      setEditingBooking(null);
//      toast.success("Booking updated with new rates");
//    } catch (error) {
//      toast.error("Failed to update booking time");
//    }
//  };
//   const roundToHour = (dateTimeStr) => {
//     if (!dateTimeStr) return "";
//     const date = new Date(dateTimeStr);
//     const minutes = date.getMinutes();

//     // If there are any minutes, round up to the next full hour
//     if (minutes > 0) {
//       date.setMinutes(0);
//       date.setHours(date.getHours() + 1);
//     }

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");

//     return `${year}-${month}-${day}T${hours}:00`;
//   };

//   // const handleSaveTimeEdit = async () => {
//   //   if (!editingBooking) return;

//   //   const booking = bookings?.find((b) => b._id === editingBooking);
//   //   if (!booking) return;
//   //   const bike = bikes?.find((b) => b._id === booking.bike_id?._id);
//   //   if (!bike) return;

//   //   const start = new Date(editTimeData.start_datetime);
//   //   const end = new Date(editTimeData.end_datetime);

//   //   const diffMs = end.getTime() - start.getTime();
//   //   if (diffMs <= 0) {
//   //     toast.error("End time must be after start time");
//   //     return;
//   //   }

//   //   const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
//   //   const days = Math.ceil(hours / 24);
//   //   const total_amount =
//   //     hours >= 24
//   //       ? days * Number(bike.price_per_day)
//   //       : hours * Number(bike.price_per_hour);

//   //   try {
//   //     await updateBooking.mutateAsync({
//   //       id: editingBooking,
//   //       start_datetime: new Date(editTimeData.start_datetime).toISOString(),
//   //       end_datetime: new Date(editTimeData.end_datetime).toISOString(),
//   //       total_amount,
//   //     });

//   //     setEditingBooking(null);
//   //     toast.success("Booking time updated successfully");
//   //   } catch (error) {
//   //     toast.error("Failed to update booking time");
//   //   }
//   // };

//   useEffect(() => {
//     const checkDates = async () => {
//       if (
//         !newBooking.bike_id ||
//         !newBooking.start_datetime ||
//         !newBooking.end_datetime
//       ) {
//         setAvailabilityMessage(null);
//         setIsAvailable(null);
//         return;
//       }

//       const start = new Date(newBooking.start_datetime);
//       const end = new Date(newBooking.end_datetime);

//       if (end <= start) {
//         setAvailabilityMessage("⚠️ Return date must be after pickup date");
//         setIsAvailable(false);
//         return;
//       }

//       const result = await checkAvailability(newBooking.bike_id, start, end);

//       if (!result.isAvailable && result.bookedFrom) {
//         // Format the dates exactly like your BookBike code
//         const fromDate = format(
//           new Date(result.bookedFrom),
//           "dd/MM/yyyy hh:mm a",
//         );
//         const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

//         setAvailabilityMessage(
//           `❌ Bike is already booked from ${fromDate} to ${toDate}`,
//         );
//         setIsAvailable(false);
//       } else {
//         setAvailabilityMessage(
//           result.isAvailable
//             ? "✅ Bike is available for this slot"
//             : result.message,
//         );
//         setIsAvailable(result.isAvailable);
//       }
//     };

//     checkDates();
//   }, [
//     newBooking.bike_id,
//     newBooking.start_datetime,
//     newBooking.end_datetime,
//     checkAvailability,
//   ]);
//   const availableBikes = bikes?.filter((b) => b.status !== "maintenance");
// useEffect(() => {
//   console.log("Active tab changed to:", activeTab);
// }, [activeTab]);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-display text-gradient-sunset">Bookings</h1>
//           <p className="text-muted-foreground">Manage rental bookings</p>
//         </div>

//         <Dialog open={isOpen} onOpenChange={setIsOpen}>
//           <DialogTrigger asChild>
//             <Button className="gradient-sunset text-primary-foreground">
//               <Plus className="w-4 h-4 mr-2" />
//               New Booking
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-6">
//             {" "}
//             {/* Increased overall padding */}
//             <DialogHeader className="flex-shrink-0 mb-4">
//               {" "}
//               {/* Added bottom margin to title */}
//               <DialogTitle>Create Manual Booking</DialogTitle>
//             </DialogHeader>
//             <ScrollArea className="flex-1 overflow-auto pr-6 ">
//               {" "}
//               {/* Increased padding for scroll area */}
//               <form onSubmit={handleCreateBooking} className="space-y-6">
//                 {" "}
//                 {/* Increased spacing between rows from 4 to 6 */}
//                 {/* Bike Selection */}
//                 <div className="space-y-3">
//                   <Label>Select Bike *</Label>
//                   <Select
//                     value={newBooking.bike_id}
//                     onValueChange={(value) =>
//                       setNewBooking({ ...newBooking, bike_id: value })
//                     }
//                   >
//                     <SelectTrigger className="h-11">
//                       {" "}
//                       {/* Slightly taller trigger */}
//                       <SelectValue placeholder="Choose a bike" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {availableBikes?.map((bike) => (
//                         <SelectItem key={bike._id} value={bike._id}>
//                           {bike.model} - {bike.number_plate} (₹
//                           {bike.price_per_hour}/hr)
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {/* Date/Time Grid */}
//                 <div className="space-y-4">
//                   {" "}
//                   {/* Container to keep grid and message together */}
//                   <div className="grid grid-cols-2 gap-6">
//                     {" "}
//                     {/* Increased gap between columns */}
//                     <div className="space-y-2">
//                       <Label>Start Date/Time *</Label>
//                       <Input
//                         required
//                         type="datetime-local"
//                         className="bg-input border-border [color-scheme:dark] h-11"
//                         value={newBooking.start_datetime}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             start_datetime: roundToHour(e.target.value),
//                           })
//                         }
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label>End Date/Time *</Label>
//                       <Input
//                         required
//                         type="datetime-local"
//                         className="bg-input border-border [color-scheme:dark] h-11"
//                         value={newBooking.end_datetime}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             end_datetime: roundToHour(e.target.value),
//                           })
//                         }
//                       />
//                     </div>
//                   </div>
//                   {/* Availability Message - Moved to its own block below the grid */}
//                   {availabilityMessage && (
//                     <div
//                       className={`p-4 rounded-xl flex items-center gap-3 text-sm mt-2 transition-all ${
//                         isAvailable
//                           ? "bg-green-50 text-green-700 border border-green-200"
//                           : "bg-red-50 text-red-700 border border-red-200"
//                       }`}
//                     >
//                       {isAvailable ? (
//                         <CheckCircle2 className="w-5 h-5" />
//                       ) : (
//                         <AlertCircle className="w-5 h-5" />
//                       )}
//                       <span className="font-medium">{availabilityMessage}</span>
//                     </div>
//                   )}
//                 </div>
//                 {/* Customer Section */}
//                 <div className="space-y-4 pt-2">
//                   {" "}
//                   {/* Added top padding to separate from dates */}
//                   <div className="flex items-center gap-4 mb-2">
//                     <Label className="text-base font-semibold">
//                       Customer Details
//                     </Label>
//                     <label className="flex items-center gap-2 text-sm cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="w-4 h-4 rounded"
//                         checked={newBooking.is_new_customer}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             is_new_customer: e.target.checked,
//                             customer_id: "",
//                           })
//                         }
//                       />
//                       New Customer
//                     </label>
//                   </div>
//                   {newBooking.is_new_customer ? (
//                     <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border/50">
//                       {" "}
//                       {/* Increased internal padding */}
//                       <Input
//                         required
//                         className="h-11"
//                         placeholder="Customer Name *"
//                         value={newBooking.customer_name}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             customer_name: e.target.value,
//                           })
//                         }
//                       />
//                       <Input
//                         required
//                         className="h-11"
//                         placeholder="Phone Number *"
//                         value={newBooking.customer_phone}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             customer_phone: e.target.value,
//                           })
//                         }
//                       />
//                       <Input
//                         className="h-11"
//                         type="email"
//                         placeholder="Email (optional)"
//                         value={newBooking.customer_email}
//                         onChange={(e) =>
//                           setNewBooking({
//                             ...newBooking,
//                             customer_email: e.target.value,
//                           })
//                         }
//                       />
//                     </div>
//                   ) : (
//                     <Select
//                       value={newBooking.customer_id}
//                       onValueChange={(value) =>
//                         setNewBooking({ ...newBooking, customer_id: value })
//                       }
//                     >
//                       <SelectTrigger className="h-11">
//                         <SelectValue placeholder="Select existing customer" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {customers?.map((customer) => (
//                           <SelectItem key={customer._id} value={customer._id}>
//                             {customer.name} - {customer.phone}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 </div>
//                 {/* Aadhaar Section */}
//                 {newBooking.is_new_customer && (
//                   <div className="space-y-3 pt-2">
//                     <Label>Aadhaar Card Photo *</Label>
//                     <div
//                       onClick={() => aadhaarInputRef.current?.click()}
//                       className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
//                     >
//                       {aadhaarPreview ? (
//                         <div className="relative">
//                           <img
//                             src={aadhaarPreview}
//                             alt="Preview"
//                             className="max-h-36 mx-auto rounded-lg shadow-sm"
//                           />
//                           <p className="text-xs text-muted-foreground mt-3 font-medium">
//                             Click to change photo
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center gap-3 py-2">
//                           <Upload className="w-10 h-10 text-muted-foreground opacity-70" />
//                           <p className="text-sm text-muted-foreground font-medium">
//                             Upload Aadhaar Front Image
//                           </p>
//                         </div>
//                       )}
//                       <input

//                         ref={aadhaarInputRef}
//                         type="file"
//                         accept="image/*"
//                         onChange={handleAadhaarChange}
//                         style={{
//                           position: "absolute",
//                           width: "1px",
//                           height: "1px",
//                           padding: "0",
//                           margin: "-1px",
//                           overflow: "hidden",
//                           clip: "rect(0,0,0,0)",
//                           border: "0",
//                           display: "block", // Must be block or inline, NOT none
//                           visibility: "visible", // Must be visible for the tooltip to anchor
//                         }}
//                         required
//                       />
//                     </div>
//                     {uploading && (
//                       <div className="w-full bg-muted rounded-full h-2 mt-2">
//                         <div
//                           className="bg-primary h-2 rounded-full transition-all"
//                           style={{ width: `${progress}%` }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 {/* License  Section */}
//                 {newBooking.is_new_customer && (
//                   <div className="space-y-3 pt-2">
//                     <Label>License Photo *</Label>
//                     <div
//                       onClick={() => LicenseInputRef.current?.click()}
//                       className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
//                     >
//                       {licensePreview ? (
//                         <div className="relative">
//                           <img
//                             src={licensePreview}
//                             alt="Preview"
//                             className="max-h-36 mx-auto rounded-lg shadow-sm"
//                           />
//                           <p className="text-xs text-muted-foreground mt-3 font-medium">
//                             Click to change photo
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center gap-3 py-2">
//                           <Upload className="w-10 h-10 text-muted-foreground opacity-70" />
//                           <p className="text-sm text-muted-foreground font-medium">
//                             Upload License Front Image
//                           </p>
//                         </div>
//                       )}
//                       <input
//                         ref={LicenseInputRef}
//                         type="file"
//                         accept="image/*"
//                         onChange={handleLicenseChange}
//                         style={{
//                           position: "absolute",
//                           width: "1px",
//                           height: "1px",
//                           padding: "0",
//                           margin: "-1px",
//                           overflow: "hidden",
//                           clip: "rect(0,0,0,0)",
//                           border: "0",
//                           display: "block", // Must be block or inline, NOT none
//                           visibility: "visible", // Must be visible for the tooltip to anchor
//                         }}
//                         required
//                       />
//                     </div>
//                     {uploading && (
//                       <div className="w-full bg-muted rounded-full h-2 mt-2">
//                         <div
//                           className="bg-primary h-2 rounded-full transition-all"
//                           style={{ width: `${progress}%` }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 {/* Notes */}
//                 <div className="space-y-2 pt-2">
//                   <Label>Notes</Label>
//                   <Textarea
//                     placeholder="Any additional notes..."
//                     value={newBooking.notes}
//                     onChange={(e) =>
//                       setNewBooking({ ...newBooking, notes: e.target.value })
//                     }
//                     rows={3}
//                     className="resize-none"
//                   />
//                 </div>
//                 {/* Actions */}
//                 <div className="flex justify-end gap-3 pt-6 pb-2 border-t">
//                   {" "}
//                   {/* Added border-t and more padding */}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="px-6"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     className="gradient-sunset px-8"
//                     disabled={uploading}
//                   >
//                     {uploading ? "Processing..." : "Create Booking"}
//                   </Button>
//                 </div>
//               </form>
//             </ScrollArea>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Dialog
//         open={!!editingBooking}
//         onOpenChange={(open) => !open && setEditingBooking(null)}
//       >
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle>Edit Booking Time</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label>Start Date/Time</Label>
//               <Input
//                 type="datetime-local"
//                 value={editTimeData.start_datetime}
//                 className="bg-input border-border [color-scheme:dark]"
//                 onChange={(e) =>
//                   setEditTimeData({
//                     ...editTimeData,
//                     start_datetime: roundToHour(e.target.value), // Round here too!
//                   })
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>End Date/Time</Label>
//               <Input
//                 type="datetime-local"
//                 value={editTimeData.end_datetime}
//                 className="bg-input border-border [color-scheme:dark]"
//                 onChange={(e) =>
//                   setEditTimeData({
//                     ...editTimeData,
//                     end_datetime: roundToHour(e.target.value), // Round here too!
//                   })
//                 }
//               />
//             </div>
//             <p className="text-sm text-muted-foreground">
//               ⚠️ Extending the booking will recalculate the total amount based
//               on current pricing.
//             </p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditingBooking(null)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSaveTimeEdit} className="gradient-sunset">
//               Save Changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by customer, bike, plate..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
//         <TabsList className="bg-muted">
//           <TabsTrigger value="all">All</TabsTrigger>
//           <TabsTrigger value="pending">Pending</TabsTrigger>
//           <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="completed">Completed</TabsTrigger>
//           <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       {isLoading ? (
//         <div className="space-y-4">
//           {[1, 2, 3].map((i) => (
//             <Card key={i} className="animate-pulse">
//               <CardContent className="p-4">
//                 <div className="h-4 bg-muted rounded w-3/4 mb-2" />
//                 <div className="h-3 bg-muted rounded w-1/2" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {filteredBookings?.map((booking, index) => (
//             <motion.div
//               key={booking._id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.03 }}
//             >
//               <Card className="hover:shadow-md transition-shadow border-border">
//                 <CardContent className="p-4">
//                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                     <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Customer
//                         </p>
//                         <p className="font-semibold text-foreground">
//                           {booking.customers?.name}
//                         </p>
//                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                           <Phone className="w-3 h-3" />
//                           {booking.customers?.phone}
//                         </div>
//                       </div>

//                       <div>
//                         <p className="text-sm text-muted-foreground">Bike</p>
//                         <p className="font-semibold text-foreground">
//                           {booking.bikes?.model}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {booking.bikes?.number_plate}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Duration
//                         </p>
//                         <div className="flex items-center gap-1 text-sm text-foreground">
//                           <Calendar className="w-3 h-3" />
//                           {format(
//                             new Date(booking.start_datetime),
//                             "MMM d, h:mm a",
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                           <Clock className="w-3 h-3" />
//                           to{" "}
//                           {format(
//                             new Date(booking.end_datetime),
//                             "MMM d, h:mm a",
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <div className="text-right">
//                         <Badge
//                           className={`${statusColors[booking.status]} border`}
//                         >
//                           {booking.status}
//                         </Badge>
//                         <p className="text-sm font-semibold text-primary mt-1">
//                           ₹{booking.total_amount?.toLocaleString() || 0}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           via {booking.booking_source}
//                         </p>
//                       </div>

//                       <div className="flex flex-col gap-1">
//                         {(booking.status === "active" ||
//                           booking.status === "confirmed") && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleEditTime(booking)}
//                             className="text-blue-600 hover:bg-blue-50 border-blue-200"
//                           >
//                             <Edit className="w-4 h-4 mr-1" />
//                             Edit Time
//                           </Button>
//                         )}
//                         {statusActions[booking.status]?.map((action) => (
//                           <Button
//                             key={action.next}
//                             size="sm"
//                             variant={
//                               action.next === "cancelled"
//                                 ? "outline"
//                                 : "default"
//                             }
//                             onClick={() =>
//                               handleStatusUpdate(booking._id, action.next)
//                             }
//                             className={
//                               action.next === "cancelled"
//                                 ? "text-red-600 hover:bg-red-50"
//                                 : "gradient-sunset"
//                             }
//                           >
//                             {action.icon}
//                             <span className="ml-1">{action.label}</span>
//                           </Button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {booking.notes && (
//                     <p className="mt-3 text-sm text-muted-foreground bg-muted p-2 rounded">
//                       📝 {booking.notes}
//                     </p>
//                   )}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}

//           {filteredBookings?.length === 0 && (
//             <div className="text-center py-12">
//               <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground">No bookings found</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  useBookings,
  useUpdateBookingStatus,
  useCreateBooking,
  useUpdateBooking,
  useAdminCreateBooking,
} from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
} from "../../hooks/useCustomer";
import {
  Plus,
  Search,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Edit,
  Upload,
  Fuel,
  Globe,
  Store,
  User,
  MapPin,
  CreditCard,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";

import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthProvider";
import { useEffect } from "react";
import { useBikeAvailability } from "../../hooks/useBikeAvailability";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

const statusColors = {
  pending:
    "bg-yellow-500/15 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400",
  active: "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400",
};

const sourceColors = {
  online: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  admin:
    "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400",
  partner:
    "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400",
};

const sourceIcons = {
  online: <Globe className="w-3 h-3" />,
  admin: <Store className="w-3 h-3" />,
  partner: <User className="w-3 h-3" />,
};

const paymentStatusColors = {
  paid: "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400",
  pending:
    "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400",
  failed: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
};

const statusActions = {
  pending: [
    {
      next: "confirmed",
      label: "Confirm",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      next: "cancelled",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4" />,
    },
  ],
  confirmed: [
    {
      next: "active",
      label: "Start Rental",
      icon: <Play className="w-4 h-4" />,
    },
    {
      next: "cancelled",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4" />,
    },
  ],
  active: [
    {
      next: "completed",
      label: "Complete",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ],
  completed: [],
  cancelled: [],
};

const getSourceLabel = (source) => {
  if (source === "online") return "Website";
  if (source === "admin") return "Offline";
  if (source === "partner") return "Partner";
  return source;
};

const emptyFormData = {
  bike_id: "",
  customer_id: "",
  start_datetime: "",
  end_datetime: "",
  notes: "",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  customer_location: "",
  is_new_customer: false,
  aadhaar_file: null,
  license_file: null,
  partner_name: "",
  lead_source: "other",
  source_name: "",
  rental_type: "daily",
  total_amount: "",
  deposit_amount: "",
  reference_partner_share: "",
  provider_partner_share: "",
  fuel_quantity: "",
  account_manager: "",
  remarks: "",
  payment_method: "cash",
};

const emptyCompletionData = {
  fuel_in_liters: "",
  penalty_amount: "",
  challan_amount: "",
  damage_cost: "",
  payment_method: "cash",
  remarks: "",
};

const roundToHour = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  const minutes = date.getMinutes();

  // If there are any minutes, round up to the next full hour
  if (minutes > 0) {
    date.setMinutes(0);
    date.setHours(date.getHours() + 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:00`;
};

export default function Bookings() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const aadhaarInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [extraDocFiles, setExtraDocFiles] = useState([]); // Binary files
  const [extraDocPreviews, setExtraDocPreviews] = useState([]); // UI previews

  // Completion dialog
  const [completionDialog, setCompletionDialog] = useState(null);
  const [completionData, setCompletionData] = useState(emptyCompletionData);

  // Start ride dialog
  const [startRideDialog, setStartRideDialog] = useState(null);
  const [startRideData, setStartRideData] = useState({ fuel_out_liters: "" });

  const { data: bookings, isLoading } = useBookings(
    activeTab !== "all" ? { status: activeTab } : undefined,
  );

  const handleExport = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = bookings.map((b) => ({
      Booking_ID: b._id,
      Customer_Name: b.customer_name || b.customers?.name,
      Phone: b.contact_number || b.customers?.phone,
      Email: b.customer_email || b.customers?.email,
      Bike: b.bikes?.model,
      Number_Plate: b.bikes?.number_plate,
      Start_Date: format(new Date(b.start_datetime), "dd-MM-yyyy HH:mm"),
      End_Date: format(new Date(b.end_datetime), "dd-MM-yyyy HH:mm"),
      Status: b.status,
      Payment_Status: b.payment_status,
      Rental_Type: b.rental_type,
      Total_Amount: b.total_amount,
      Deposit: b.deposit_amount,
      Fuel_Quantity: b.fuel_quantity,
      Fuel_Out: b.fuel_out_liters,
      Fuel_In: b.fuel_in_liters,
      Penalty: b.penalty_amount,
      Challan: b.challan_amount,
      Damage: b.damage_cost,
      Payment_Method: b.payment_method,
      Source: b.booking_source,
      Lead_Source: b.lead_source,
      Source_Name: b.source_name,
      Account_Manager: b.account_manager,
      Notes: b.notes,
      Remarks: b.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Bookings_${Date.now()}.xlsx`);
  };

  const { data: bikes } = useBikes();
  const { data: customers } = useCustomers();
  const updateStatus = useUpdateBookingStatus();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  // Inside Booking.jsx
  const adminCreateMutation = useAdminCreateBooking();
  // Then call: adminCreateMutation.mutateAsync(dataToSend);
  const { user } = useAuth();

  // Add this line below your other useState/useMemo hooks
  const [uploading, setUploading] = useState(false);
  const isEdit = !!editingBooking;
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const { checkAvailability, checking } = useBikeAvailability(); // Assuming you use the same hook

  const [formData, setFormData] = useState(emptyFormData);

  const createCustomerMutation = useCreateCustomer();
  const adminCreateBookingMutation = useAdminCreateBooking();

  // Add this inside your Bookings component
  useEffect(() => {
    if (!isOpen) {
      setBikeSearch(""); // Reset bike search when the dialog closes
    }
  }, [isOpen]);

  useEffect(() => {
    const checkDates = async () => {
      // Determine which data to use (Edit form or Create form)
      const activeData = editingBooking ? editFormData : formData;

      if (
        !activeData.bike_id ||
        !activeData.start_datetime ||
        !activeData.end_datetime
      ) {
        setAvailabilityMessage(null);
        setIsAvailable(null);
        return;
      }

      const start = new Date(activeData.start_datetime);
      const end = new Date(activeData.end_datetime);

      if (end <= start) {
        setAvailabilityMessage("⚠️ Return date must be after pickup date");
        setIsAvailable(false);
        return;
      }

      // Call API
      const result = await checkAvailability(activeData.bike_id, start, end);

      // If we are editing, we should ignore the "overlap" if it's the current booking itself
      if (!result.isAvailable && result.bookingId === editingBooking) {
        setAvailabilityMessage("✅ This is your current slot");
        setIsAvailable(true);
        return;
      }

      if (!result.isAvailable && result.bookedFrom) {
        const fromDate = format(
          new Date(result.bookedFrom),
          "dd/MM/yyyy hh:mm a",
        );
        const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");
        setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);
        setIsAvailable(false);
      } else {
        setAvailabilityMessage(
          result.isAvailable ? "✅ Bike is available" : result.message,
        );
        setIsAvailable(result.isAvailable);
      }
    };

    checkDates();
  }, [
    formData.bike_id,
    formData.start_datetime,
    formData.end_datetime,
    editingBooking,
    checkAvailability,
  ]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    // 1. Prepare Customer FormData
    const customerData = new FormData();
    customerData.append("name", newCustomer.name);
    customerData.append("phone", newCustomer.phone);
    customerData.append("email", newCustomer.email);
    // Add your files
    if (newCustomer.aadhaar_image)
      customerData.append("aadhaar_image", newCustomer.aadhaar_image);
    if (newCustomer.license_image)
      customerData.append("license_image", newCustomer.license_image);

    try {
      setUploading(true);

      // 2. CREATE CUSTOMER AND WAIT
      // mutateAsync returns the 'customer' object from your backend res.json(customer)
      const savedCustomer =
        await createCustomerMutation.mutateAsync(customerData);

      // 3. UPDATE BOOKING FORM STATE IMMEDIATELY
      // We put the new ID and details directly into the booking formData
      setFormData((prev) => ({
        ...prev,
        customer_id: savedCustomer._id,
        customer_name: savedCustomer.name,
        contact_number: savedCustomer.phone,
      }));

      toast.success(`Customer ${savedCustomer.name} created and selected!`);

      // 4. EXIT CUSTOMER FORM
      setShowCustomerForm(false);

      // Optional: If you want to finish the booking AUTOMATICALLY right now:
      // await handleCreateBooking();
    } catch (error) {
      // Error is handled by the hook's onError, but you can add extra logic here
      console.error("Sequence Error:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const checkDates = async () => {
      if (
        !formData.bike_id ||
        !formData.start_datetime ||
        !formData.end_datetime
      ) {
        setAvailabilityMessage(null);
        setIsAvailable(null);
        return;
      }

      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);

      if (end <= start) {
        setAvailabilityMessage("⚠️ Return date must be after pickup date");
        setIsAvailable(false);
        return;
      }

      // Note: Ensure your hook is named 'checkAvailability' or 'checkBikeAvailability'
      const result = await checkAvailability(formData.bike_id, start, end);
      setIsAvailable(result.isAvailable);
      setAvailabilityMessage(
        result.isAvailable ? "✅ Bike is available" : result.message,
      );
    };

    checkDates();
  }, [formData.bike_id, formData.start_datetime, formData.end_datetime]);
  // Add this function to handle file to URL conversion for previews
  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [`${type}_file`]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "aadhaar") setAadhaarPreview(reader.result);
        if (type === "license") setLicensePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit form state
  const [editFormData, setEditFormData] = useState(emptyFormData);

  const filteredBookings = bookings
    ?.filter((booking) => {
      if (activeTab === "all") return true;
      return booking.status === activeTab;
    })
    ?.filter((booking) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        booking.customers?.name?.toLowerCase().includes(query) ||
        booking.customers?.phone?.includes(query) ||
        booking.bikes?.model?.toLowerCase().includes(query) ||
        booking.bikes?.number_plate?.toLowerCase().includes(query)
      );
    });

  // Filtered customers for search
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  const resetForm = () => {
    setFormData(emptyFormData);
    setAadhaarPreview(null);
    setLicensePreview(null);
    setCustomerSearch("");
  };

  // Status transitions
  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (newStatus === "active") {
      setStartRideDialog(bookingId);
      setStartRideData({ fuel_out_liters: "" });
      return;
    }
    if (newStatus === "completed") {
      setCompletionDialog(bookingId);
      setCompletionData(emptyCompletionData);
      return;
    }
    await updateStatus.mutateAsync({ id: bookingId, status: newStatus });
  };

  // Start ride confirm
  const handleStartRideConfirm = async () => {
    if (!startRideDialog) return;
    const fuelValue = Number(startRideData.fuel_out_liters) || null;
    await updateBooking.mutateAsync({
      id: startRideDialog,
      fuel_out_liters: fuelValue,
    });
    await updateStatus.mutateAsync({ id: startRideDialog, status: "active" });
    setStartRideDialog(null);
    toast.success("Rental started");
  };

  // Completion confirm
  // const handleCompletionConfirm = async () => {
  //   if (!completionDialog) return;
  //   const booking = bookings?.find((b) => b._id === completionDialog);
  //   if (!booking) return;

  //   const penalty = Number(completionData.penalty_amount) || 0;
  //   const challan = Number(completionData.challan_amount) || 0;
  //   const damage = Number(completionData.damage_cost) || 0;
  //   const totalDeductions = penalty + challan + damage;
  //   const depositAfter = Math.max(
  //     0,
  //     (booking.deposit_amount || 0) - totalDeductions,
  //   );

  //   await updateBooking.mutateAsync({
  //     id: completionDialog,
  //     fuel_in_liters: Number(completionData.fuel_in_liters) || null,
  //     penalty_amount: penalty,
  //     challan_amount: challan,
  //     damage_cost: damage,
  //     payment_method: completionData.payment_method,
  //     remarks: completionData.remarks || booking.remarks || undefined,
  //   });
  //   await updateStatus.mutateAsync({
  //     id: completionDialog,
  //     status: "completed",
  //   });
  //   setCompletionDialog(null);
  //   setCompletionData(emptyCompletionData);
  //   if (totalDeductions > 0) {
  //     toast.success(
  //       `Ride completed. ₹${totalDeductions} deducted from deposit. Refundable: ₹${depositAfter}`,
  //     );
  //   } else {
  //     toast.success("Ride completed successfully");
  //   }
  // };

  const handleCompletionConfirm = async () => {
    if (!completionDialog) return;

    const booking = bookings?.find((b) => b._id === completionDialog);
    if (!booking) return;

    const penalty = Number(completionData.penalty_amount) || 0;
    const challan = Number(completionData.challan_amount) || 0;
    const damage = Number(completionData.damage_cost) || 0;

    const totalDeductions = penalty + challan + damage;

    const depositAfter = Math.max(
      0,
      (booking.deposit_amount || 0) - totalDeductions,
    );

    try {
      // ✅ IMPORTANT: use FormData for image upload
      const formData = new FormData();

      formData.append(
        "fuel_in_liters",
        Number(completionData.fuel_in_liters) || "",
      );
      formData.append("penalty_amount", penalty);
      formData.append("challan_amount", challan);
      formData.append("damage_cost", damage);
      formData.append("payment_method", completionData.payment_method);
      formData.append(
        "remarks",
        completionData.remarks || booking.remarks || "",
      );

      // ✅ ADD THIS (IMAGE)
      if (completionData.payment_screenshot) {
        formData.append(
          "payment_screenshot",
          completionData.payment_screenshot,
        );
      }

      // ✅ SEND FORM DATA
      await updateBooking.mutateAsync({
        id: completionDialog,
        data: formData, // 👈 IMPORTANT CHANGE
      });

      // ✅ STATUS UPDATE
      await updateStatus.mutateAsync({
        id: completionDialog,
        status: "completed",
      });

      setCompletionDialog(null);
      setCompletionData(emptyCompletionData);

      if (totalDeductions > 0) {
        toast.success(
          `Ride completed. ₹${totalDeductions} deducted. Refundable: ₹${depositAfter}`,
        );
      } else {
        toast.success("Ride completed successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete ride");
    }
  };

  // Mark payment as paid
  const handleMarkPaid = async (bookingId) => {
    await updateBooking.mutateAsync({
      id: bookingId,
      data: {
        payment_status: "paid",
      },
    });

    toast.success("Payment marked as paid");
  };

  // Document handlers
  const handleAadhaarChange = (e, setter, data) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ ...data, aadhaar_file: file });
      const reader = new FileReader();
      reader.onloadend = () => setAadhaarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseChange = (e, setter, data) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ ...data, license_file: file });
      const reader = new FileReader();
      reader.onloadend = () => setLicensePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompletionData((prev) => ({
        ...prev,
        payment_screenshot: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create booking
  // const handleCreateBooking = async (e) => {
  //   if (e) e.preventDefault();

  //   // 1. Prepare Data
  //   const dataToSend = new FormData();
  //   const selectedBike = bikes?.find((b) => b._id === formData.bike_id);
  //   const selectedCust = customers?.find((c) => c._id === formData.customer_id);

  //   // 2. Mandatory Fields (Match your Schema exactly)
  //   dataToSend.append("bike_id", formData.bike_id);
  //   dataToSend.append("customer_id", formData.customer_id);
  //   dataToSend.append("start_datetime", formData.start_datetime);
  //   dataToSend.append("end_datetime", formData.end_datetime);

  //   // Required strings that were missing
  //   dataToSend.append("customer_name", selectedCust?.name || "");
  //   dataToSend.append("contact_number", selectedCust?.phone || "");
  //   dataToSend.append(
  //     "vehicle_make_model",
  //     selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : "Bike",
  //   );
  //   dataToSend.append("account_manager", "Admin"); // Required by Schema

  //   dataToSend.append("lead_source", formData.lead_source || "other");
  //   dataToSend.append("source_name", formData.source_name || "Direct");
  //   dataToSend.append("rental_type", formData.rental_type || "daily");
  //   dataToSend.append("deposit_amount", formData.deposit_amount || 0);
  //   dataToSend.append("total_amount", formData.total_amount || 0);
  //   dataToSend.append("payment_method", "cash");

  //   // 3. Files (Must match the fieldnames used in Controller)
  //   if (formData.aadhaar_file) {
  //     dataToSend.append("customer_id_proof_files", formData.aadhaar_file);
  //   }
  //   if (formData.license_file) {
  //     dataToSend.append("customer_license_files", formData.license_file);
  //   }

  //   try {
  //     setUploading(true);
  //     // Use the mutation hook you provided
  //     await adminCreateMutation.mutateAsync(dataToSend);
  //     setIsOpen(false);
  //     resetForm();
  //   } catch (err) {
  //     // Errors will be caught by the onError in your hook
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // const handleCreateBooking = async (e) => {
  //   if (e) e.preventDefault();

  //   try {
  //     setUploading(true);

  //     let finalCustomerId = formData.customer_id;
  //     let finalCustomerName = formData.customer_name;
  //     let finalCustomerPhone = formData.customer_phone;

  //     // 1️⃣ CREATE CUSTOMER FIRST (IF NEW)
  //     if (formData.is_new_customer) {
  //       console.log("🚀 Step 1: Creating new customer...");
  //       const customerFormData = new FormData();

  //       // Backend 'Customer' model expects: name, phone, email
  //       customerFormData.append("name", formData.customer_name);
  //       customerFormData.append("phone", formData.customer_phone);
  //       customerFormData.append("email", formData.customer_email || "");

  //       // IMPORTANT: Backend expects 'aadhaar_image' and 'license_image'
  //       // Your console shows they are stored in 'aadhaar_file' and 'license_file'
  //       if (!formData.aadhaar_file || !formData.license_file) {
  //         toast.error("Aadhaar and License files are required");
  //         setUploading(false);
  //         return;
  //       }

  //       customerFormData.append("aadhaar_image", formData.aadhaar_file);
  //       customerFormData.append("license_image", formData.license_file);

  //       // Call the customer creation API
  //       const savedCustomer =
  //         await createCustomer.mutateAsync(customerFormData);

  //       // Get the ID generated by MongoDB
  //       finalCustomerId = savedCustomer._id;
  //       console.log("✅ Customer Created with ID:", finalCustomerId);
  //     } else {
  //       // EXISTING CUSTOMER LOGIC
  //       const selectedCust = customers?.find(
  //         (c) => c._id === formData.customer_id,
  //       );
  //       if (!selectedCust) {
  //         toast.error("Please select a customer");
  //         setUploading(false);
  //         return;
  //       }
  //       finalCustomerId = selectedCust._id;
  //       finalCustomerName = selectedCust.name;
  //       finalCustomerPhone = selectedCust.phone;
  //     }

  //     // 2️⃣ PREPARE BOOKING DATA
  //     console.log("🚀 Step 2: Preparing booking data...");
  //     const bookingData = new FormData();
  //     const selectedBike = bikes?.find((b) => b._id === formData.bike_id);

  //     // Mandatory Booking Fields
  //     bookingData.append("customer_id", finalCustomerId);
  //     bookingData.append("bike_id", formData.bike_id);
  //     bookingData.append("customer_name", finalCustomerName);
  //     bookingData.append("contact_number", finalCustomerPhone);

  //     bookingData.append("start_datetime", formData.start_datetime);
  //     bookingData.append("end_datetime", formData.end_datetime);
  //     bookingData.append(
  //       "vehicle_make_model",
  //       selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : "Bike",
  //     );
  //     bookingData.append(
  //       "account_manager",
  //       formData.account_manager || "Admin",
  //     );
  //     bookingData.append("rental_type", formData.rental_type || "daily");
  //     bookingData.append("lead_source", formData.lead_source || "other");
  //     bookingData.append("source_name", formData.source_name || "Direct");
  //     bookingData.append("deposit_amount", formData.deposit_amount || 0);
  //     bookingData.append("total_amount", formData.total_amount || 0);
  //     bookingData.append("payment_method", "cash");

  //     // Optional Booking Fields
  //     bookingData.append("fuel_quantity", formData.fuel_quantity || 0);
  //     bookingData.append("notes", formData.notes || "");
  //     bookingData.append("remarks", formData.remarks || "");

  //     // 3️⃣ SEND TO BACKEND
  //     await adminCreateMutation.mutateAsync(bookingData);

  //     setIsOpen(false);
  //     resetForm();
  //     toast.success("Booking completed successfully!");
  //   } catch (err) {
  //     console.error("❌ Process Error:", err);
  //     toast.error(
  //       err.response?.data?.message || "Failed to create customer or booking",
  //     );
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleCreateBooking = async (e) => {
    if (e) e.preventDefault();

    try {
      setUploading(true);

      let finalCustomerId = formData.customer_id;
      let finalCustomerName = formData.customer_name;
      let finalCustomerPhone = formData.customer_phone;

      // 1️⃣ CREATE CUSTOMER FIRST (IF NEW)
      // if (formData.is_new_customer) {
      //   console.log("🚀 Step 1: Creating new customer...");
      //   const customerFormData = new FormData();

      //   // Backend 'Customer' model expects: name, phone, email
      //   customerFormData.append("name", formData.customer_name);
      //   customerFormData.append("phone", formData.customer_phone);
      //   customerFormData.append("email", formData.customer_email || "");

      //   // IMPORTANT: Backend expects 'aadhaar_image' and 'license_image'
      //   // Your console shows they are stored in 'aadhaar_file' and 'license_file'
      //   if (!formData.aadhaar_file || !formData.license_file) {
      //     toast.error("Aadhaar and License files are required");
      //     setUploading(false);
      //     return;
      //   }

      //   customerFormData.append("aadhaar_image", formData.aadhaar_file);
      //   customerFormData.append("license_image", formData.license_file);

      //   // Call the customer creation API
      //   const savedCustomer =
      //     await createCustomer.mutateAsync(customerFormData);

      //   // Get the ID generated by MongoDB
      //   finalCustomerId = savedCustomer._id;
      //   console.log("✅ Customer Created with ID:", finalCustomerId);
      // }

      // ... inside handleCreateBooking
      if (formData.is_new_customer) {
        console.log("🚀 Step 1: Creating new customer...");
        const customerFormData = new FormData();

        customerFormData.append("name", formData.customer_name);
        customerFormData.append("phone", formData.customer_phone);
        customerFormData.append("email", formData.customer_email || "");

        // Legacy Aadhaar and License
        if (!formData.aadhaar_file || !formData.license_file) {
          toast.error("Aadhaar and License files are required");
          setUploading(false);
          return;
        }
        customerFormData.append("aadhaar_image", formData.aadhaar_file);
        customerFormData.append("license_image", formData.license_file);

        // --- NEW CHANGE START ---
        // Append the 5 extra documents (from your new state)
        if (extraDocFiles && extraDocFiles.length > 0) {
          extraDocFiles.forEach((file) => {
            customerFormData.append("extra_documents", file);
          });
        }
        // --- NEW CHANGE END ---

        const savedCustomer =
          await createCustomer.mutateAsync(customerFormData);
        finalCustomerId = savedCustomer._id;
        console.log("✅ Customer Created with ID:", finalCustomerId);
      }
      // ... rest of the booking logic
      else {
        // EXISTING CUSTOMER LOGIC
        const selectedCust = customers?.find(
          (c) => c._id === formData.customer_id,
        );
        if (!selectedCust) {
          toast.error("Please select a customer");
          setUploading(false);
          return;
        }
        finalCustomerId = selectedCust._id;
        finalCustomerName = selectedCust.name;
        finalCustomerPhone = selectedCust.phone;
      }

      // 2️⃣ PREPARE BOOKING DATA
      console.log("🚀 Step 2: Preparing booking data...");
      const bookingData = new FormData();
      const selectedBike = bikes?.find((b) => b._id === formData.bike_id);

      // Mandatory Booking Fields
      bookingData.append("customer_id", finalCustomerId);
      bookingData.append("bike_id", formData.bike_id);
      bookingData.append("customer_name", finalCustomerName);
      bookingData.append("contact_number", finalCustomerPhone);

      bookingData.append("start_datetime", formData.start_datetime);
      bookingData.append("end_datetime", formData.end_datetime);
      bookingData.append(
        "vehicle_make_model",
        selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : "Bike",
      );
      bookingData.append(
        "account_manager",
        formData.account_manager || "Admin",
      );
      bookingData.append("rental_type", formData.rental_type || "daily");
      bookingData.append("lead_source", formData.lead_source || "other");
      bookingData.append("source_name", formData.source_name || "Direct");
      bookingData.append("deposit_amount", formData.deposit_amount || 0);
      bookingData.append("total_amount", formData.total_amount || 0);
      bookingData.append("payment_method", "cash");

      // Optional Booking Fields
      bookingData.append("fuel_quantity", formData.fuel_quantity || 0);
      bookingData.append("notes", formData.notes || "");
      bookingData.append("remarks", formData.remarks || "");

      // 3️⃣ SEND TO BACKEND
      await adminCreateMutation.mutateAsync(bookingData);

      setIsOpen(false);
      resetForm();
      toast.success("Booking completed successfully!");
    } catch (err) {
      console.error("❌ Process Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create customer or booking",
      );
    } finally {
      setUploading(false);
    }
  };

const formatToLocalInput = (isoDate) => {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60000
  );

  return local.toISOString().slice(0, 16);
};

const handleEditBooking = (booking) => {
  setEditingBooking(booking._id);

  setEditFormData({
    bike_id: booking.bike_id,
    customer_id: booking.customer_id,

    // ✅ FIXED TIMEZONE ISSUE HERE
    start_datetime: formatToLocalInput(
      booking.start_datetime
    ),

    end_datetime: formatToLocalInput(
      booking.end_datetime
    ),

    notes: booking.notes || "",

    customer_name:
      booking.customer_name ||
      booking.customers?.name ||
      "",

    customer_phone:
      booking.contact_number ||
      booking.customers?.phone ||
      "",

    customer_email:
      booking.customer_email ||
      booking.customers?.email ||
      "",

    customer_location:
      booking.customer_location || "",

    is_new_customer: false,
    aadhaar_file: null,
    license_file: null,

    partner_name: booking.source_name || "",
    lead_source: booking.lead_source || "other",
    source_name: booking.source_name || "",
    rental_type: booking.rental_type || "daily",

    total_amount: String(
      booking.total_amount || ""
    ),

    deposit_amount: String(
      booking.deposit_amount || ""
    ),

    reference_partner_share: String(
      booking.reference_partner_share || ""
    ),

    provider_partner_share: String(
      booking.provider_partner_share || ""
    ),

    fuel_quantity: String(
      booking.fuel_quantity || ""
    ),

    account_manager:
      booking.account_manager || "",

    remarks: booking.remarks || "",

    payment_method:
      booking.payment_method || "cash",
  });
};






  // Edit booking (full form)
  // const handleEditBooking = (booking) => {
  //   setEditingBooking(booking._id);
  //   setEditFormData({
  //     bike_id: booking.bike_id,
  //     customer_id: booking.customer_id,
  //     start_datetime: booking.start_datetime.slice(0, 16),
  //     end_datetime: booking.end_datetime.slice(0, 16),
  //     notes: booking.notes || "",
  //     customer_name: booking.customer_name || booking.customers?.name || "",
  //     customer_phone: booking.contact_number || booking.customers?.phone || "",
  //     customer_email: booking.customer_email || booking.customers?.email || "",
  //     customer_location: booking.customer_location || "",
  //     is_new_customer: false,
  //     aadhaar_file: null,
  //     license_file: null,
  //     partner_name: booking.source_name || "",
  //     lead_source: booking.lead_source || "other",
  //     source_name: booking.source_name || "",
  //     rental_type: booking.rental_type || "daily",
  //     total_amount: String(booking.total_amount || ""),
  //     deposit_amount: String(booking.deposit_amount || ""),
  //     reference_partner_share: String(booking.reference_partner_share || ""),
  //     provider_partner_share: String(booking.provider_partner_share || ""),
  //     fuel_quantity: String(booking.fuel_quantity || ""),
  //     account_manager: booking.account_manager || "",
  //     remarks: booking.remarks || "",
  //     payment_method: booking.payment_method || "cash",
  //   });
  // };




  // const handleSaveEdit = async () => {
  //   if (!editingBooking) return;
  //   const start = new Date(editFormData.start_datetime);
  //   const end = new Date(editFormData.end_datetime);
  //   if (end.getTime() <= start.getTime()) {
  //     toast.error("End time must be after start time");
  //     return;
  //   }
  //   if (!editFormData.total_amount || Number(editFormData.total_amount) <= 0) {
  //     toast.error("Please enter rental amount");
  //     return;
  //   }

  //   try {
  //     await updateBooking.mutateAsync({
  //       id: editingBooking,
  //       start_datetime: start.toISOString(),
  //       end_datetime: end.toISOString(),
  //       total_amount: Number(editFormData.total_amount),
  //       customer_name: editFormData.customer_name || undefined,
  //       contact_number: editFormData.customer_phone || undefined,
  //       customer_email: editFormData.customer_email || undefined,
  //       customer_location: editFormData.customer_location || undefined,
  //       lead_source: editFormData.lead_source,
  //       source_name: editFormData.source_name || undefined,
  //       rental_type: editFormData.rental_type,
  //       deposit_amount: Number(editFormData.deposit_amount) || 0,
  //       reference_partner_share:
  //         Number(editFormData.reference_partner_share) || undefined,
  //       provider_partner_share:
  //         Number(editFormData.provider_partner_share) || undefined,
  //       fuel_quantity: Number(editFormData.fuel_quantity) || undefined,
  //       account_manager: editFormData.account_manager || undefined,
  //       remarks: editFormData.remarks || undefined,
  //       notes: editFormData.notes || undefined,
  //       payment_method: editFormData.payment_method,
  //     });
  //     setEditingBooking(null);
  //     toast.success("Booking updated successfully");
  //   } catch (err) {
  //     toast.error("Failed to update booking");
  //   }
  // };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    const start = new Date(editFormData.start_datetime);
    const end = new Date(editFormData.end_datetime);

    if (end.getTime() <= start.getTime()) {
      toast.error("End time must be after start time");
      return;
    }

    if (!editFormData.total_amount || Number(editFormData.total_amount) <= 0) {
      toast.error("Please enter rental amount");
      return;
    }

    try {
      await updateBooking.mutateAsync({
        id: editingBooking,
        data: {
          start_datetime: start.toISOString(),
          end_datetime: end.toISOString(),
          total_amount: Number(editFormData.total_amount),

          customer_name: editFormData.customer_name || undefined,
          contact_number: editFormData.customer_phone || undefined,
          customer_email: editFormData.customer_email || undefined,
          customer_location: editFormData.customer_location || undefined,

          lead_source: editFormData.lead_source,
          source_name: editFormData.source_name || undefined,
          rental_type: editFormData.rental_type,

          deposit_amount: Number(editFormData.deposit_amount) || 0,

          reference_partner_share:
            Number(editFormData.reference_partner_share) || undefined,

          provider_partner_share:
            Number(editFormData.provider_partner_share) || undefined,

          fuel_quantity: Number(editFormData.fuel_quantity) || undefined,

          account_manager: editFormData.account_manager || undefined,

          remarks: editFormData.remarks || undefined,
          notes: editFormData.notes || undefined,

          payment_method: editFormData.payment_method,
        },
      });

      setEditingBooking(null);
      toast.success("Booking updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  const handleExtraDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (extraDocPreviews.length + files.length > 5) {
      toast.error("Maximum 5 extra documents allowed");
      return;
    }

    setExtraDocFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setExtraDocPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExtraDoc = (index) => {
    const itemToRemove = extraDocPreviews[index];

    // Logic to sync binary files and previews
    if (
      typeof itemToRemove === "string" &&
      (itemToRemove.startsWith("data:") || itemToRemove.startsWith("blob:"))
    ) {
      const binaryIndex = extraDocPreviews
        .slice(0, index)
        .filter(
          (src) => src.startsWith("data:") || src.startsWith("blob:"),
        ).length;
      setExtraDocFiles((prev) => prev.filter((_, i) => i !== binaryIndex));
    }

    setExtraDocPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const availableBikes = bikes?.filter((b) => b.status !== "maintenance");

  const [bikeSearch, setBikeSearch] = useState("");
  const filteredBikes = useMemo(() => {
    if (!availableBikes) return [];
    if (!bikeSearch) return availableBikes;
    const q = bikeSearch.toLowerCase();
    return availableBikes.filter(
      (bike) =>
        bike.model.toLowerCase().includes(q) ||
        bike.number_plate.toLowerCase().includes(q),
    );
  }, [availableBikes, bikeSearch]);

  // Render form fields (shared between create & edit)
  const renderFormFields = (data, setData, isEdit = false) => (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Vehicle & Rental
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Bike *</Label>
            <Select
              value={data.bike_id}
              onValueChange={(v) => setData({ ...data, bike_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a bike" />
              </SelectTrigger>
              <SelectContent>
                {/* Search Input Container */}
                <div className="flex items-center px-3 pb-2 border-b sticky top-0 bg-popover z-50">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search model or plate..."
                    className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0"
                    value={bikeSearch}
                    onChange={(e) => setBikeSearch(e.target.value)}
                    onKeyDown={(e) => {
                      // This prevents the Select from closing when pressing space
                      e.stopPropagation();
                    }}
                  />
                  {bikeSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBikeSearch("");
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[200px]">
                  {filteredBikes.length > 0 ? (
                    filteredBikes.map((bike) => (
                      <SelectItem key={bike._id} value={bike._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{bike.model}</span>
                          <span className="text-xs text-muted-foreground">
                            {bike.number_plate}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No bikes found
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rental Type *</Label>
            <Select
              value={data.rental_type}
              onValueChange={(v) => setData({ ...data, rental_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date/Time *</Label>
          <Input
            type="datetime-local"
            className="[color-scheme:dark]"
            value={data.start_datetime}
            onChange={(e) =>
              setData({ ...data, start_datetime: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>End Date/Time *</Label>
          <Input
            type="datetime-local"
            className="[color-scheme:dark]"
            value={data.end_datetime}
            onChange={(e) => setData({ ...data, end_datetime: e.target.value })}
          />
        </div>
      </div> */}

      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date/Time *</Label>
            <Input
              type="datetime-local"
              className="[color-scheme:dark]"
              value={data.start_datetime}
              onChange={(e) =>
                setData({
                  ...data,
                  start_datetime: roundToHour(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>End Date/Time *</Label>
            <Input
              type="datetime-local"
              className="[color-scheme:dark]"
              value={data.end_datetime}
              onChange={(e) =>
                setData({ ...data, end_datetime: roundToHour(e.target.value) })
              }
            />
          </div>
        </div>

        {!isEdit && availabilityMessage && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm mt-2 border ${
              isAvailable
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{availabilityMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Rental Amount (₹) *</Label>
          <Input
            type="number"
            min="0"
            placeholder="Enter rental amount"
            value={data.total_amount}
            onChange={(e) => setData({ ...data, total_amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Deposit Amount (₹)</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={data.deposit_amount}
            onChange={(e) =>
              setData({ ...data, deposit_amount: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Lead Source
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lead Source *</Label>
            <Select
              value={data.lead_source}
              onValueChange={(v) => setData({ ...data, lead_source: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="personal_reference">
                  Personal Reference
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source Name</Label>
            <Input
              placeholder="e.g. Hotel Taj, Instagram"
              value={data.source_name}
              onChange={(e) =>
                setData({ ...data, source_name: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Partner / Referral Name</Label>
          <Input
            placeholder="Enter partner or referral name"
            value={data.partner_name}
            onChange={(e) => setData({ ...data, partner_name: e.target.value })}
          />
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Details
            </h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border"
                checked={data.is_new_customer}
                onChange={(e) =>
                  setData({
                    ...data,
                    is_new_customer: e.target.checked,
                    customer_id: "",
                  })
                }
              />
              New Customer
            </label>
          </div>

          {data.is_new_customer ? (
            <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Customer Name *"
                  value={data.customer_name}
                  onChange={(e) =>
                    setData({ ...data, customer_name: e.target.value })
                  }
                />
                <Input
                  placeholder="Phone Number *"
                  value={data.customer_phone}
                  onChange={(e) =>
                    setData({ ...data, customer_phone: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={data.customer_email}
                  onChange={(e) =>
                    setData({ ...data, customer_email: e.target.value })
                  }
                />
                <Input
                  placeholder="Location"
                  value={data.customer_location}
                  onChange={(e) =>
                    setData({ ...data, customer_location: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Search customer by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="mb-2"
              />
              <Select
                value={data.customer_id}
                onValueChange={(v) => setData({ ...data, customer_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select existing customer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No customers found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {isEdit && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Customer Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Customer Name"
              value={data.customer_name}
              onChange={(e) =>
                setData({ ...data, customer_name: e.target.value })
              }
            />
            <Input
              placeholder="Phone Number"
              value={data.customer_phone}
              onChange={(e) =>
                setData({ ...data, customer_phone: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={data.customer_email}
              onChange={(e) =>
                setData({ ...data, customer_email: e.target.value })
              }
            />
            <Input
              placeholder="Location"
              value={data.customer_location}
              onChange={(e) =>
                setData({ ...data, customer_location: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {!isEdit && data.is_new_customer && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aadhaar Card Photo</Label>
              <div
                onClick={() => aadhaarInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors min-h-[100px] flex items-center justify-center"
              >
                {aadhaarPreview ? (
                  <div>
                    <img
                      src={aadhaarPreview}
                      alt="Aadhaar"
                      className="max-h-20 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload Aadhaar
                    </p>
                  </div>
                )}
                <input
                  ref={aadhaarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAadhaarChange(e, setData, data)}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>License Photo</Label>
              <div
                onClick={() => licenseInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors min-h-[100px] flex items-center justify-center"
              >
                {licensePreview ? (
                  <div>
                    <img
                      src={licensePreview}
                      alt="License"
                      className="max-h-20 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload License
                    </p>
                  </div>
                )}
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLicenseChange(e, setData, data)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Documents (Max 5)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleExtraDocsChange}
                className="cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2 mt-2">
                {extraDocPreviews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-md overflow-hidden border"
                  >
                    <img
                      src={src}
                      alt="doc"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraDoc(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Payment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={data.payment_method}
              onValueChange={(v) => setData({ ...data, payment_method: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fuel Quantity (L)</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={data.fuel_quantity}
              onChange={(e) =>
                setData({ ...data, fuel_quantity: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Partner Shares
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Reference Partner Share (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.reference_partner_share}
              onChange={(e) =>
                setData({ ...data, reference_partner_share: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Provider Partner Share (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.provider_partner_share}
              onChange={(e) =>
                setData({ ...data, provider_partner_share: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Additional Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account Manager</Label>
            <Input
              placeholder="Manager name"
              value={data.account_manager}
              onChange={(e) =>
                setData({ ...data, account_manager: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Quick note..."
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Remarks</Label>
          <Textarea
            placeholder="Detailed remarks..."
            value={data.remarks}
            onChange={(e) => setData({ ...data, remarks: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage rental bookings</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          {/* <DialogTrigger asChild>
            <Button className="gradient-sunset text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </DialogTrigger> */}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <DialogTrigger asChild>
              <Button className="gradient-sunset text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> New Booking
              </Button>
            </DialogTrigger>
          </div>

          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
            <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl">
                Create Manual Booking
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-auto">
              <form onSubmit={handleCreateBooking} className="space-y-6 p-6">
                {renderFormFields(formData, setFormData, false)}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-sunset"
                    disabled={uploading || isAvailable === false}
                  >
                    {uploading ? "Creating..." : "Create Booking"}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl">Edit Booking</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-6 p-6">
              {renderFormFields(editFormData, setEditFormData, true)}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="gradient-sunset">
                  Save Changes
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!startRideDialog}
        onOpenChange={(open) => !open && setStartRideDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" /> Start Ride - Record Fuel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter fuel level (liters) before handing over the bike.
            </p>
            <div className="space-y-2">
              <Label>Fuel Out (Liters)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={startRideData.fuel_out_liters}
                onChange={(e) =>
                  setStartRideData({ fuel_out_liters: e.target.value })
                }
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStartRideDialog(null);
              }}
            >
              Skip
            </Button>
            <Button
              onClick={handleStartRideConfirm}
              className="gradient-sunset"
            >
              Start Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!completionDialog}
        onOpenChange={(open) => !open && setCompletionDialog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Complete Ride
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 py-4 pr-2">
              {completionDialog &&
                (() => {
                  const b = bookings?.find((x) => x._id === completionDialog);
                  return b && (b.deposit_amount ?? 0) > 0 ? (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
                      <span className="text-muted-foreground">
                        Deposit Collected:
                      </span>{" "}
                      <span className="font-bold">
                        ₹{b.deposit_amount?.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deductions (penalty + challan + damage) will be
                        subtracted from deposit.
                      </p>
                    </div>
                  ) : null;
                })()}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Fuel className="w-4 h-4" /> End Fuel (Liters)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={completionData.fuel_in_liters}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      fuel_in_liters: e.target.value,
                    })
                  }
                  placeholder="e.g., 2.0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" /> Penalty
                  Amount (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.penalty_amount}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      penalty_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" /> Challan / Traffic
                  Violation (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.challan_amount}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      challan_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-600" /> Damage Cost (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.damage_cost}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      damage_cost: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              {(() => {
                const penalty = Number(completionData.penalty_amount) || 0;
                const challan = Number(completionData.challan_amount) || 0;
                const damage = Number(completionData.damage_cost) || 0;
                const total = penalty + challan + damage;
                const b = bookings?.find((x) => x._id === completionDialog);
                const deposit = b?.deposit_amount || 0;
                const refund = Math.max(0, deposit - total);
                if (total > 0) {
                  return (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm space-y-1">
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        Total Deductions: ₹{total.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">
                        Deposit: ₹{deposit.toLocaleString()} → Refundable: ₹
                        {refund.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={completionData.payment_method}
                  onValueChange={(v) =>
                    setCompletionData({ ...completionData, payment_method: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Screenshot</Label>

                <div
                  onClick={() =>
                    document.getElementById("payment-upload").click()
                  }
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50"
                >
                  {paymentPreview ? (
                    <img
                      src={paymentPreview}
                      className="max-h-24 mx-auto rounded"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Upload Payment Screenshot
                    </p>
                  )}

                  <input
                    id="payment-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Final Remarks</Label>
                <Textarea
                  placeholder="Any final notes about the ride..."
                  value={completionData.remarks}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      remarks: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCompletionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompletionConfirm}
              className="gradient-sunset"
            >
              Complete Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, bike, plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v)}
          className="w-full"
        >
          <div className="relative w-full overflow-x-auto pb-1 -mb-1">
            <TabsList className="inline-flex w-max sm:w-full sm:flex bg-muted p-1">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                Pending
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="flex-1">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings?.map((booking, index) => {
            const isOnline = booking.booking_source === "online";
            const isPartner = booking.booking_source === "partner";
            const isExpanded = expandedBookingId === booking._id;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
              >
                <Card
                  className={`group overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                    isOnline
                      ? "border-l-4 border-l-blue-500 border-border"
                      : isPartner
                        ? "border-l-4 border-l-purple-500 border-border"
                        : "border-l-4 border-l-orange-500 border-border"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${sourceColors[booking.booking_source] || "bg-muted text-muted-foreground"} border text-[11px] gap-1`}
                        >
                          {sourceIcons[booking.booking_source]}
                          {getSourceLabel(booking.booking_source)}
                        </Badge>
                        {booking.lead_source &&
                          booking.lead_source !== "other" && (
                            <span className="text-[11px] text-muted-foreground capitalize hidden sm:inline">
                              via {booking.lead_source.replace("_", " ")}
                              {booking.source_name
                                ? ` · ${booking.source_name}`
                                : ""}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${statusColors[booking.status]} border text-[11px]`}
                        >
                          {booking.status}
                        </Badge>
                        <Badge
                          className={`${paymentStatusColors[booking.payment_status || "pending"]} border text-[11px] gap-1`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {booking.payment_status === "paid"
                            ? "Paid"
                            : booking.payment_status === "failed"
                              ? "Failed"
                              : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              Customer
                            </p>
                            <p className="font-semibold text-foreground text-sm truncate">
                              {booking.customers?.name ||
                                booking.customer_name ||
                                "—"}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {booking.customers?.phone ||
                                  booking.contact_number ||
                                  "—"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              Bike
                            </p>
                            <p className="font-semibold text-foreground text-sm truncate">
                              {booking.bikes?.model || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.bikes?.number_plate}
                            </p>
                          </div>

                          {/* <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              Duration
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <Calendar className="w-3 h-3 shrink-0 text-primary" />
                              <span>
                                {format(
                                  new Date(booking.start_datetime),
                                  "dd MMM, h:mm a",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                to{" "}
                                {format(
                                  new Date(booking.end_datetime),
                                  "dd MMM, h:mm a",
                                )}
                              </span>
                            </div>
                          </div> */}

                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              Duration
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <Calendar className="w-3 h-3 shrink-0 text-primary" />
                              <span>
                                {new Date(
                                  booking.start_datetime,
                                ).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                  timeZone: "UTC", // This is the magic line
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                to{" "}
                                {new Date(booking.end_datetime).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "UTC",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          {/* {availabilityMessage && (
                            <div
                              className={`p-3 rounded-lg text-sm mb-4 ${isAvailable ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
                            >
                              {availabilityMessage}
                            </div>
                          )} */}

                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              Amount
                            </p>
                            <p className="text-lg font-bold text-foreground flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {booking.total_amount?.toLocaleString() || 0}
                            </p>
                            {(booking.deposit_amount ?? 0) > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Dep: ₹{booking.deposit_amount?.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpandedBookingId(
                                isExpanded ? null : booking._id,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            )}
                            {isExpanded ? "Collapse" : "View"}
                          </Button>

                          {(booking.status === "active" ||
                            booking.status === "confirmed" ||
                            booking.status === "pending") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBooking(booking)}
                              className="text-blue-600 hover:bg-blue-50 border-blue-200 dark:hover:bg-blue-500/10"
                            >
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          )}

                          {booking.payment_status !== "paid" &&
                            booking.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkPaid(booking._id)}
                                className="text-green-600 hover:bg-green-50 border-green-200 dark:hover:bg-green-500/10"
                              >
                                <CreditCard className="w-4 h-4 mr-1" /> Paid
                              </Button>
                            )}

                          {statusActions[booking.status]?.map((action) => (
                            <Button
                              key={action.next}
                              size="sm"
                              variant={
                                action.next === "cancelled"
                                  ? "outline"
                                  : "default"
                              }
                              onClick={() =>
                                handleStatusUpdate(booking._id, action.next)
                              }
                              className={
                                action.next === "cancelled"
                                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  : "gradient-sunset"
                              }
                            >
                              {action.icon}
                              <span className="ml-1 hidden sm:inline">
                                {action.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Email
                                </span>
                                <p className="font-medium">
                                  {booking.customer_email ||
                                    booking.customers?.email ||
                                    "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Location
                                </span>
                                <p className="font-medium">
                                  {booking.customer_location || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Rental Type
                                </span>
                                <p className="font-medium capitalize">
                                  {booking.rental_type || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Payment
                                </span>
                                <p className="font-medium capitalize">
                                  {booking.payment_method || "—"} ·{" "}
                                  {booking.payment_status || "pending"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Lead Source
                                </span>
                                <p className="font-medium capitalize">
                                  {booking.lead_source?.replace("_", " ") ||
                                    "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Source Name
                                </span>
                                <p className="font-medium">
                                  {booking.source_name || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Account Manager
                                </span>
                                <p className="font-medium">
                                  {booking.account_manager || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Deposit
                                </span>
                                <p className="font-medium">
                                  ₹
                                  {booking.deposit_amount?.toLocaleString() ||
                                    0}
                                </p>
                              </div>
                              {/* {booking.fuel_quantity && ( */}
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Fuel Qty
                                </span>
                                <p className="font-medium">
                                  {booking.fuel_quantity} L
                                </p>
                              </div>
                              {/* )} */}
                              {booking.fuel_out_liters && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    Fuel Out
                                  </span>
                                  <p className="font-medium">
                                    {booking.fuel_out_liters} L
                                  </p>
                                </div>
                              )}
                              {booking.fuel_in_liters && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    Fuel In
                                  </span>
                                  <p className="font-medium">
                                    {booking.fuel_in_liters} L
                                  </p>
                                </div>
                              )}
                              {/* {booking.reference_partner_share && ( */}
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Ref Share
                                </span>
                                <p className="font-medium">
                                  ₹{booking.reference_partner_share}
                                </p>
                              </div>
                              {/* )} */}
                              {/* {booking.provider_partner_share && ( */}
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Provider Share
                                </span>
                                <p className="font-medium">
                                  ₹{booking.provider_partner_share}
                                </p>
                              </div>
                              {/* )} */}
                              {(booking.penalty_amount ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    Penalty
                                  </span>
                                  <p className="font-medium text-red-600">
                                    ₹{booking.penalty_amount}
                                  </p>
                                </div>
                              )}
                              {(booking.challan_amount ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    Challan
                                  </span>
                                  <p className="font-medium text-red-600">
                                    ₹{booking.challan_amount}
                                  </p>
                                </div>
                              )}
                              {(booking.damage_cost ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    Damage
                                  </span>
                                  <p className="font-medium text-red-600">
                                    ₹{booking.damage_cost}
                                  </p>
                                </div>
                              )}
                            </div>

                            {booking.payment_screenshot && (
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  Payment Proof
                                </span>

                                <img
                                  src={booking.payment_screenshot}
                                  className="w-20 h-20 object-cover rounded mt-1 cursor-pointer hover:scale-105 transition"
                                  onClick={() =>
                                    setPreviewImage(booking.payment_screenshot)
                                  }
                                />
                              </div>
                            )}

                            {(booking.notes || booking.remarks) && (
                              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3">
                                {booking.notes && (
                                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    📝 {booking.notes}
                                  </p>
                                )}
                                {booking.remarks && (
                                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    💬 {booking.remarks}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {previewImage && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              />
            </div>
          )}

          {filteredBookings?.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
