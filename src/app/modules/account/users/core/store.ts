
import { create } from "zustand";
import type { FireUser } from "./model";

export type UserDrawerMode = "create" | "view" | "edit";

type UserDrawerState = {
    open: boolean;
    mode: UserDrawerMode;
    user: FireUser | null;
};

type UsersState = {
    search: string;
    page: number;
    pageSize: number;
    drawer: UserDrawerState;

    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    openCreate: () => void;
    openView: (user: FireUser) => void;
    openEdit: (user: FireUser) => void;
    closeDrawer: () => void;
};

export const useUsersStore = create<UsersState>((set) => ({
    search: "",
    page: 0,
    pageSize: 10,

    drawer: {
        open: false,
        mode: "create",
        user: null,
    },

    setSearch: (search) => set({
        search,
        page: 0,
    }),

    setPage: (page) => set({ page }),

    setPageSize: (pageSize) => set({
        pageSize,
        page: 0,
    }),

    openCreate: () => set({
        drawer: {
            open: true,
            mode: "create",
            user: null,
        },
    }),

    openView: (user) => set({
        drawer: {
            open: true,
            mode: "view",
            user,
        },
    }),

    openEdit: (user) => set({
        drawer: {
            open: true,
            mode: "edit",
            user,
        },
    }),

    closeDrawer: () => set((state) => ({
        drawer: {
            ...state.drawer,
            open: false,
        },
    })),
}));
