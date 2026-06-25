import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen"; 
import WhatsAppButton from "./components/WhatsAppButton";

// Pages
import Home from "./pages/Home";
import Updates from "./pages/Updates";
import ExpiringDrives from "./pages/ExpiringDrives";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DriveDetails from "./pages/DriveDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AddDrive from "./pages/AddDrive";
import OAuth2SuccessPage from "./pages/OAuth2SuccessPage";
import DriveCalendar from "./pages/DriveCalendar";
import SavedDrives from "./pages/SavedDrives";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageHighlightedDrives from "./pages/ManageHighlightedDrives";

// Legal Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";

function App() {
  const [splashDone, setSplashDone] = useState(false); 
  return (
    <ThemeProvider>
        {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />} 
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Navbar />
        <WhatsAppButton />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/expiring-drives" element={<ExpiringDrives />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

          <Route path="/drives/:id" element={<DriveDetails />} />
          <Route path="/saved-drives" element={<SavedDrives />} />
          <Route path="/calendar" element={<DriveCalendar />} />

          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          <Route path="/admin" element={<AdminDashboard />} />

          {/* Admin or Employee only */}
          <Route
            path="/add-drive"
            element={
              <ProtectedRoute roleRequired={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <AddDrive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/highlighted-drives"
            element={
              <ProtectedRoute roleRequired={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <ManageHighlightedDrives />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;