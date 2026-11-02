import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import LoginPage from "../modules/auth/components/LoginPage";




const AppRoute = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoute;
