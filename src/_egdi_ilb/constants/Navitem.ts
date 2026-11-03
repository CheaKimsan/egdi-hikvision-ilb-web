import {
    Camera,
    FileText,
    LayoutDashboard,
    Network,
    PanelsTopLeft,
    Radar,
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
    badge?: string;
}

export const mainItems: NavigationItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/management" },
    { label: "Camera Management", icon: Camera, path: "/management/camera-management" },
    { label: "Visa Records", icon: FileText, path: "/management/visa-records" },
    { label: "Border Control", icon: Shield, path: "/management/border-control" },
];

export const deviceConfigurationItems: NavigationItem[] = [
    { label: "Device Discovery", icon: Radar, path: "/management/device-discovery" },
    { label: "Device Management", icon: Server, path: "/management/device-management" },
    { label: "Network Settings", icon: Network, path: "/management/network-settings" },
    { label: "Channel Settings", icon: PanelsTopLeft, path: "/management/channel-settings" },
];

export const systemItems: NavigationItem[] = [
    { label: "User Management", icon: Users, path: "/management/user" },
    { label: "Settings", icon: Settings, path: "/management/settings" },
];
