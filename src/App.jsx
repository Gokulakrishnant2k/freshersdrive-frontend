import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
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

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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

          <Route path="/admin" element={<AdminDashboard />} />

          <Route
            path="/add-drive"
            element={
              <ProtectedRoute>
                <AddDrive />
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