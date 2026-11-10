import type { Column as TableColumn } from "../../../../../../lib/helpers/shared/table/MainTable";
import type { Vehicle } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (id: string) => void;
};

export function Columns({ onEdit, onDelete }: Handlers): TableColumn<Vehicle>[] {
    return [
        { key: "vehicleCode", title: "Vehicle code", dataIndex: "vehicleCode", width: 140 },
        { key: "name", title: "Name", dataIndex: "name" },
        { key: "licensePlate", title: "License plate", dataIndex: "licensePlate" },
        {
            key: "vehicleType",
            title: "Type",
            render: (vehicle) => vehicle.vehicleType || "—",
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
                <span className={`status-badge ${vehicle.status}`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
            ),
        },
        {
            key: "updatedAt",
            title: "Last updated",
            render: (vehicle) => (
                <time dateTime={vehicle.updatedAt}>
                    {new Date(vehicle.updatedAt).toLocaleDateString()}
                </time>
            ),
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