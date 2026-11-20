import { useCallback, useMemo, useState } from "react";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import { useUsersStore } from "../core/store";
import type { IUser } from "../core/model";
import CreateUserPage from "./form/CreateUserPage";
import { Columns } from "./table/Columns";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import { UserRoundPlus } from "lucide-react";
import { useUsersQuery } from "../core/query";
import {
    useDeleteUserMutation,
    useUpdateUserStatusMutation,
} from "../core/action";
import StatusFilter, { ALL_STATUS, matchesStatus } from "../../../../../lib/helpers/shared/filter/status/StatusFilter";

const UserPage: React.FC = () => {
    const search = useUsersStore((state) => state.search);
    const setSearch = useUsersStore((state) => state.setSearch);
    const openCreate = useUsersStore((state) => state.openCreate);
    const openEdit = useUsersStore((state) => state.openEdit);

    const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);

    const { data: users = [], isLoading } = useUsersQuery();

    const deleteMutation = useDeleteUserMutation();
    const statusMutation = useUpdateUserStatusMutation();

    const handleEdit = useCallback(
        (row: IUser) => openEdit(row),
        [openEdit],
    );

    const handleDelete = useCallback(
        async (id: string) => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation.mutateAsync],
    );

    const handleToggleStatus = useCallback(
        (id: string, status: IUser["status"]) => {
            statusMutation.mutate({ uid: id, status });
        },
        [statusMutation.mutate],
    );

    const tableColumns = useMemo(
        () =>
            Columns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                onToggleStatus: handleToggleStatus,
            }),
        [handleEdit, handleDelete, handleToggleStatus],
    );

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch = [user.displayName, user.email].some((value) =>
                String(value ?? "").toLowerCase().includes(keyword),
            );

            return matchesSearch && matchesStatus(user.status, statusFilter);
        });
    }, [users, search, statusFilter]);

    return (
        <section
            className="user-management-page"
            aria-labelledby="user-management-title"
        >
            <header className="user-management-header">
                <div>
                    <h1 id="user-management-title">User Management</h1>
                    <p>View and manage user accounts and roles.</p>
                </div>

                <CustomBtn
                    type="add"
                    label="Create user"
                    icon={<UserRoundPlus size={18} />}
                    className="user-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="search-toolbar">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search users..."
                />

                <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            </div>

            <div className="user-management-table">
                <MainTable
                    rows={filteredUsers}
                    columns={tableColumns}
                    rowKey={(user) => user.uid}
                    emptyText="No Users Found"
                    pagination
                    loading={isLoading}
                />
            </div>

            <CreateUserPage />
        </section>
    );
};

export default UserPage;