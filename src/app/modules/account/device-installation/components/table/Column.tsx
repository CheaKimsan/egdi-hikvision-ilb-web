import type { Column as TableColumn } from "../../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { ManagedDevice } from "../../../device-management/core/model";
import type { Vehicle } from "../../../vehicle/core/model";
import type { Installation } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    devices: ManagedDevice[];
    vehicles: Vehicle[];
    onEdit: (installation: Installation) => void;
    onDelete: (id: string) => void;
};

export function Columns({
    devices,
    vehicles,
    onEdit,
    onDelete,
}: Handlers): TableColumn<Installation>[] {
    return [
        {
            key: "device",
            title: "Device",
            render: (installation) =>
                devices.find((device) => device.id === installation.deviceId)?.name
                ?? installation.deviceId,
        },
        {
            key: "vehicle",
            title: "Vehicle",
            render: (installation) => {
                const vehicle = vehicles.find(
                    (item) => item.vehicleCode === installation.vehicleCode,
                );
                return vehicle
                    ? `${vehicle.vehicleCode} · ${vehicle.name}`
                    : installation.vehicleCode;
            },
        },
        { key: "label", title: "Label", dataIndex: "label" },
        { key: "position", title: "Position", dataIndex: "position" },
        {
            key: "parent",
            title: "Parent MVR",
            render: (installation) =>
                installation.parentId
                    ? devices.find((device) => device.id === installation.parentId)?.name
                        ?? installation.parentId
                    : "—",
        },
        {
            key: "connection",
            title: "Connection",
            render: (installation) => (
                <span
                    className={`status-badge ${installation.removedAt
                        ? "inactive"
                        : installation.online
                            ? "active"
                            : "inactive"}`}
                >
                    {installation.removedAt
                        ? "Removed"
                        : installation.online
                            ? "Online"
                            : "Offline"}
                </span>
            ),
        },
        {
            key: "installedAt",
            title: "Installed",
            render: (installation) => (
                <time dateTime={installation.installedAt}>
                    {new Date(installation.installedAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (installation) => (
                <ActionCell
                    row={installation}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ];
}