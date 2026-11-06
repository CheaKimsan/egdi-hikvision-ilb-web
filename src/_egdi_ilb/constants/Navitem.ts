import {
    Camera,
    CarTaxiFront,
    FileImage,
    LayoutDashboard,
    ListVideo,
    MonitorPc,
    Server,
    Settings,
    Tv,
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
    { label: "Vehicle", icon: CarTaxiFront, path: "/management/vehicle" },
    { label: "Device", icon: Server, path: "/management/device" },
    { label: "Device Installation", icon: MonitorPc, path: "/management/device-installation" },
    // { label: "Channel", icon: Tv, path: "/management/channel" },
];

export const FileManagementItems: NavigationItem[] = [
    { label: "Video & Audio", icon: ListVideo, path: "/management/media" },
    { label: "Image", icon: FileImage, path: "/management/images" },
];


export const systemItems: NavigationItem[] = [
    { label: "User", icon: Users, path: "/management/user" },
    { label: "Role", icon: UserShield, path: "/management/role" },
    { label: "Settings", icon: Settings, path: "/management/settings" },
];
