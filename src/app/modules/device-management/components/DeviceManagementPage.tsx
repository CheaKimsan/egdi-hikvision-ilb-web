import { useCallback, useMemo, useState } from "react";
import { Input } from "@fluentui/react-components";
import { AddRegular, SearchRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import MainTable from "../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { ManagedDevice } from "../core/model";
import { dummyDevices } from "../data/devices";
import { Columns } from "./table/Columns";

const DeviceManagementPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [devices, setDevices] = useState<ManagedDevice[]>(() => [...dummyDevices]);

    const handleEdit = useCallback((row: ManagedDevice) => {
        console.log("edit device", row);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setDevices((current) => current.filter((device) => device.id !== id));
    }, []);

    const handleToggleStatus = useCallback(
        (id: string, status: ManagedDevice["status"]) => {
            setDevices((current) =>
                current.map((device) =>
                    device.id === id
                        ? { ...device, status, updatedAt: new Date().toISOString() }
                        : device,
                ),
            );
        },
        [],
    );

    const columns = useMemo(
        () =>
            Columns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                onToggleStatus: handleToggleStatus,
            }),
        [handleEdit, handleDelete, handleToggleStatus],
    );

    const filteredDevices = devices.filter((device) =>
        [
            device.id,
            String(device.deviceNumber),
            device.name,
            device.type,
            device.model,
            device.serialNumber,
            device.firmwareVersion,
            device.encodingVersion,
            device.webVersion,
            device.pluginVersion,
            String(device.channelCount),
            String(device.hddCount),
            String(device.alarmInputCount),
            String(device.alarmOutputCount),
            device.ipAddress ?? "",
            device.location ?? "",
            device.status,
        ].some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
    );

    return (
        <section className="device-management-page" aria-labelledby="device-management-title">
            <header className="device-management-header">
                <div>
                    <h1 id="device-management-title">Device Management</h1>
                    <p>View device details, firmware versions, and connected hardware.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Add device"
                    icon={<AddRegular />}
                    className="device-management-create-button"
                    size="medium"
                />
            </header>

            <div className="device-management-toolbar">
                <Input
                    aria-label="Search devices"
                    contentBefore={<SearchRegular />}
                    placeholder="Search devices"
                    value={search}
                    onChange={(_event, data) => setSearch(data.value)}
                />
                <span className="device-management-count">
                    {filteredDevices.length} {filteredDevices.length === 1 ? "device" : "devices"}
                </span>
            </div>

            <div className="device-management-table">
                <MainTable
                    rows={filteredDevices}
                    columns={columns}
                    rowKey={(device) => device.id}
                    emptyText="No devices found"
                    pagination
                />
            </div>
        </section>
    );
};

export default DeviceManagementPage;
