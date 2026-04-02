import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  User,
  CreditCard,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";




import { toast } from "sonner";
import { Button } from "../components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useBike } from "../hooks/useBikes";
import { useActiveAreas } from "../hooks/useAreas";
import { useBikeAvailability } from "../hooks/useBikeAvailability";
import { useCreateCustomer } from "../hooks/useCustomer";
import { useCreateBooking } from "../hooks/useBooking";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";

const initialCustomerData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  id_proof_type: "aadhaar",
  id_proof_number: "",
  aadhaar_image: null, // 👈 FILE
  license_image: null, // 👈 FILE
};
export default function BookBike() {
 
    const { bikeId } = useParams();
  
    
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const areaParam = searchParams.get("area");

  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const [startDate, setStartDate] = useState(startParam || "");
  const [endDate, setEndDate] = useState(endParam || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);

  const { data: bike, isLoading: bikeLoading } = useBike(bikeId || "");
  const { data: areas } = useActiveAreas();
  const createCustomer = useCreateCustomer();
  const createBooking = useCreateBooking();
  const { checkAvailability, checking } = useBikeAvailability();

  /* =========================
     AVAILABILITY CHECK
  ========================= */
  useEffect(() => {
    const checkDates = async () => {
      if (!bikeId || !startDate || !endDate) {
        setAvailabilityMessage(null);
          setIsAvailable(null);
          
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setAvailabilityMessage("⚠️ Return date must be after pickup date");
        setIsAvailable(false);
        return;
      }

        const result = await checkAvailability(bikeId, start, end);
        
     if (!result.isAvailable) {
       const fromDate = new Date(result.bookedFrom).toLocaleDateString(
         "en-IN",
         {
           day: "2-digit",
           month: "2-digit",
           year: "numeric",
         },
       );

       const fromTime = new Date(result.bookedFrom).toLocaleTimeString(
         "en-IN",
         {
           hour: "2-digit",
           minute: "2-digit",
         },
         );
         
          const toDate = new Date(result.bookedTo).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            },
          );

       const toTime = new Date(result.bookedTo).toLocaleTimeString("en-IN", {
         hour: "2-digit",
         minute: "2-digit",
       });

       setAvailabilityMessage(
         `Bike is booked from ${fromDate} ${fromTime} to ${toDate} ${toTime}`,
       );
     } else {
       setAvailabilityMessage(result.message);
     }
      setIsAvailable(result.isAvailable);
    };

    checkDates();
  }, [bikeId, startDate, endDate, checkAvailability]);

  /* =========================
     HELPERS
  ========================= */
  const getAreaName = (areaId) => {
    if (!areaId || !areas) return "Mumbai";
    return areas.find((a) => a._id === areaId)?.name || "Mumbai";
  };

  const calculatePrice = () => {
    if (!bike || !startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalHours = Math.max(1, differenceInHours(end, start));

    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    return (
      days * Number(bike.price_per_day) +
      remainingHours * Number(bike.price_per_hour)
    );
  };

  const roundToHour = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    const minutes = date.getMinutes();

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

  /* =========================
     DATE HANDLERS
  ========================= */
  const handleStartDateChange = (value) => {
    setStartDate(roundToHour(value));
  };

  const handleEndDateChange = (value) => {
    setEndDate(roundToHour(value));
  };

  /* =========================
     CUSTOMER STEP
  ========================= */
  const handleCustomerSubmit = (e) => {
    e.preventDefault();

    if (!customerData.name || !customerData.phone) {
      toast.error("Please fill in name and phone number");
      return;
    }

  if (!customerData.aadhaar_image && !customerData.license_image) {
    toast.error("Please upload at least one ID proof");
    return;
  }

    setStep(2);
  };

//online payment

// const handleOnlinePayment =
//   async (bookingId) => {
//     try {
//       const res = await fetch(
//         "https://pipip-backend-eid3.onrender.com/api/payment/create-order",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             amount:
//               calculatePrice(),

//             customerName:
//               customerData.name,

//             customerEmail:
//               customerData.email ||
//               "test@email.com",

//             customerPhone:
//               customerData.phone,

//             bookingId:
//               bookingId,
//           }),
//         }
//       );

//       const data =
//         await res.json();

        

// if (!data.paymentSessionId) {
//   console.error("Payment Error:", data);
//   toast.error("Payment session failed");
//   return;
// }

//       const cashfree =
//         new window.Cashfree({
//           mode: "production",
//         });

//       cashfree.checkout({
//         paymentSessionId:
//           data.paymentSessionId,

//         redirectTarget:
//           "_modal",
//       });

//     } catch (error) {
//       console.error(error);
//     }
//   };

const handleOnlinePayment =
  async (bookingId) => {
    try {

      console.log("Creating payment order...");

      const res = await fetch(
        "https://pipip-backend-eid3.onrender.com/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            amount: calculatePrice(),
            customerName: customerData.name,
            customerEmail:
              customerData.email ||
              "test@email.com",
            customerPhone:
              customerData.phone,
            bookingId,
          }),
        }
      );

      const data =
        await res.json();

      console.log("Payment response:", data);

      if (!data.paymentSessionId) {
        console.error("Payment failed:", data);
        toast.error("Payment failed");
        return;
      }

      const cashfree =
        new window.Cashfree({
          mode: "production",
        });

      cashfree.checkout({
        paymentSessionId:
          data.paymentSessionId,
        redirectTarget: "_modal",
      });

    } catch (error) {

      console.error(
        "PAYMENT ERROR:",
        error
      );

      toast.error(
        "Payment initialization failed"
      );
    }
  };




  /* =========================
     BOOKING SUBMIT
  ========================= */
  // const handleBookingSubmit = async () => {
  //   if (!bike || !startDate || !endDate) return;

  //   setIsSubmitting(true);
  //   try {
  //   const formData = new FormData();

  //   Object.entries(customerData).forEach(([key, value]) => {
  //     if (value !== null) {
  //       formData.append(key, value);
  //     }
  //   });

  //   const customer = await createCustomer.mutateAsync(formData);

  //     await createBooking.mutateAsync({
  //       bike_id: bike._id,
  //       customer_id: customer._id,
  //       start_datetime: new Date(startDate).toISOString(),
  //       end_datetime: new Date(endDate).toISOString(),
  //       total_amount: calculatePrice(),
  //       notes: notes || undefined,
  //       booking_source: "online",
  //       status: "pending",
  //     });

  //     handleOnlinePayment(
  // booking._id);

  //     setBookingComplete(true);
  //     toast.success("Booking request submitted!");
  //   } catch (err) {
  //     toast.error("Failed to create booking");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleBookingSubmit = async () => {
  if (!bike || !startDate || !endDate) return;

  setIsSubmitting(true);

  try {
    console.log("STEP 1: Creating customer");

    const formData = new FormData();

    Object.entries(customerData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value);
      }
    });

    const customer =
      await createCustomer.mutateAsync(formData);

    console.log("Customer created:", customer);

    console.log("STEP 2: Creating booking");

    const booking =
      await createBooking.mutateAsync({
        bike_id: bike._id,
        customer_id: customer._id,
        start_datetime: new Date(startDate).toISOString(),
        end_datetime: new Date(endDate).toISOString(),
        total_amount: calculatePrice(),
        notes: notes || undefined,
        booking_source: "online",
        status: "pending",
      });

    console.log("Booking created:", booking);

    console.log("STEP 3: Starting payment");

    await handleOnlinePayment(
      booking._id
    );

    toast.success("Booking created!");

  } catch (err) {
    console.error("BOOKING ERROR:", err);

    toast.error(
      err?.response?.data?.message ||
      "Failed to create booking"
    );

  } finally {
    setIsSubmitting(false);
  }
};

  


  if (bikeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Bike not found</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Booking Submitted!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your booking request for{" "}
                <span className="text-primary">{bike.model}</span> has been
                received. Our team will contact you shortly to confirm.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>
                  📞 We'll call you at:{" "}
                  <span className="text-foreground">{customerData.phone}</span>
                </p>
                <p>
                  📅 Pickup:{" "}
                  <span className="text-foreground">
                    {format(new Date(startDate), "PPp")}
                  </span>
                </p>
                <p>
                  📅 Return:{" "}
                  <span className="text-foreground">
                    {format(new Date(endDate), "PPp")}
                  </span>
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="gradient-sunset text-primary-foreground"
              >
                Back to Home
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Bike Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-24">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  {bike.image_url ? (
                    <img
                      src={bike.image_url}
                      alt={bike.model}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {bike.model}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    {bike.number_plate} • {bike.cc}cc
                  </p>

                  <div className="flex items-center gap-1 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {getAreaName(bike.area_id)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hourly Rate</span>
                      <span className="text-foreground">
                        ₹{bike.price_per_hour}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate</span>
                      <span className="text-foreground">
                        ₹{bike.price_per_day}
                      </span>
                    </div>
                    {startDate && endDate && (
                      <>
                        <div className="border-t border-border my-2" />
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground">
                            Estimated Total
                          </span>
                          <span className="text-primary">
                            ₹{calculatePrice()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    1
                  </div>
                  <span className="font-medium">Your Details</span>
                </div>
                <div className="flex-1 h-0.5 bg-border" />
                <div
                  className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    2
                  </div>
                  <span className="font-medium">Confirm Booking</span>
                </div>
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Your Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleCustomerSubmit}
                        className="space-y-6"
                      >
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={customerData.name}
                              onChange={(e) =>
                                setCustomerData({
                                  ...customerData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter your name"
                              className="bg-input border-border"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={customerData.phone}
                              onChange={(e) =>
                                setCustomerData({
                                  ...customerData,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+91 98765 43210"
                              className="bg-input border-border"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerData.email}
                              onChange={(e) =>
                                setCustomerData({
                                  ...customerData,
                                  email: e.target.value,
                                })
                              }
                              placeholder="your@email.com"
                              className="bg-input border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="id_number">ID Proof Number</Label>
                            <Input
                              id="id_number"
                              value={customerData.id_proof_number}
                              onChange={(e) =>
                                setCustomerData({
                                  ...customerData,
                                  id_proof_number: e.target.value,
                                })
                              }
                              placeholder="Aadhaar/License Number"
                              className="bg-input border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address (Optional)</Label>
                          <Textarea
                            id="address"
                            value={customerData.address}
                            onChange={(e) =>
                              setCustomerData({
                                ...customerData,
                                address: e.target.value,
                              })
                            }
                            placeholder="Your address"
                            className="bg-input border-border"
                            rows={2}
                          />
                        </div>

                        {/* Document Upload */}
                        <div className="border-t border-border pt-6">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-secondary" />
                            ID Proof Documents
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload Both ID Proof (Aadhaar Card and
                            Driving License)
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Aadhaar Card Photo *</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                required
                                onChange={(e) =>
                                  setCustomerData({
                                    ...customerData,
                                    aadhaar_image: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Driving License Photo *</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                required
                                onChange={(e) =>
                                  setCustomerData({
                                    ...customerData,
                                    license_image: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Booking Dates */}
                        <div className="border-t border-border pt-6">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Booking Period
                          </h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startDate">
                                Pickup Date & Time *
                              </Label>
                              <Input
                                id="startDate"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) =>
                                  handleStartDateChange(e.target.value)
                                }
                                step="3600"
                                className="bg-input border-border [color-scheme:dark] "
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Time will round to nearest hour
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate">
                                Return Date & Time *
                              </Label>
                              <Input
                                id="endDate"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) =>
                                  handleEndDateChange(e.target.value)
                                }
                                min={startDate}
                                step="3600"
                                className="bg-input border-border [color-scheme:dark] "
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Time will round to nearest hour
                              </p>
                            </div>
                          </div>

                          {/* Availability Message */}
                          <AnimatePresence mode="wait">
                            {availabilityMessage && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Alert
                                  className={`${isAvailable ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
                                >
                                  {isAvailable ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <AlertDescription
                                    className={`${isAvailable ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {availabilityMessage}
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {checking && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                              Checking availability...
                            </div>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full gradient-sunset text-primary-foreground"
                          disabled={isAvailable === false || checking}
                        >
                          {isAvailable === false
                            ? "Bike Not Available"
                            : "Continue to Confirm"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Confirm Your Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Customer
                          </span>
                          <span className="text-foreground">
                            {customerData.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-foreground">
                            {customerData.phone}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bike</span>
                          <span className="text-foreground">{bike.model}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pickup</span>
                          <span className="text-foreground">
                            {format(new Date(startDate), "PPp")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Return</span>
                          <span className="text-foreground">
                            {format(new Date(endDate), "PPp")}
                          </span>
                        </div>
                        <div className="border-t border-border pt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-foreground">
                              Total Amount
                            </span>
                            <span className="text-primary text-lg">
                              ₹{calculatePrice()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">
                          Additional Notes (Optional)
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requests or notes..."
                          className="bg-input border-border"
                          rows={2}
                        />
                      </div>

                      {/* Payment Info */}
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                        <p className="text-sm text-foreground">
                          💳 <strong>Payment at Pickup:</strong> Pay when you
                          collect the bike. We accept Cash, UPI, and Cards.
                        </p>
                      </div>

                      {/* <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleBookingSubmit}
                          className="flex-1 gradient-sunset text-primary-foreground"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Confirm Booking"}
                        </Button>
                      </div> */}
                      <div className="flex gap-4">
    <Button
      variant="outline"
      onClick={() => setStep(1)}
      className="flex-1"
      disabled={isSubmitting}
    >
      Back
    </Button>
    <Button
      onClick={handleBookingSubmit}
      className="flex-1 gradient-sunset text-primary-foreground"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
          Processing...
        </div>
      ) : (
        `Pay ₹${calculatePrice()}`
      )}
    </Button>
  </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}