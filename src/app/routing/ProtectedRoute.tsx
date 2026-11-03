import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <p role="status">Loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
