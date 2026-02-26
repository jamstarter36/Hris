  import { Navigate } from "react-router-dom";
  import { useAuth } from "../context/AuthStorage";

  const ProtectedRoute = ({ element, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return element;
  };

  export default ProtectedRoute;