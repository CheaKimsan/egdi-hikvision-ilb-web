
import { formatDate, formatDateTime, formatRelativeTime } from "../../../../../../lib/helpers/services/formation/fmtDateTime";
import { Column } from "../../../../../../lib/helpers/shared/table/MainTable";
import { FireUser } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: FireUser) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: FireUser["status"]) => void;
};



export function Columns({
    onEdit,
    onDelete,
    onToggleStatus,
}: Handlers): Column<FireUser>[] {
    return [
        {
            key: "No",
            title: "No",
            width: 100,
            render: (_row, index) => index + 1,
        },
        {
            key: "name",
            title: "Name",
            dataIndex: "displayName",
        },
        {
            key: "role",
            title: "Role",
            render: (row) => (
                <span className={`role-badge ${row.role === "admin" ? "admin" : "user"}`}>
                    {row.role}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (row) => (
                <span className={`status-badge ${row.status?.name}`}>
                    {row.status?.name}
                </span>
            ),
        },

        {
            key: "session",
            title: "Last Login",
            render: (row) => {
                const loginAt = row.session?.loginAt;

                if (!loginAt) {
                    return <span className="user-last-login-empty">Never</span>;
                }

                const date = loginAt.toDate();

                if (Number.isNaN(date.getTime())) {
                    return <span className="user-last-login-empty">—</span>;
                }

                return (
                    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
                        {formatRelativeTime(date)}
                    </time>
                );
            }
        },
        {
            key: "createdAt",
            title: "Created At",
            render: (row) => formatDateTime(row.createdAt),
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
