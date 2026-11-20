import { ShieldCheck, UserRound } from "lucide-react";
import { formatDateTime, formatRelativeTime } from "../../../../../../lib/helpers/services/formation/fmtDateTime";
import { Column } from "../../../../../../lib/helpers/shared/table/MainTable";
import { IUser } from "../../core/model";
import ActionCell from "./ActionCell";
import UserCell from "../../../../../../lib/helpers/shared/avatar/UserCell";

type Handlers = {
    onEdit: (row: IUser) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: IUser["status"]) => void;
};

export function Columns({
    onEdit,
    onDelete,
    onToggleStatus,
}: Handlers): Column<IUser>[] {
    return [
        {
            key: "No",
            title: "No",
            align: "center",
            width: 60, // Slightly smaller width for just numbers
            render: (_row, index) => index + 1,
        },
        {
            key: "name",
            title: "User",
            align: "center",
            render: (row) => (
                <UserCell name={row.displayName} avatar={row.avatar} role={row.role} />
            ),
        },
        {
            key: "email",
            title: "Email",
            align: "left",
            dataIndex: "email",
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