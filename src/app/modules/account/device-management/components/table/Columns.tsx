import type { Column } from "../../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { ManagedDevice } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: ManagedDevice) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: ManagedDevice["status"]) => void;
};

export function Columns({
    onEdit,
    onDelete,
    onToggleStatus,
}: Handlers): Column<ManagedDevice>[] {
    return [
        { key: "deviceNumber", title: "Device No.", dataIndex: "deviceNumber", width: 120 },
        { key: "name", title: "Device name", dataIndex: "name" },
        { key: "model", title: "Model", dataIndex: "model" },
        { key: "serialNumber", title: "Serial No.", dataIndex: "serialNumber" },
        { key: "IP", title: "IP Address", dataIndex: "ipAddress" },
        {
            key: "status",
            title: "Status",
            render: (row) => (
                <span className={`status-badge ${row.status}`}>{row.status}</span>
            ),
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
