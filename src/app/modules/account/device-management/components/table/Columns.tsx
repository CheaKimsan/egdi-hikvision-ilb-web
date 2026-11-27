import { formatDateTime } from "../../../../../../lib/helpers/services/fmtDateTime";
import type { Column } from "../../../../../../lib/helpers/shared/table/MainTable";
import type { IDevice } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (row: IDevice) => void;
    onDelete: (key: string) => void;
    onToggleActivation: (key: string, activated: boolean) => void;
};

const Dash = () => <span className="cell-dash">—</span>;

export function Columns({ onEdit, onDelete, onToggleActivation }: Handlers): Column<IDevice>[] {
    return [
        {
            key: "No",
            title: "No",
            width: 60,
            align: "left",
            render: (_row, index) => index + 1,
        },
        {
            key: "deviceCode",
            title: "Device Code.",
            dataIndex: "deviceCode",
        },
        {
            key: "name",
            title: "Device name",
            dataIndex: "name"
        },
        {
            key: "type",
            title: "Type",
            render: (d) => d.type.toUpperCase()
        },
        {
            key: "model", title:
                "Model",
            dataIndex: "model"
        },
        {
            key: "serialNo",
            title: "Serial No.",
            render: (d) => d.serialNo || <Dash />
        },
        {
            key: "firmware",
            title: "Firmware",
            render: (d) => d.firmware || <Dash />
        },
        {
            key: "activation",
            title: "Activation",
            align: "left",
            render: (d) => (
                <span className={`status-badge ${d.activated ? "Active" : "Inactive"}`}>
                    {d.activated ? "Activated" : "Not activated"}
                </span>
            ),
        },
        {
            key: "createdAt",
            title: "Created At",
            render: (d) => formatDateTime(d.createdAt)
        },
        {
            key: "createdBy",
            title: "Create By",
            render: (d) => d.createdBy?.name || <Dash />
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (d) => (
                <ActionCell row={d} onEdit={onEdit} onDelete={onDelete} onToggleActivation={onToggleActivation} />
            ),
        },
    ];
}