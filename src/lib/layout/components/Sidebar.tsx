import React from "react";
import { Avatar } from "@fluentui/react-components";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/modules/auth/AuthContext";
import { dummyDevices, dummyUsers } from "../../data/dummy";
import {
    deviceConfigurationItems,
    FileManagementItems,
    mainItems,
    systemItems,
    type NavigationItem,
} from "../../constants/Navitem";
import { useSidebarStore } from "../../store/useSidebarStore";

const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const displayName = user?.displayName ?? user?.username ?? "User";
    const setActiveItem = useSidebarStore((state) => state.setActiveItem);
    const isCollapsed = useSidebarStore((state) => state.isCollapsed);
    const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
    const allItems = [...mainItems, ...deviceConfigurationItems, ...systemItems];
    const activeItem =
        allItems.find(({ path }) => path === location.pathname)?.label ?? "Dashboard";

    const renderItems = (items: NavigationItem[]) =>
        items.map(({ label, icon: Icon, countKey, path }) => {
            const count = countKey === "devices"
                ? dummyDevices.length
                : countKey === "users"
                    ? dummyUsers.length
                    : undefined;

            return (
                <button
                    key={label}
                    type="button"
                    className={`app-sidebar-link${activeItem === label ? " active" : ""}`}
                    aria-label={count !== undefined ? `${label}, ${count} items` : label}
                    aria-current={activeItem === label ? "page" : undefined}
                    title={label}
                    onClick={() => {
                        setActiveItem(label);
                        navigate(path);
                    }}
                >
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                    <span className="app-sidebar-label">{label}</span>
                    {count !== undefined && count > 0 && (
                        <span className="app-sidebar-badge">{count}</span>
                    )}
                </button>
            );
        });

    return (
        <aside className={`app-sidebar${isCollapsed ? " is-collapsed" : ""}`} aria-label="Main navigation">
            <nav className="app-sidebar-navigation">
                <div className="app-sidebar-group">
                    <div className="app-sidebar-heading-row">
                        <h2 className="app-sidebar-heading">Overview</h2>
                        <button
                            type="button"
                            className="app-sidebar-toggle"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!isCollapsed}
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            onClick={toggleCollapsed}
                        >
                            {isCollapsed ? (
                                <ChevronRightRegular aria-hidden="true" />
                            ) : (
                                <ChevronLeftRegular aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {renderItems(mainItems)}
                </div>
                <div className="app-sidebar-group">
                    <h2 className="app-sidebar-heading">Device Configuration</h2>
                    {renderItems(deviceConfigurationItems)}
                </div>

                <div className="app-sidebar-group">
                    <h2 className="app-sidebar-heading">File Management</h2>
                    {renderItems(FileManagementItems)}
                </div>

                <div className="app-sidebar-group">
                    <h2 className="app-sidebar-heading">System Administrator</h2>
                    {renderItems(systemItems)}
                </div>
            </nav>

            <div className="app-sidebar-user">
                <Avatar
                    name={displayName}
                    size={40}
                    image={user?.avatarUrl ? { src: user.avatarUrl } : undefined}
                />
                <div className="app-sidebar-user-details">
                    <span className="app-sidebar-user-name">{displayName}</span>
                    <span className="app-sidebar-user-role">{user?.role ?? "User"}</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;