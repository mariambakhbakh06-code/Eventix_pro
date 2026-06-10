import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const context = useContext(AuthContext);

  if (!context) return <div>Auth error</div>;

  const { user, loading } = context;

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/signin" />;

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}