import type { Column } from "../../../../../lib/helpers/shared/table/MainTable";
import type { FireUser } from "../../../users/core/model";
import type { Role } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    users: FireUser[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
};

export function Columns({ users, onEdit, onDelete }: Handlers): Column<Role>[] {
    return [
        { key: "name", title: "Role name", dataIndex: "name" },
        { key: "description", title: "Description", dataIndex: "description" },
        {
            key: "permissions",
            title: "Permissions",
            render: (role) => {
                const moduleCount = new Set(
                    role.permissions.map((permission) => permission.split(":")[0]),
                ).size;
                return (
                    <span className="role-permission-count">
                        {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                    </span>
                );
            },
        },
        {
            key: "users",
            title: "Assigned users",
            render: (role) => users.filter((user) => user.role === role.name).length,
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 110,
            render: (role) => (
                <ActionCell
                    row={role}
                    assignedUserCount={users.filter((user) => user.role === role.name).length}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ];
}
