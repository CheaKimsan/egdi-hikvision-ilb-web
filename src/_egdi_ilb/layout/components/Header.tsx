import React, { useState } from "react";
import {
    Avatar,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    Tooltip,
} from "@fluentui/react-components";
import {
    LayoutGrid,
    MessageCircle,
    Bell,
    User,
    Camera,
    ShieldCheck,
    Sun,
    Moon,
    Leaf,
    LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/GDI.png";
import NoAvatar from "../../assets/images/no_avatar.jpeg";
import { AppConfig } from "../../../config/ilb.config";
import { useAuth } from "../../../app/modules/auth/AuthContext";

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const displayName = user?.displayName ?? user?.username ?? "User";

    // Local state for the toggles in the menu
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState<"en" | "km">("en");

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const userEmail = user?.email;

    const userAvatarUrl = user?.avatarUrl;

    return (
        <header className="app-header" role="banner">
            <div className="app-header-inner">
                {/* Brand */}
                <div className="app-header-brand" aria-label="General Department of Immigration">
                    <img
                        src={Logo}
                        alt="General Department of Immigration logo"
                        className="app-header-logo"
                    />
                    <div className="app-header-brand-text">
                        <span className="app-header-brand-kh" lang="km">{AppConfig.orgKm}</span>
                        <span className="app-header-brand-en">{AppConfig.orgEn}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="app-header-actions">
                    <Tooltip content="Apps" relationship="label">
                        <button type="button" className="app-header-icon-button" aria-label="Apps">
                            <LayoutGrid strokeWidth={2} />
                        </button>
                    </Tooltip>

                    <Tooltip content="Messages" relationship="label">
                        <button type="button" className="app-header-icon-button" aria-label="Messages">
                            <MessageCircle strokeWidth={2} />
                        </button>
                    </Tooltip>

                    <Tooltip content="Notifications" relationship="label">
                        <button type="button" className="app-header-icon-button" aria-label="Notifications">
                            <Bell strokeWidth={2} />
                            <span className="app-header-notification-dot"></span>
                        </button>
                    </Tooltip>

                    {/* User Profile Popover */}
                    <Popover positioning="below-end" trapFocus>
                        <PopoverTrigger disableButtonEnhancement>
                            <button
                                type="button"
                                className="app-header-profile"
                                aria-label={`User menu for ${displayName}`}
                                title={`User menu for ${displayName}`}
                            >
                                {user ? (
                                    <Avatar
                                        name={displayName}
                                        color="colorful"
                                        size={32}
                                        image={userAvatarUrl ? { src: userAvatarUrl } : { src: NoAvatar }}
                                    />
                                ) : (
                                    <User strokeWidth={2} />
                                )}
                            </button>
                        </PopoverTrigger>

                        <PopoverSurface className="profile-menu-surface">
                            {/* Header Info */}
                            <div className="profile-menu-header">
                                <span className="profile-menu-email">{userEmail}</span>

                                <div className="profile-menu-avatar-wrapper">
                                    <Avatar
                                        name={user?.displayName || user?.username || "User"}
                                        color="colorful"
                                        size={72}
                                        image={{ src: userAvatarUrl || NoAvatar }}
                                    />
                                    <button className="profile-menu-camera-btn" aria-label="Change avatar" title="Change avatar">
                                        <Camera size={14} />
                                    </button>
                                </div>

                                <h2 className="profile-menu-greeting">
                                    Hi {displayName}! <ShieldCheck size={18} className="verified-icon" />
                                </h2>
                                {user?.role && <span className="profile-menu-role">{user.role}</span>}

                                <button className="profile-menu-action-btn">
                                    <ShieldCheck size={16} />
                                    Change Password
                                </button>
                            </div>

                            {/* Language Selector */}
                            <div className="profile-menu-lang-toggle">
                                <button
                                    className={language === "en" ? "active" : ""}
                                    onClick={() => setLanguage("en")}
                                >
                                    English
                                </button>
                                <button
                                    className={language === "km" ? "active" : ""}
                                    onClick={() => setLanguage("km")}
                                >
                                    ខ្មែរ
                                </button>
                            </div>

                            <hr className="profile-menu-divider" />

                            {/* Theme Toggle */}
                            <div className="profile-menu-row">
                                <div className="profile-menu-label">
                                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                                    <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                                </div>
                                <label className="custom-switch">
                                    <input
                                        type="checkbox"
                                        checked={isDarkMode}
                                        onChange={() => setIsDarkMode(!isDarkMode)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <hr className="profile-menu-divider" />

                            {/* Footer Actions */}
                            <div className="profile-menu-footer">
                                <button className="footer-btn account-btn">
                                    <Leaf size={16} className="text-green" />
                                    Account
                                </button>
                                <div className="footer-divider"></div>
                                <button className="footer-btn signout-btn" onClick={handleLogout}>
                                    <LogOut size={16} className="text-red" />
                                    Sign out
                                </button>
                            </div>

                            {/* Version */}
                            <div className="profile-menu-version">
                                Version 1.0.0
                            </div>
                        </PopoverSurface>
                    </Popover>
                </div>
            </div>
        </header>
    );
};

export default Header;