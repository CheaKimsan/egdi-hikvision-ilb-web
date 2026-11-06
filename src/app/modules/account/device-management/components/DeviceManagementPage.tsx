import { useCallback, useMemo, useState } from "react";
import { AddRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { ManagedDevice } from "../core/model";
import { Columns } from "./table/Columns";
import { dummyDevices } from "../../../../../_egdi_ilb/data/dummy";
import SearchField from "../../../../../_egdi_ilb/helpers/shared/search/SearchField";
import CreateDevicePage from "./form/CreateDevicePage";

const DeviceManagementPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [devices, setDevices] = useState<ManagedDevice[]>(() => [...dummyDevices]);
    const [deviceFormOpen, setDeviceFormOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<ManagedDevice | null>(null);

    const handleEdit = useCallback((row: ManagedDevice) => {
        setEditingDevice(row);
        setDeviceFormOpen(true);
    }, []);

    const handleCreate = useCallback(() => {
        setEditingDevice(null);
        setDeviceFormOpen(true);
    }, []);

    const handleSave = useCallback((device: ManagedDevice) => {
        setDevices((current) => {
            const exists = current.some((item) => item.id === device.id);
            return exists
                ? current.map((item) => (item.id === device.id ? device : item))
                : [...current, device];
        });
    }, []);

    const handleDelete = useCallback((id: string) => {
        setDevices((current) => current.filter((device) => device.id !== id));
    }, []);

    const handleToggleActivation = useCallback(
        (id: string, activated: boolean) => {
            setDevices((current) =>
                current.map((device) =>
                    device.id === id
                        ? { ...device, activated }
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
                onToggleActivation: handleToggleActivation,
            }),
        [handleEdit, handleDelete, handleToggleActivation],
    );

    const filteredDevices = devices.filter((device) =>
        [
            device.id,
            device.name,
            device.type,
            device.model,
            device.serialNo ?? "",
            device.siteId,
            device.siteName,
            device.firmware ?? "",
            device.ip ?? "",
            String(device.httpPort),
            String(device.sdkPort),
            device.username,
            device.activated ? "activated" : "not activated",
            device.online ? "online" : "offline",
        ].some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
    );

    return (
        <section className="device-management-page" aria-labelledby="device-management-title">
            <header className="device-management-header">
                <div>
                    <h1 id="device-management-title">Device Management</h1>
                    <p>Manage device identity, site assignment, and connection settings.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Add device"
                    icon={<AddRegular />}
                    className="device-management-create-button"
                    size="medium"
                    onClick={handleCreate}
                />
            </header>

            <div className="search-toolbar">
                <SearchField value={search} onChange={setSearch} placeholder="Search devices..." />
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
            <CreateDevicePage
                open={deviceFormOpen}
                device={editingDevice}
                devices={devices}
                onClose={() => setDeviceFormOpen(false)}
                onSave={handleSave}
            />
        </section>
    );
};

export default DeviceManagementPage;
