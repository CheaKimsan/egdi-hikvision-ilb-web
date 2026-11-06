import { useCallback, useMemo, useState } from "react";
import { AddRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import SearchField from "../../../../../_egdi_ilb/helpers/shared/search/SearchField";
import { dummyDevices } from "../../../../../_egdi_ilb/data/dummy";
import type { Installation } from "../core/model";
import { useInstallationStore } from "../core/store";
import { useVehicleStore } from "../../vehicle/core/store";
import CreateDeviceInstallation from "./form/CreateDeviceInstallation";
import { Columns } from "./table/Column";

const DeviceInstallationPage: React.FC = () => {
    const installations = useInstallationStore((state) => state.rows);
    const addInstallation = useInstallationStore((state) => state.addInstallation);
    const updateInstallation = useInstallationStore((state) => state.updateInstallation);
    const deleteInstallation = useInstallationStore((state) => state.deleteInstallation);
    const vehicles = useVehicleStore((state) => state.rows);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingInstallation, setEditingInstallation] =
        useState<Installation | null>(null);

    const filteredInstallations = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return installations;

        return installations.filter((installation) => {
            const deviceName = dummyDevices.find(
                (device) => device.id === installation.deviceId,
            )?.name ?? "";
            const vehicleName = vehicles.find(
                (vehicle) => vehicle.vehicleCode === installation.vehicleCode,
            )?.name ?? "";
            return [
                installation.id,
                installation.deviceId,
                deviceName,
                installation.vehicleCode,
                vehicleName,
                installation.label,
                installation.position,
                installation.parentId ?? "",
                installation.ip ?? "",
                installation.username ?? "",
                installation.installedBy,
                installation.online ? "online" : "offline",
                installation.notes ?? "",
            ].some((value) => value.toLowerCase().includes(query));
        });
    }, [installations, search, vehicles]);

    const openCreate = useCallback(() => {
        setEditingInstallation(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((installation: Installation) => {
        setEditingInstallation(installation);
        setFormOpen(true);
    }, []);

    const saveInstallation = useCallback((installation: Installation) => {
        if (editingInstallation) updateInstallation(installation);
        else addInstallation(installation);
    }, [addInstallation, editingInstallation, updateInstallation]);

    const columns = useMemo(
        () =>
            Columns({
                devices: dummyDevices,
                vehicles,
                onEdit: openEdit,
                onDelete: deleteInstallation,
            }),
        [deleteInstallation, openEdit, vehicles],
    );

    return (
        <section
            className="device-installation-page"
            aria-labelledby="device-installation-title"
        >
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
                    rows={filteredInstallations}
                    columns={columns}
                    rowKey={(installation) => installation.id}
                    emptyText="No installations found"
                    pagination
                />
            </div>
            <CreateDeviceInstallation
                open={formOpen}
                installation={editingInstallation}
                installations={installations}
                devices={dummyDevices}
                vehicles={vehicles}
                onClose={() => setFormOpen(false)}
                onSave={saveInstallation}
            />
        </section>
    );
};

export default DeviceInstallationPage;