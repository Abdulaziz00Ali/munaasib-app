import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, Transition } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import Home from "./pages/Home.tsx";
import Bookings from "./pages/Bookings.tsx";
import Explore from "./pages/Explore.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import AccountInfo from "./pages/AccountInfo.tsx";
import PrivacySecurity from "./pages/PrivacySecurity.tsx";
import Notifications from "./pages/Notifications.tsx";
import Messages from "./pages/Messages.tsx";
import Help from "./pages/Help.tsx";
import BookingForm from "./pages/BookingForm.tsx";
import EventPlanner from "./pages/EventPlanner.tsx";
import Events from "./pages/Events.tsx";
import CategoryDetails from "./pages/CategoryDetails.tsx";
import NotFound from "./pages/NotFound.tsx";
import SignIn from "./pages/SignIn.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import VerificationCode from "./pages/VerificationCode.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import VendorDashboard from "./pages/VendorDashboard.tsx";
import Kitchens from "./pages/Kitchens.tsx";
import Halls from "./pages/Halls.tsx";
import Coffee from "./pages/Coffee.tsx";
import Extras from "./pages/Extras.tsx";
import Layout from "@/components/layout/Layout.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";
import VenueImageManager from "./pages/VenueImageManager.tsx";
import ServiceDetails from "./pages/ServiceDetails.tsx";
import Investors from "./pages/Investors.tsx";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, x: -10 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 10 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

const AppLayout = () => (
  <Layout>
    <AnimatedOutlet />
  </Layout>
);

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading for 1.5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          {/* removed <WhatsAppNumberChecker /> since WhatsApp integration is no longer used */}
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking/:id" element={<BookingForm />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/kitchens" element={<Kitchens />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/events" element={<Events />} />
              <Route path="/halls" element={<Halls />} />
              <Route path="/coffee" element={<Coffee />} />
              <Route path="/extras" element={<Extras />} />
              <Route path="/category/:category" element={<CategoryDetails />} />
              <Route path="/category" element={<CategoryDetails />} />
              <Route path="/service/:id" element={<ServiceDetails />} />
              <Route path="/venue-images/:venueId" element={<VenueImageManager />} />

              {/* Added missing routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/account-info" element={<AccountInfo />} />
              <Route path="/privacy-security" element={<PrivacySecurity />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/help" element={<Help />} />
              <Route path="/event-planner" element={<EventPlanner />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/investors" element={<Investors />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Routes without Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verification-code" element={<VerificationCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
