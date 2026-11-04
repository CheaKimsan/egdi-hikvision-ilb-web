import { useCallback, useMemo } from "react";
import { Input } from "@fluentui/react-components";
import { AddRegular, SearchRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import MainTable from "../../../../../_egdi_ilb/helpers/shared/table/MainTable";
import { useUsersStore } from "../core/store";
import type { FireUser } from "../core/model";
import CreateUserPage from "./form/CreateUserPage";
import { Columns } from "./table/Columns";
import SearchField from "../../../../../_egdi_ilb/helpers/shared/search/SearchField";

const UserPage: React.FC = () => {
    const search = useUsersStore((state) => state.search);
    const setSearch = useUsersStore((state) => state.setSearch);
    const users = useUsersStore((state) => state.rows);
    const deleteUser = useUsersStore((state) => state.deleteUser);
    const setUserStatus = useUsersStore((state) => state.setUserStatus);
    const openCreate = useUsersStore((state) => state.openCreate);
    const openEdit = useUsersStore((state) => state.openEdit);

    const handleEdit = useCallback((row: FireUser) => openEdit(row), [openEdit]);

    const handleDelete = useCallback((id: string) => deleteUser(id), [deleteUser]);

    const handleToggleStatus = useCallback(
        (id: string, status: FireUser["status"]) => setUserStatus(id, status),
        [setUserStatus],
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

    const filteredUsers = users.filter((user) =>
        [
            user.id,
            user.displayName,
            user.username,
            user.email,
            user.role,
            user.status,
            user.lastLoginAt ?? "",
        ]
            .some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
    );

    return (
        <section className="user-management-page" aria-labelledby="user-management-title">
            <header className="user-management-header">
                <div>
                    <h1 id="user-management-title">User Management</h1>
                    <p>View and manage user accounts and roles.</p>
                </div>
                <CustomBtn
                    type="add"
                    label="Create user"
                    icon={<AddRegular />}
                    className="user-management-create-button"
                    size="medium"
                    onClick={openCreate}
                />
            </header>

            <div className="user-management-toolbar">
                {/* <Input
                    aria-label="Search users"
                    contentBefore={<SearchRegular />}
                    placeholder="Search users"
                    value={search}
                    onChange={(_event, data) => setSearch(data.value)}
                /> */}

                <SearchField value={search} onChange={setSearch} placeholder="Search users..." />

            </div>

            <div className="user-management-table">
                <MainTable
                    rows={filteredUsers}
                    columns={tableColumns}
                    rowKey={(user) => user.id}
                    emptyText="No users found"
                    pagination
                />
            </div>
            <CreateUserPage />
        </section>
    );
};

export default UserPage;