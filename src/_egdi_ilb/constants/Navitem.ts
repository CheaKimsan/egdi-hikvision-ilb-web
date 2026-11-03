import {
    Camera,
    FileText,
    LayoutDashboard,
    Network,
    PanelsTopLeft,
    Server,
    Settings,
    Shield,
    Users,
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
    { label: "Camera Management", icon: Camera, path: "/management/camera-management" },
    { label: "Plate Numbers", icon: FileText, path: "/management/plate-numbers" },
    { label: "Border Control", icon: Shield, path: "/management/border-control" },
];

export const deviceConfigurationItems: NavigationItem[] = [
    { label: "Device Management", icon: Server, path: "/management/device-management", countKey: "devices" },
    { label: "Network Settings", icon: Network, path: "/management/network-settings" },
    { label: "Channel Settings", icon: PanelsTopLeft, path: "/management/channel-settings" },
];

export const systemItems: NavigationItem[] = [
    { label: "User Management", icon: Users, path: "/management/user", countKey: "users" },
    { label: "Role Management", icon: FileText, path: "/management/role" },
    { label: "Settings", icon: Settings, path: "/management/settings" },
];
