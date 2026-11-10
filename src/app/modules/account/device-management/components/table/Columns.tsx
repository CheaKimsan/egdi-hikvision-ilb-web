import type { Column } from "../../../../../../lib/helpers/shared/table/MainTable";
import type { ManagedDevice } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: ManagedDevice) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleActivation: (id: string, activated: boolean) => void;
};

export function Columns({
    onEdit,
    onDelete,
    onToggleActivation,
}: Handlers): Column<ManagedDevice>[] {
    return [
        { key: "id", title: "Device No.", dataIndex: "id", width: 120 },
        { key: "name", title: "Device name", dataIndex: "name" },
        { key: "type", title: "Type", dataIndex: "type" },
        { key: "model", title: "Model", dataIndex: "model" },
        { key: "serialNo", title: "Serial No.", dataIndex: "serialNo" },
        { key: "Firmware", title: "Firmware", dataIndex: "firmware" },
        // { key: "ip", title: "IP Address", dataIndex: "ip" },
        {
            key: "activation",
            title: "Activation",
            render: (row) => {
                const status = row.activated ? "active" : "inactive";
                return (
                    <span className={`status-badge ${status}`}>
                        {row.activated ? "Activated" : "Not activated"}
                    </span>
                );
            },
        },
        // {
        //     key: "online",
        //     title: "Connection",
        //     render: (row) => (
        //         <span className={`status-badge ${row.online ? "active" : "inactive"}`}>
        //             {row.online ? "Online" : "Offline"}
        //         </span>
        //     ),
        // },
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
                    onToggleActivation={onToggleActivation}
                />
            ),
        },
    ];
}
