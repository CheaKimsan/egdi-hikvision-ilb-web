import type { Column } from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { AuthUser } from "../../../auth/AuthContext";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: AuthUser) => void;
    onDelete: (id: string) => Promise<void> | void;
};

export function Columns({ onEdit, onDelete }: Handlers): Column<AuthUser>[] {
    return [
        {
            key: "id",
            title: "ID",
            dataIndex: "id",
            width: 100
        },
        {
            key: "name",
            title: "Name",
            dataIndex: "displayName"
        },
        {
            key: "username",
            title: "Username",
            dataIndex: "username"
        },
        {
            key: "email",
            title: "Email",
            dataIndex: "email"
        },
        {
            key: "role",
            title: "Role",
            render: (row) => (
                <span
                    className={`role-badge ${row.role === "admin" ? "admin" : "user"}`}
                >
                    {row.role}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (row) => (
                <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
            ),
        },
    ];
}
