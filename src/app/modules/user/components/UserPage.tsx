import { useCallback, useMemo, useState } from "react";
import { Input } from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";
import { dummyUsers } from "../../../../_egdi_ilb/data/dummy";
import MainTable from "../../../../_egdi_ilb/helpers/shared/table/MainTable";
import type { AuthUser } from "../../auth/AuthContext";
import { Columns } from "./table/Columns";

const UserPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<AuthUser[]>(() =>
        dummyUsers.map(({ password: _password, ...user }) => user),
    );

    const handleEdit = useCallback((row: AuthUser) => {
        console.log("edit", row); // open your edit dialog here
    }, []);

    const handleDelete = useCallback((id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const tableColumns = useMemo(
        () => Columns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete],
    );

    const filteredUsers = users.filter((user) =>
        [user.id, user.displayName, user.username, user.email, user.role]
            .some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
    );

    return (
        <section className="user-management-page" aria-labelledby="user-management-title">
            <header className="user-management-header">
                <div>
                    <h1 id="user-management-title">User Management</h1>
                    <p>View and manage user accounts and roles.</p>
                </div>
            </header>

            <div className="user-management-toolbar">
                <Input
                    aria-label="Search users"
                    contentBefore={<SearchRegular />}
                    placeholder="Search users"
                    value={search}
                    onChange={(_event, data) => setSearch(data.value)}
                />
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
        </section>
    );
};

export default UserPage;