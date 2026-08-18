import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from 'sonner';

import "./style/App.scss";
import './style/component/Form.scss';
import "./style/Home.scss";
import "./style/component/resultat-banner.scss";
import "./style/MultiStepForm.scss";
import "./style/Resultat.scss";
import "./style/loading.scss";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SmoothScroll from "./components/SmoothScroll";
  
import Welcome from "./Pages/Welcome";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Footer from './component/Footer.jsx';
import MultiStepForm from "./Pages/MultiStepForm.jsx";
import GuestMultiStepForm from "./Pages/GuestMultiStepForm.jsx";
import Contact from "./component/home/Contact.jsx";
import Resultat from "./Pages/Resultat.jsx";
import GuestResultat from "./Pages/GuestResultat.jsx";
import MyOrientations from "./Pages/MyOrientations.jsx";
import Modal from "./uikits/Modal.jsx";
import PaymentCallback from "./Pages/PaymentCallback.jsx";
import EarlyAdopter from "./Pages/EarlyAdopter.jsx";
import PromoEnded from "./Pages/PromoEnded.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Overview from "./Pages/Dashboard/Overview.jsx";
import DashboardResults from "./Pages/Dashboard/Results.jsx";
import DashboardSectors from "./Pages/Dashboard/Sectors.jsx";
import DashboardReviews from "./Pages/Dashboard/Reviews.jsx";
import DashboardStats from "./Pages/Dashboard/Stats.jsx";
import DashboardSteps from "./Pages/Dashboard/Steps.jsx";

function AppWrapper() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const hideLayout = location.pathname === "/step" ||
                    location.pathname === "/guest-step" ||
                    location.pathname === "/welcome" ||
                    location.pathname === "/register" ||
                    location.pathname === "/login" ||
                    location.pathname === "/forgot-password" ||
                    location.pathname === "/payment/callback" ||
                    location.pathname === "/early-adopter" ||
                    location.pathname.startsWith("/dashboard");

  const publicRoutes = ["/welcome", "/register", "/login", "/forgot-password", "/payment/callback"];

  // Redirection pour welcome si déjà connecté
  const WelcomeRedirect = () => {
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <Welcome />;
  };

  // Redirection pour login si déjà connecté
  const LoginRedirect = () => {
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <Login />;
  };

  // Redirection pour register si déjà connecté
  const RegisterRedirect = () => {
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <Register />;
  };

  // Redirection pour home si déjà connecté -> vers dashboard
  const HomeRedirect = () => {
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <Home />;
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Modal />
      <Routes>
        <Route path="/" element={<WelcomeRedirect />} />
        <Route path="/welcome" element={<WelcomeRedirect />} />
        <Route path="/register" element={<RegisterRedirect />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/promo-ended" element={<PromoEnded />} />
        <Route path="/guest-step" element={<GuestMultiStepForm />} />
        <Route path="/guest-result/:guestId" element={<GuestResultat />} />
        <Route path="/early-adopter" element={
          <ProtectedRoute>
            <EarlyAdopter />
          </ProtectedRoute>
        } />
        
        <Route path="/home" element={<HomeRedirect />} />
        <Route path="/resultat/:orientId" element={
          <ProtectedRoute>
            <Resultat />
          </ProtectedRoute>
        } />
        <Route path="/resultat" element={
          <ProtectedRoute>
            <Resultat />
          </ProtectedRoute>
        } />
        <Route path="/step" element={
          <ProtectedRoute>
            <MultiStepForm />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path="/mes-orientations" element={
          <ProtectedRoute>
            <MyOrientations />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="steps" element={<DashboardSteps />} />
          <Route path="results" element={<DashboardResults />} />
          <Route path="sectors" element={<DashboardSectors />} />
          <Route path="reviews" element={<DashboardReviews />} />
          <Route path="stats" element={<DashboardStats />} />
        </Route>
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll />
        <AppWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
