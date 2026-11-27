// device/core/store.ts
import { create } from "zustand";
import type { IDevice } from "./model";

export type DeviceDrawerMode = "create" | "view" | "edit";

type DeviceDrawerState = {
    open: boolean;
    mode: DeviceDrawerMode;
    device: IDevice | null;
};

type DevicesState = {
    search: string;
    page: number;
    pageSize: number;
    drawer: DeviceDrawerState;

    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    openCreate: () => void;
    openView: (device: IDevice) => void;
    openEdit: (device: IDevice) => void;
    closeDrawer: () => void;
};

export const useDeviceStore = create<DevicesState>((set) => ({
    search: "",
    page: 0,
    pageSize: 10,

    drawer: {
        open: false,
        mode: "create",
        device: null,
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
            device: null,
        },
    }),

    openView: (device) => set({
        drawer: {
            open: true,
            mode: "view",
            device,
        },
    }),

    openEdit: (device) => set({
        drawer: {
            open: true,
            mode: "edit",
            device,
        },
    }),

    closeDrawer: () => set((state) => ({
        drawer: {
            ...state.drawer,
            open: false,
        },
    })),
}));