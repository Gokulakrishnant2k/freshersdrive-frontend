import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roleRequired }) {
  const { auth } = useAuth();

  if (!auth.token) return <Navigate to="/login" />;

  if (roleRequired && auth.role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;