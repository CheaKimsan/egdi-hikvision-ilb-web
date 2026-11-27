import { useMemo, useState } from "react";
import { AddCircleRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import type { IVehicle } from "../core/model";
import { useVehiclesQuery } from "../core/query";
import {
    useCreateVehicleMutation,
    useDeleteVehicleMutation,
    useUpdateVehicleMutation,
} from "../core/action";
import { useVehicleStore } from "../core/store";
import CreateVehiclePage from "./form/CreateVehiclePage";
import { Columns } from "./table/Column";
import StatusFilter, { ALL_STATUS, matchesStatus } from "../../../../../lib/helpers/shared/filter/status/StatusFilter";
import { vehicleStatusOptions } from "../../../../../lib/constants/Status";

const VehiclePage: React.FC = () => {
    const { data: vehicles = [], isLoading } = useVehiclesQuery(); // call once, it opens a listener
    const createMutation = useCreateVehicleMutation();
    const updateMutation = useUpdateVehicleMutation();
    const { mutate: removeVehicle } = useDeleteVehicleMutation(); // .mutate is stable
    const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);


    const search = useVehicleStore((s) => s.search);
    const setSearch = useVehicleStore((s) => s.setSearch);
    const drawer = useVehicleStore((s) => s.drawer);
    const openCreate = useVehicleStore((s) => s.openCreate);
    const openView = useVehicleStore((s) => s.openView);
    const openEdit = useVehicleStore((s) => s.openEdit);
    const closeDrawer = useVehicleStore((s) => s.closeDrawer);

    const filteredVehicles = useMemo(() => {
        const q = search.trim().toLowerCase();

        return vehicles.filter((vehicle) => {
            if (!matchesStatus(vehicle.status, statusFilter)) return false;
            if (!q) return true;

            return [
                vehicle.vehicleCode,
                vehicle.name,
                vehicle.licensePlate,
                vehicle.vehicleType,
                vehicle.province,
                vehicle.status.name,
            ].some((value) => (value ?? "").toLowerCase().includes(q));
        });
    }, [search, statusFilter, vehicles]);

    const saveVehicle = async (vehicle: IVehicle) => {
        if (drawer.mode === "edit") {
            await updateMutation.mutateAsync(vehicle);
        } else {
            const { key: _key, createdAt: _c, updatedAt: _u, ...data } = vehicle;
            await createMutation.mutateAsync(data);
        }
    };

    const columns = useMemo(
        () =>
            Columns({
                onView: openView,
                onEdit: openEdit,
                onDelete: removeVehicle,
            }),
        [openView, openEdit, removeVehicle],
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
                <StatusFilter value={statusFilter} onChange={setStatusFilter} statuses={vehicleStatusOptions} />
            </div>


            <div className="vehicle-management-table">
                <MainTable
                    rows={filteredVehicles}
                    columns={columns}
                    rowKey={(vehicle) => vehicle.key}
                    emptyText="No vehicles found"
                    pagination
                    loading={isLoading}
                />
            </div>

            <CreateVehiclePage
                open={drawer.open}
                mode={drawer.mode}
                vehicle={drawer.vehicle}
                vehicles={vehicles}
                onClose={closeDrawer}
                onSave={saveVehicle}
            />
        </section>
    );
};

export default VehiclePage;