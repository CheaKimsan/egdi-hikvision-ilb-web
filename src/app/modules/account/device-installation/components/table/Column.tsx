import { formatDateTime, formatRelativeTime } from "../../../../../../lib/helpers/services/fmtDateTime";
import type { Column as TableColumn } from "../../../../../../lib/helpers/shared/table/MainTable";
import type { IDevice } from "../../../device-management/core/model";
import type { IVehicle } from "../../../vehicle/core/model";
import type { IInstallation } from "../../core/model";
import ActionCell from "./ActionCell";

type Handlers = {
    devicesByKey: Map<string, IDevice>;
    vehiclesByKey: Map<string, IVehicle>;
    onEdit: (installation: IInstallation) => void;
    onDelete: (key: string) => void;
};

const Dash = () => <span className="cell-dash">—</span>;

export function Columns({
    devicesByKey, vehiclesByKey, onEdit, onDelete,
}: Handlers): TableColumn<IInstallation>[] {
    return [
        {
            key: "device",
            title: "Device",
            render: (i) => {
                const d = devicesByKey.get(i.deviceKey);
                return d ? `${d.name}` : "Deleted device";
            },
        },
        {
            key: "vehicle",
            title: "Vehicle",
            render: (i) => {
                const v = vehiclesByKey.get(i.vehicleKey);
                return v ? `${v.name}` : "Deleted vehicle";
            },
        },
        { key: "label", title: "Label", dataIndex: "label" },
        { key: "position", title: "Position", dataIndex: "position" },
        {
            key: "parent",
            title: "Parent MVR",
            render: (i) =>
                i.parentDeviceKey
                    ? devicesByKey.get(i.parentDeviceKey)?.name ?? "Deleted device"
                    : <Dash />,
        },
        { key: "ip", title: "IP address", render: (i) => i.ip || <Dash /> },
        {
            key: "connection",
            title: "Connection",
            render: (i) => {
                const label = i.removedAt ? "Removed" : i.online ? "Online" : "Offline";
                const cls = !i.removedAt && i.online ? "Active" : "Inactive";
                return <span className={`status-badge ${cls}`}>{label}</span>;
            },
        },
        {
            key: "lastSeen", title:
                "Last seen",
            render: (i) => formatRelativeTime(i.lastSeen)
        },
        {
            key: "installedAt",
            title: "Installed",
            render: (i) => formatDateTime(i.installedAt)
        },
        {
            key: "createdBy",
            title: "Installed by",
            render: (i) => i.createdBy?.name || <Dash />
        },
        {
            key: "actions",
            title: "Actions",
            align: "right",
            width: 100,
            render: (i) => <ActionCell row={i} onEdit={onEdit} onDelete={onDelete} />,
        },
    ];
}