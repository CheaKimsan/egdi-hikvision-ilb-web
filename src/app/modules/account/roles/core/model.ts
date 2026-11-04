export const permissionModules = [
    { id: "dashboard", label: "Dashboard" },
    { id: "camera-management", label: "Camera Management" },
    { id: "plate-numbers", label: "Plate Numbers" },
    { id: "border-control", label: "Border Control" },
    { id: "device-management", label: "Device Management" },
    { id: "network-settings", label: "Network Settings" },
    { id: "channel-settings", label: "Channel Settings" },
    { id: "user-management", label: "User Management" },
    { id: "role-management", label: "Role Management" },
    { id: "settings", label: "Settings" },
] as const;

export const permissionActions = [
    { id: "view", label: "View" },
    { id: "create", label: "Create" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
] as const;

export type PermissionModule = (typeof permissionModules)[number]["id"];
export type PermissionAction = (typeof permissionActions)[number]["id"];
export type RolePermission = `${PermissionModule}:${PermissionAction}`;

export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: RolePermission[];
};