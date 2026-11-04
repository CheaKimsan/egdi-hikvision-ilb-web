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
import UserPage from "../modules/account/users/components/UserPage";
import RolePage from "../modules/account/roles/components/RolePage";
import DeviceManagementPage from "../modules/account/device-management/components/DeviceManagementPage";
import NetworkPage from "../modules/account/network/components/NetworkPage";

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
                    <Route path="role" element={<RolePage />} />
                    <Route path="device-management" element={<DeviceManagementPage />} />
                    {/* <Route path="network-settings" element={<NetworkPage />} /> */}
                    <Route path="*" element={null} />
                </Route>
            </Route>
            <Route path="/" element={<Navigate to="/management" replace />} />
            <Route path="*" element={<Navigate to="/management" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoute;
