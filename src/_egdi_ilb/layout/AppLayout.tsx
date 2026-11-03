import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => (
    <div className="app-shell">
        <Header />
        <div className="app-layout">
            <Sidebar />
            <main className="app-content">
                <section className="app-content-placeholder" aria-live="polite">
                    <Outlet />
                </section>
            </main>
        </div>
    </div>
);

export default AppLayout;