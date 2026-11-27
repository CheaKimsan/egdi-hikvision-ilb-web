import { formatDateTime } from "../../../../../../lib/helpers/services/fmtDateTime";
import type { Column as TableColumn } from "../../../../../../lib/helpers/shared/table/MainTable";
import type { IVehicle } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onView: (vehicle: IVehicle) => void;
    onEdit: (vehicle: IVehicle) => void;
    onDelete: (key: string) => void;
};

const Dash = () => <span className="cell-dash">—</span>;


export function Columns({ onView, onEdit, onDelete }: Handlers): TableColumn<IVehicle>[] {
    return [
        {
            key: "No",
            title: "No",
            width: 60,
            align: "left",
            render: (_row, index) => index + 1,
        },
        {
            key: "vehicleCode",
            title: "Vehicle code",
            dataIndex: "vehicleCode",
            width: 140
        },
        {
            key: "name",
            title: "Name",
            dataIndex: "name"
        },
        {
            key: "licensePlate",
            title: "License plate",
            dataIndex: "licensePlate"
        },
        {
            key: "vehicleType",
            title: "Type",
            render: (vehicle) => vehicle.vehicleType || Dash(),
        },
        {
            key: "province",
            title: "Province",
            render: (vehicle) => vehicle.province || "—",
        },
        {
            key: "status",
            title: "Status",
            render: (vehicle) => (
                <span className={`status-badge ${vehicle.status.name}`}>
                    {vehicle.status.name}
                </span>
            ),
        },
        {
            key: "createdAt",
            title: "Created At",
            render: (vehicle) => formatDateTime(vehicle?.createdAt),
        },
        {
            key: "createdBy",
            title: "Create By",
            render: (vehicle) => vehicle.createdBy?.name || Dash(),
        },

        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (vehicle) => (
                <ActionCell row={vehicle} onEdit={onEdit} onDelete={onDelete} />
            ),
        },
    ];
}