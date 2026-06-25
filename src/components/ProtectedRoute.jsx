import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roleRequired }) {
  const { auth } = useAuth();

  if (auth.loading) return null;

  if (!auth.token) return <Navigate to="/login" />;

  if (roleRequired) {
    const allowedRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    if (!allowedRoles.includes(auth.role)) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

export default ProtectedRoute;