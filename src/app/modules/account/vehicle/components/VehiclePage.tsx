import { useCallback, useMemo, useState } from "react";
import { AddCircleRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import type { Vehicle } from "../core/model";
import { useVehicleStore } from "../core/store";
import CreateVehiclePage from "./form/CreateVehiclePage";
import { Columns } from "./table/Column";

const VehiclePage: React.FC = () => {
    const vehicles = useVehicleStore((state) => state.rows);
    const addVehicle = useVehicleStore((state) => state.addVehicle);
    const updateVehicle = useVehicleStore((state) => state.updateVehicle);
    const deleteVehicle = useVehicleStore((state) => state.deleteVehicle);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const filteredVehicles = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return vehicles;

        return vehicles.filter((vehicle) =>
            [
                vehicle.id,
                vehicle.vehicleCode,
                vehicle.name,
                vehicle.licensePlate,
                vehicle.vehicleType ?? "",
                vehicle.province ?? "",
                vehicle.status,
            ].some((value) => value.toLowerCase().includes(query)),
        );
    }, [search, vehicles]);

    const openCreate = () => {
        setEditingVehicle(null);
        setFormOpen(true);
    };

    const openEdit = useCallback((vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormOpen(true);
    }, []);

    const saveVehicle = (vehicle: Vehicle) => {
        if (editingVehicle) updateVehicle(vehicle);
        else addVehicle(vehicle);
    };

    const columns = useMemo(
        () =>
            Columns({
                onEdit: openEdit,
                onDelete: deleteVehicle,
            }),
        [deleteVehicle, openEdit],
    );

    return (
        <section className="vehicle-management-page" aria-labelledby="vehicle-management-title">
            <header className="vehicle-management-header">
                <div>
                    <h1 id="vehicle-management-title">Vehicle Management</h1>
                    <p>Manage vehicle details, registration, and operational status.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Add vehicle"
                    icon={<AddCircleRegular fontSize={18} fontWeight={14} />}
                    className="vehicle-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search vehicles..."
                    ariaLabel="Search vehicles"
                />
            </div>

            <div className="vehicle-management-table">
                <MainTable
                    rows={filteredVehicles}
                    columns={columns}
                    rowKey={(vehicle) => vehicle.id}
                    emptyText="No vehicles found"
                    pagination
                />
            </div>
            <CreateVehiclePage
                open={formOpen}
                vehicle={editingVehicle}
                vehicles={vehicles}
                onClose={() => setFormOpen(false)}
                onSave={saveVehicle}
            />
        </section>
    );
};

export default VehiclePage;