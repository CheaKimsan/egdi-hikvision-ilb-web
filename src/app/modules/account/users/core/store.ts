import { create } from "zustand";
import { dummyUsers } from "../../../../../_egdi_ilb/data/dummy";
import type { FireUser } from "./model";

type UserDrawerMode = "create" | "view" | "edit";

type UserDrawerState = {
    open: boolean;
    mode: UserDrawerMode;
    user: FireUser | null;
};

type UsersState = {
    rows: FireUser[];
    search: string;
    page: number;
    pageSize: number;
    drawer: UserDrawerState;

    setRows: (rows: FireUser[]) => void;
    addUser: (user: FireUser) => void;
    updateUser: (user: FireUser) => void;
    deleteUser: (id: string) => void;
    setUserStatus: (id: string, status: FireUser["status"]) => void;
    setSearch: (q: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    openCreate: () => void;
    openView: (user: FireUser) => void;
    openEdit: (user: FireUser) => void;
    closeDrawer: () => void;
};

const initialRows: FireUser[] = dummyUsers.map(({ password: _password, ...user }) => user);

const useUsersStore = create<UsersState>((set) => ({
    rows: initialRows,
    search: "",
    page: 0,
    pageSize: 10,
    drawer: { open: false, mode: "create", user: null },

    setRows: (rows) => set({ rows }),
    addUser: (user) => set((state) => ({ rows: [...state.rows, user] })),
    updateUser: (updatedUser) =>
        set((state) => ({
            rows: state.rows.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
            ),
        })),
    deleteUser: (id) =>
        set((state) => ({ rows: state.rows.filter((user) => user.id !== id) })),
    setUserStatus: (id, status) =>
        set((state) => ({
            rows: state.rows.map((user) =>
                user.id === id
                    ? { ...user, status, updatedAt: new Date().toISOString() }
                    : user,
            ),
        })),
    setSearch: (search) => set({ search, page: 0 }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 0 }),

    openCreate: () =>
        set({ drawer: { open: true, mode: "create", user: null } }),
    openView: (user) =>
        set({ drawer: { open: true, mode: "view", user } }),
    openEdit: (user) =>
        set({ drawer: { open: true, mode: "edit", user } }),
    closeDrawer: () =>
        set((state) => ({
            drawer: { ...state.drawer, open: false },
        })),
}));

export type { UserDrawerMode };
export { useUsersStore };