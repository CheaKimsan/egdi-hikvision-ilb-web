import type { Column } from "../../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { NetworkConfiguration } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (configuration: NetworkConfiguration) => void;
    onDelete: (id: string) => void;
};

export function Columns({ onEdit, onDelete }: Handlers): Column<NetworkConfiguration>[] {
    return [
        {
            key: "ipAddress",
            title: "IP address",
            dataIndex: "ipAddress",
        },
        {
            key: "httpPort",
            title: "HTTP port",
            dataIndex: "httpPort",
            width: 120,
        },
        {
            key: "username",
            title: "Username",
            dataIndex: "username",
        },
        {
            key: "password",
            title: "Password",
            render: (row) => (
                <span className="network-secret-status">
                    {row.password ? "Configured" : "Not set"}
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
