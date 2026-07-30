import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./style/App.scss";
import './style/component/Form.scss';
import "./style/Home.scss";
import "./style/component/resultat-banner.scss";
import "./style/MultiStepForm.scss";
import "./style/Resultat.scss";
import "./style/loading.scss";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./Pages/Welcome";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Footer from './component/Footer.jsx';
import MultiStepForm from "./Pages/MultiStepForm.jsx";
import Contact from "./component/home/Contact.jsx";
import Resultat from "./Pages/Resultat.jsx";
import MyOrientations from "./Pages/MyOrientations.jsx";
import Modal from "./uikits/Modal.jsx";
import PaymentCallback from "./Pages/PaymentCallback.jsx";

function AppWrapper() {
  const location = useLocation();

  const hideLayout = location.pathname === "/step" || 
                    location.pathname === "/welcome" ||
                    location.pathname === "/register" ||
                    location.pathname === "/login" ||
                    location.pathname === "/forgot-password" ||
                    location.pathname === "/payment/callback";

  const publicRoutes = ["/welcome", "/register", "/login", "/forgot-password", "/payment/callback"];

  return (
    <>
      <Modal />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
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
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
