import {
    Camera,
    FileText,
    LayoutDashboard,
    Network,
    Server,
    Settings,
    Shield,
    Users,
    UserShield,
    type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
    label: string;
    icon: LucideIcon;
    path: string;
    countKey?: "devices" | "users";
}

export const mainItems: NavigationItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/management" },
];

export const deviceConfigurationItems: NavigationItem[] = [
    { label: "Device Management", icon: Server, path: "/management/device-management" },
    { label: "Camera Management", icon: Camera, path: "/management/camera-management" },
    { label: "File Management", icon: FileText, path: "/management/file-management" },

    // { label: "Network Settings", icon: Network, path: "/management/network-settings" },
    // { label: "Channel Settings", icon: PanelsTopLeft, path: "/management/channel-settings" },
];

export const systemItems: NavigationItem[] = [
    { label: "User Management", icon: Users, path: "/management/user" },
    { label: "Role Management", icon: UserShield, path: "/management/role" },
    { label: "Settings", icon: Settings, path: "/management/settings" },
];
