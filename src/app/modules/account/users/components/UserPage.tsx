
import { useCallback, useMemo } from "react";
import CustomBtn from "../../../../../lib/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../lib/helpers/shared/table/MainTable";
import { useUsersStore } from "../core/store";
import type { FireUser } from "../core/model";
import CreateUserPage from "./form/CreateUserPage";
import { Columns } from "./table/Columns";
import SearchField from "../../../../../lib/helpers/shared/search/SearchField";
import { UserRoundPlus } from "lucide-react";

import { useUsersQuery } from "../core/query";
import {
    useDeleteUserMutation,
    useUpdateUserStatusMutation,
} from "../core/action";

const UserPage: React.FC = () => {

    const search = useUsersStore((state) => state.search);
    const setSearch = useUsersStore((state) => state.setSearch);
    const openCreate = useUsersStore((state) => state.openCreate);
    const openEdit = useUsersStore((state) => state.openEdit);

    const {
        data: users = [],
        isLoading,
    } = useUsersQuery();

    const deleteMutation = useDeleteUserMutation();
    const statusMutation = useUpdateUserStatusMutation();

    const handleEdit = useCallback(
        (row: FireUser) => openEdit(row),
        [openEdit],
    );

    const handleDelete = useCallback(
        async (id: string) => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation.mutateAsync],
    );

    const handleToggleStatus = useCallback(
        (id: string, status: FireUser["status"]) => {
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
    // Search users
    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return users.filter((user) =>
            [
                user.displayName,
                user.email,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(keyword),
            ),
        );
    }, [users, search]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(r => r.status?.key === 1).length,
        inactive: users.filter(r => r.status?.key === 0).length,
        admin: users.filter(r => r.role === "admin").length,
    }), [users]);

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
            </div>

            <div className="user-management-table">
                <MainTable
                    rows={filteredUsers}
                    columns={tableColumns}
                    rowKey={(user) => user.uid}
                    emptyText="No users found"
                    pagination
                    loading={isLoading}
                />
            </div>

            <CreateUserPage />
        </section>
    );
};

export default UserPage;
