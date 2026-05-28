import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = {
      user: "/user/dashboard",
      seller: "/seller/dashboard",
      admin: "/admin/dashboard",
      deliveryPartner: "/delivery/dashboard",
    };
    return <Navigate to={redirect[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;

