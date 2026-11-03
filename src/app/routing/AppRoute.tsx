import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import AppLayout from "../../_egdi_ilb/layout/AppLayout";
import LoginPage from "../modules/auth/components/LoginPage";
import UserPage from "../modules/user/components/UserPage";

const ProtectedRoute = () => {
    const { user } = useAuth();

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoute = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/management" element={<AppLayout />}>
                    <Route index element={null} />
                    <Route path="user" element={<UserPage />} />
                    <Route path="*" element={null} />
                </Route>
            </Route>
            <Route path="/" element={<Navigate to="/management" replace />} />
            <Route path="*" element={<Navigate to="/management" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoute;
