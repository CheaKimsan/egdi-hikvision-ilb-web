import { useMemo, useState } from "react";
import { ServerPlus } from "lucide-react";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import type { DeviceType, IDevice } from "../core/model";
import { useDevicesQuery } from "../core/query";
import {
    useCreateDeviceMutation,
    useDeleteDeviceMutation,
    useToggleDeviceActivationMutation,
    useUpdateDeviceMutation,
} from "../core/action";
import { useDeviceStore } from "../core/store";
import { Columns } from "./table/Columns";
import CreateDevicePage from "./form/CreateDevicePage";
import StatusFilter, {
    ALL_STATUS,
} from "../../../../../lib/helpers/shared/filter/status/StatusFilter";
import { activationFilterOptions } from "../../../../../lib/constants/Status";

const DEVICE_TYPES: DeviceType[] = ["mvr", "camera", "lightbar"];

const typeFilterOptions = DEVICE_TYPES.map((type, index) => ({
    key: index,
    name: type.toUpperCase(),
}));



const DeviceManagementPage: React.FC = () => {
    const { data: devices = [], isLoading } = useDevicesQuery(); // call once, it opens a listener
    const createMutation = useCreateDeviceMutation();
    const updateMutation = useUpdateDeviceMutation();
    const { mutate: removeDevice } = useDeleteDeviceMutation();
    const { mutate: toggleActivation } = useToggleDeviceActivationMutation();

    const search = useDeviceStore((s) => s.search);
    const setSearch = useDeviceStore((s) => s.setSearch);
    const drawer = useDeviceStore((s) => s.drawer);
    const openCreate = useDeviceStore((s) => s.openCreate);
    const openEdit = useDeviceStore((s) => s.openEdit);
    const closeDrawer = useDeviceStore((s) => s.closeDrawer);

    const [typeFilter, setTypeFilter] = useState<string>(ALL_STATUS);
    const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);

    const filteredDevices = useMemo(() => {
        const q = search.trim().toLowerCase();
        const selectedType =
            typeFilter === ALL_STATUS ? null : DEVICE_TYPES[Number(typeFilter)];

        return devices.filter((d) => {
            if (selectedType && d.type !== selectedType) return false;

            if (
                statusFilter !== ALL_STATUS &&
                String(d.activated ? 1 : 0) !== statusFilter
            ) {
                return false;
            }

            if (!q) return true;

            return [
                d.deviceCode,
                d.name,
                d.type,
                d.model,
                d.serialNo,
                d.firmware,
                d.activated ? "activated" : "not activated",
            ].some((v) => (v ?? "").toLowerCase().includes(q));
        });
    }, [search, typeFilter, statusFilter, devices]);

    const saveDevice = async (device: IDevice) => {
        if (drawer.mode === "edit") {
            await updateMutation.mutateAsync(device);
        } else {
            const {
                key: _k,
                createdAt: _c,
                updatedAt: _u,
                createdBy: _cb,
                updatedBy: _ub,
                ...data
            } = device;
            await createMutation.mutateAsync(data);
        }
    };

    const columns = useMemo(
        () =>
            Columns({
                onEdit: openEdit,
                onDelete: removeDevice,
                onToggleActivation: (key, activated) =>
                    toggleActivation({ key, activated }),
            }),
        [openEdit, removeDevice, toggleActivation],
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
                    icon={<ServerPlus size={18} />}
                    className="device-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search devices..."
                />
                <StatusFilter
                    value={typeFilter}
                    onChange={setTypeFilter}
                    statuses={typeFilterOptions}
                    allLabel="All Types"
                />
                <StatusFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                    statuses={activationFilterOptions}
                    allLabel="All Status"
                />
            </div>

            <div className="device-management-table">
                <MainTable
                    rows={filteredDevices}
                    columns={columns}
                    rowKey={(d) => d.key}
                    emptyText="No devices found"
                    pagination
                    loading={isLoading}
                />
            </div>

            <CreateDevicePage
                open={drawer.open}
                mode={drawer.mode}
                device={drawer.device}
                devices={devices}
                onClose={closeDrawer}
                onSave={saveDevice}
            />
        </section>
    );
};

export default DeviceManagementPage;