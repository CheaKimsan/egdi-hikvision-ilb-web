import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import AppLayout from "../../lib/layout/AppLayout";
import LoginPage from "../modules/auth/components/LoginPage";
import UserPage from "../modules/account/users/components/UserPage";
import RolePage from "../modules/account/roles/components/RolePage";
import DeviceManagementPage from "../modules/account/device-management/components/DeviceManagementPage";
import VehiclePage from "../modules/account/vehicle/components/VehiclePage";
import DeviceInstallationPage from "../modules/account/device-installation/components/DeviceInstallationPage";
import ControlCenter from "../../lib/layout/ControlCenter";
import ForgotPasswordPage from "../modules/auth/components/ForgotPasswordPage";
import RegisterPage from "../modules/auth/components/RegisterPage";

const ProtectedRoute = () => {
    const { user } = useAuth();

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoute = () => (
    <BrowserRouter
        future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}
    >
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/control-center" element={<ControlCenter />} />
                <Route path="/management" element={<AppLayout />}>
                    <Route index element={null} />
                    <Route path="user" element={<UserPage />} />
                    <Route path="role" element={<RolePage />} />
                    <Route path="vehicle" element={<VehiclePage />} />
                    <Route path="device" element={<DeviceManagementPage />} />
                    <Route path="device-installation" element={<DeviceInstallationPage />} />
                    <Route path="*" element={null} />
                </Route>
            </Route>
            <Route path="/" element={<Navigate to="/control-center" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoute;
