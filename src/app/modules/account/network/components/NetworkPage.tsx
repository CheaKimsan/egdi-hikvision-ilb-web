import { useMemo, useState } from "react";
import { AddRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import SearchField from "../../../../../_egdi_ilb/helpers/shared/search/SearchField";
import type { NetworkConfiguration } from "../core/model";
import { useNetworkStore } from "../core/store";
import NetworkFormDialog from "./form/NetworkFormDialog";
import { Columns } from "./table/Columns";

const NetworkPage: React.FC = () => {
    const configurations = useNetworkStore((state) => state.rows);
    const addConfiguration = useNetworkStore((state) => state.addConfiguration);
    const updateConfiguration = useNetworkStore((state) => state.updateConfiguration);
    const deleteConfiguration = useNetworkStore((state) => state.deleteConfiguration);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingConfiguration, setEditingConfiguration] =
        useState<NetworkConfiguration | null>(null);

    const filteredConfigurations = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return configurations;
        return configurations.filter((configuration) =>
            [
                configuration.ipAddress,
                String(configuration.httpPort),
                configuration.username,
            ].some((value) => value.toLowerCase().includes(query)),
        );
    }, [configurations, search]);

    const openCreate = () => {
        setEditingConfiguration(null);
        setFormOpen(true);
    };

    const openEdit = (configuration: NetworkConfiguration) => {
        setEditingConfiguration(configuration);
        setFormOpen(true);
    };

    const saveConfiguration = (configuration: NetworkConfiguration) => {
        if (editingConfiguration) updateConfiguration(configuration);
        else addConfiguration(configuration);
    };

    const columns = Columns({
        onEdit: openEdit,
        onDelete: deleteConfiguration,
    });

    return (
        <section className="network-management-page" aria-labelledby="network-management-title">
            <header className="network-management-header">
                <div>
                    <h1 id="network-management-title">Network Settings</h1>
                    <p>Manage network addresses and device connection credentials.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Add network"
                    icon={<AddRegular />}
                    className="network-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar ">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search network settings..."
                    ariaLabel="Search network settings"
                />
            </div>

            <div className="network-management-table">
                <MainTable
                    rows={filteredConfigurations}
                    columns={columns}
                    rowKey={(configuration) => configuration.id}
                    emptyText="No network settings found"
                    pagination
                />
            </div>
            <NetworkFormDialog
                open={formOpen}
                configuration={editingConfiguration}
                configurations={configurations}
                onClose={() => setFormOpen(false)}
                onSave={saveConfiguration}
            />
        </section>
    );
};

export default NetworkPage;