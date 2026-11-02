import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";

const AppLayout: React.FC = () => (
    <div className="app-shell">
        <Header />
        <main className="app-content">
            <Outlet />
        </main>
    </div>
);

export default AppLayout;