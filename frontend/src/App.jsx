
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./Pages/Index";
import NotFound from "./Pages/NotFound";
import Catalog from "./Pages/Catalog";
import Bikes from "./Pages/admin/Bikes";
import BookBike from "./Pages/BookBike";
import ScrollToTop from "./components/ScrollToTop";
import Bookings from "./Pages/admin/Booking";
import AdminLayout from "./components/admin/AdminLayout";
import Areas from "./Pages/admin/Areas";
import Customers from "./Pages/admin/Customers";
import ActiveRentals from "./Pages/admin/ActiveRentals";
import Scheduler from "./Pages/admin/Scheduler";
import Reports from "./Pages/admin/Reports";
import Dashboard from "./Pages/admin/Dashboard";
import { AuthProvider } from "./lib/AuthProvider";
import AdminLogin from "./Pages/AdminLogin";
import Settings from "./Pages/admin/Settings";
import Contact from "./components/Contact";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsAndConditions from "./Pages/TermsAndConditions";
import RefundPolicy from "./Pages/RefundPolicy";
import AnalyticsTracker from "./Pages/AnalyticsTracker";
import NotificationsCenter from "./Pages/admin/Notifications";
import Clusters from "./Pages/admin/Clusters";




const queryClient = new QueryClient();


const App = () => {

  // 📱 SYSTEM REGISTER: Initialize Service Worker stream interface context
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Pipip Background Engine Connected"))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  return(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/catalog" element={<Catalog />} />

          <Route path="/admin/panel" element={<AdminLayout />}>
          <Route path="bikes" element={<Bikes />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="areas" element={<Areas />} />
          <Route path="customers" element={<Customers />} />
          <Route path="active-rentals" element={<ActiveRentals />} />
          <Route path="scheduler" element={<Scheduler />} />
          {/* 👈 NEW: Mount Notifications View cleanly within Admin Grid matching paths entry */}
          <Route path="notifications" element={<NotificationsCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          </Route>
           

           <Route path="/book/:bikeId" element={<BookBike />} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
           
           
        </Routes>
        <AnalyticsTracker/>
      </BrowserRouter>
      </AuthProvider>
      </QueryClientProvider>
  ) 
};

export default App;
