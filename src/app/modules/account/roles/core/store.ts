import { create } from "zustand";
import type {
    PermissionAction,
    PermissionModule,
    Role,
    RolePermission,
} from "./model";
import { permissionActions, permissionModules } from "./model";

type RoleInput = Omit<Role, "id">;

type RolesState = {
    rows: Role[];
    addRole: (role: Role) => void;
    updateRole: (role: Role) => void;
    deleteRole: (id: string) => void;
};

const makePermissions = (
    modules: PermissionModule[],
    actions: PermissionAction[],
): RolePermission[] =>
    modules.flatMap((module) =>
        actions.map((action) => `${module}:${action}` as RolePermission),
    );

const allModules = permissionModules.map(({ id }) => id);
const allActions = permissionActions.map(({ id }) => id);
const readOnlyActions: PermissionAction[] = ["view"];
const editActions: PermissionAction[] = ["view", "create", "edit"];

const initialRoles: Role[] = [
    {
        id: "role-administrator",
        name: "Administrator",
        description: "Full access to every module and management action.",
        permissions: makePermissions(allModules, allActions),
    },
    {
        id: "role-operator",
        name: "Operator",
        description: "Operate cameras, devices, and border-control workflows.",
        permissions: makePermissions(
            [
                "dashboard",
                "camera-management",
                "plate-numbers",
                "border-control",
                "device-management",
                "channel-settings",
            ],
            editActions,
        ),
    },
    {
        id: "role-border-officer",
        name: "Border Officer",
        description: "Review and update border-control and plate-number records.",
        permissions: makePermissions(
            ["dashboard", "plate-numbers", "border-control"],
            editActions,
        ),
    },
    {
        id: "role-visa-officer",
        name: "Visa Officer",
        description: "View and create records for border-control workflows.",
        permissions: makePermissions(
            ["dashboard", "plate-numbers", "border-control"],
            ["view", "create"],
        ),
    },
    {
        id: "role-viewer",
        name: "Viewer",
        description: "Read-only access to operational modules.",
        permissions: makePermissions(
            [
                "dashboard",
                "camera-management",
                "plate-numbers",
                "border-control",
                "device-management",
                "network-settings",
                "channel-settings",
            ],
            readOnlyActions,
        ),
    },
];

const useRolesStore = create<RolesState>((set) => ({
    rows: initialRoles,
    addRole: (role) => set((state) => ({ rows: [...state.rows, role] })),
    updateRole: (updatedRole) =>
        set((state) => ({
            rows: state.rows.map((role) =>
                role.id === updatedRole.id ? updatedRole : role,
            ),
        })),
    deleteRole: (id) =>
        set((state) => ({ rows: state.rows.filter((role) => role.id !== id) })),
}));

export type { RoleInput };
export { useRolesStore };