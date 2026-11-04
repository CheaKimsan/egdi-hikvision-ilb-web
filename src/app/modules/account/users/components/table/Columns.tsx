import type { Column } from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { AuthUser } from "../../../auth/AuthContext";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: AuthUser) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: AuthUser["status"]) => void;
};

export function Columns({ onEdit, onDelete, onToggleStatus }: Handlers): Column<AuthUser>[] {
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
            key: "status",
            title: "Status",
            render: (row) => (
                <span className={`status-badge ${row.status}`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "lastLoginAt",
            title: "Last Login",
            render: (row) => {
                if (!row.lastLoginAt) {
                    return <span className="user-last-login-empty">Never</span>;
                }

                const date = new Date(row.lastLoginAt);
                if (Number.isNaN(date.getTime())) {
                    return <span className="user-last-login-empty">—</span>;
                }

                const ageInHours = Math.max(
                    0,
                    Math.floor((Date.now() - date.getTime()) / (60 * 60 * 1000)),
                );
                const ageInDays = Math.floor(ageInHours / 24);
                const label = ageInHours < 1
                    ? "Less than an hour ago"
                    : ageInHours < 24
                        ? `${ageInHours} ${ageInHours === 1 ? "hour" : "hours"} ago`
                        : `${ageInDays} ${ageInDays === 1 ? "day" : "days"} ago`;

                return (
                    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
                        {label}
                    </time>
                );
            },
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (row) => (
                <ActionCell
                    row={row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ),
        },
    ];
}
