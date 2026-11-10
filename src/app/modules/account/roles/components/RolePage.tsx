import { useMemo, useState } from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    Textarea,
} from "@fluentui/react-components";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import { useUsersStore } from "../../users/core/store";
import type {
    PermissionAction,
    Role,
    RolePermission,
} from "../core/model";
import { permissionActions, permissionModules } from "../core/model";
import { useRolesStore } from "../core/store";
import { Columns } from "./table/Columns";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import { UserShieldIcon } from "lucide-react";

type RoleDraft = {
    name: string;
    description: string;
    permissions: RolePermission[];
};

const emptyDraft: RoleDraft = { name: "", description: "", permissions: [] };

const RolePage: React.FC = () => {
    const roles = useRolesStore((state) => state.rows);
    const addRole = useRolesStore((state) => state.addRole);
    const updateRole = useRolesStore((state) => state.updateRole);
    const deleteRole = useRolesStore((state) => state.deleteRole);
    const users = useUsersStore((state) => state.rows);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [draft, setDraft] = useState<RoleDraft>(emptyDraft);
    const [formError, setFormError] = useState("");

    const filteredRoles = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return roles;
        return roles.filter((role) =>
            [role.name, role.description].some((value) =>
                value.toLowerCase().includes(query),
            ),
        );
    }, [roles, search]);

    const openCreate = () => {
        setEditingRole(null);
        setDraft(emptyDraft);
        setFormError("");
        setFormOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setDraft({
            name: role.name,
            description: role.description,
            permissions: [...role.permissions],
        });
        setFormError("");
        setFormOpen(true);
    };

    const togglePermission = (moduleId: string, action: PermissionAction) => {
        const permission = `${moduleId}:${action}` as RolePermission;
        setDraft((current) => ({
            ...current,
            permissions: current.permissions.includes(permission)
                ? current.permissions.filter((item) => item !== permission)
                : [...current.permissions, permission],
        }));
    };

    const saveRole = () => {
        const name = draft.name.trim();
        if (!name) {
            setFormError("Enter a role name.");
            return;
        }
        if (
            roles.some(
                (role) =>
                    role.id !== editingRole?.id &&
                    role.name.toLowerCase() === name.toLowerCase(),
            )
        ) {
            setFormError("A role with this name already exists.");
            return;
        }

        if (editingRole) {
            const updatedRole = { ...editingRole, ...draft, name };
            updateRole(updatedRole);
            if (editingRole.name !== name) {
                useUsersStore.getState().rows
                    .filter((user) => user.role === editingRole.name)
                    .forEach((user) =>
                        useUsersStore.getState().updateUser({
                            ...user,
                            role: name,
                            updatedAt: new Date().toISOString(),
                        }),
                    );
            }
        } else {
            addRole({
                ...draft,
                name,
                id: `role-${Date.now()}`,
            });
        }
        setFormOpen(false);
    };

    const columns = Columns({
        users,
        onEdit: openEdit,
        onDelete: deleteRole,
    });

    return (
        <section className="user-management-page role-management-page" aria-labelledby="role-management-title">
            <header className="user-management-header">
                <div>
                    <h1 id="role-management-title">Role Management</h1>
                    <p>Create roles and control access to each module.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Create role"
                    icon={<UserShieldIcon size={18} />}
                    className="user-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar ">
                <SearchField value={search} onChange={setSearch} placeholder="Search roles..." />
            </div>

            <div className="user-management-table">
                <MainTable
                    rows={filteredRoles}
                    columns={columns}
                    rowKey={(role) => role.id}
                    emptyText="No roles found"
                    pagination
                />
            </div>

            <Dialog open={formOpen} onOpenChange={(_, data) => setFormOpen(data.open)}>
                <DialogSurface className="role-form-dialog">
                    <DialogBody>
                        <DialogTitle>{editingRole ? "Edit role" : "Create role"}</DialogTitle>
                        <DialogContent>
                            <div className="role-form-fields">
                                <Field label="Role name" required>
                                    <Input
                                        autoFocus
                                        value={draft.name}
                                        maxLength={60}
                                        onChange={(_, data) => {
                                            setDraft((current) => ({ ...current, name: data.value }));
                                            setFormError("");
                                        }}
                                        placeholder="e.g. Camera Operator"
                                    />
                                </Field>
                                <Field label="Description">
                                    <Textarea
                                        value={draft.description}
                                        maxLength={200}
                                        onChange={(_, data) =>
                                            setDraft((current) => ({
                                                ...current,
                                                description: data.value,
                                            }))
                                        }
                                        placeholder="Describe what this role can do"
                                        resize="vertical"
                                    />
                                </Field>
                                <div className="role-permissions">
                                    <div className="role-permissions-heading">
                                        <div>
                                            <h3>Module permissions</h3>
                                            <p>Select the actions this role can perform.</p>
                                        </div>
                                        {permissionActions.map(({ id, label }) => (
                                            <span key={id}>{label}</span>
                                        ))}
                                    </div>
                                    {permissionModules.map(({ id, label }) => (
                                        <div className="role-permission-row" key={id}>
                                            <span>{label}</span>
                                            {permissionActions.map(({ id: action, label: actionLabel }) => (
                                                <Checkbox
                                                    key={action}
                                                    aria-label={`${actionLabel} ${label}`}
                                                    checked={draft.permissions.includes(
                                                        `${id}:${action}` as RolePermission,
                                                    )}
                                                    onChange={() =>
                                                        togglePermission(id, action)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {formError && <p className="role-form-error" role="alert">{formError}</p>}
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button appearance="primary" onClick={saveRole}>
                                {editingRole ? "Save changes" : "Create role"}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

        </section>
    );
};

export default RolePage;