import { useMemo } from "react";
import { AddRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import type { IInstallation } from "../core/model";
import { useInstallationsQuery } from "../core/query";
import {
    useCreateInstallationMutation,
    useDeleteInstallationMutation,
    useUpdateInstallationMutation,
} from "../core/action";
import { useInstallationStore } from "../core/store";
import { useDevicesQuery } from "../../device-management/core/query";
import { useVehiclesQuery } from "../../vehicle/core/query";
import CreateDeviceInstallation from "./form/CreateDeviceInstallation";
import { Columns } from "./table/Column";

const DeviceInstallationPage: React.FC = () => {
    const { data: installations = [], isLoading } = useInstallationsQuery(); // opens one listener
    const { data: devices = [] } = useDevicesQuery();
    const { data: vehicles = [] } = useVehiclesQuery();

    const createMutation = useCreateInstallationMutation();
    const updateMutation = useUpdateInstallationMutation();
    const { mutate: removeInstallation } = useDeleteInstallationMutation();

    const search = useInstallationStore((s) => s.search);
    const setSearch = useInstallationStore((s) => s.setSearch);
    const drawer = useInstallationStore((s) => s.drawer);
    const openCreate = useInstallationStore((s) => s.openCreate);
    const openEdit = useInstallationStore((s) => s.openEdit);
    const closeDrawer = useInstallationStore((s) => s.closeDrawer);

    const devicesByKey = useMemo(() => new Map(devices.map((d) => [d.key, d])), [devices]);
    const vehiclesByKey = useMemo(() => new Map(vehicles.map((v) => [v.key, v])), [vehicles]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return installations;

        return installations.filter((i) => {
            const device = devicesByKey.get(i.deviceKey);
            const vehicle = vehiclesByKey.get(i.vehicleKey);
            return [
                device?.deviceCode, device?.name,
                vehicle?.vehicleCode, vehicle?.name,
                i.label, i.position, i.ip, i.username, i.notes,
                i.removedAt ? "removed" : i.online ? "online" : "offline",
            ].some((v) => (v ?? "").toLowerCase().includes(q));
        });
    }, [installations, search, devicesByKey, vehiclesByKey]);

    // The form closes the drawer itself after a successful save
    const saveInstallation = async (installation: IInstallation) => {
        if (drawer.mode === "edit") {
            await updateMutation.mutateAsync(installation);
        } else {
            const {
                key: _k, online: _o, lastSeen: _l,
                createdAt: _c, updatedAt: _u, createdBy: _cb, updatedBy: _ub,
                ...data
            } = installation;
            await createMutation.mutateAsync(data);
        }
    };

    const columns = useMemo(
        () =>
            Columns({
                devicesByKey,
                vehiclesByKey,
                onEdit: openEdit,
                onDelete: removeInstallation,
            }),
        [devicesByKey, vehiclesByKey, openEdit, removeInstallation],
    );

    return (
        <section className="device-installation-page" aria-labelledby="device-installation-title">
            <header className="device-installation-header">
                <div>
                    <h1 id="device-installation-title">Device Installation</h1>
                    <p>Manage device assignments and installation details for each vehicle.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Add installation"
                    icon={<AddRegular />}
                    className="device-installation-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search installations..."
                    ariaLabel="Search installations"
                />
            </div>

            <div className="device-installation-table">
                <MainTable
                    rows={filtered}
                    columns={columns}
                    rowKey={(i) => i.key}
                    emptyText="No installations found"
                    pagination
                    loading={isLoading}
                />
            </div>

            <CreateDeviceInstallation
                open={drawer.open}
                mode={drawer.mode}
                installation={drawer.installation}
                installations={installations}
                devices={devices}
                vehicles={vehicles}
                onClose={closeDrawer}
                onSave={saveInstallation}
            />
        </section>
    );
};

export default DeviceInstallationPage;