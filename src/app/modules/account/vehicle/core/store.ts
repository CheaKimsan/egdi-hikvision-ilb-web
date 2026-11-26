// vehicle/core/store.ts
import { create } from "zustand";
import type { IVehicle } from "./model";

export type VehicleDrawerMode = "create" | "view" | "edit";

type VehicleDrawerState = {
    open: boolean;
    mode: VehicleDrawerMode;
    vehicle: IVehicle | null;
};

type VehiclesState = {
    search: string;
    page: number;
    pageSize: number;
    drawer: VehicleDrawerState;

    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    openCreate: () => void;
    openView: (vehicle: IVehicle) => void;
    openEdit: (vehicle: IVehicle) => void;
    closeDrawer: () => void;
};

export const useVehicleStore = create<VehiclesState>((set) => ({
    search: "",
    page: 0,
    pageSize: 10,

    drawer: {
        open: false,
        mode: "create",
        vehicle: null,
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
            vehicle: null,
        },
    }),

    openView: (vehicle) => set({
        drawer: {
            open: true,
            mode: "view",
            vehicle,
        },
    }),

    openEdit: (vehicle) => set({
        drawer: {
            open: true,
            mode: "edit",
            vehicle,
        },
    }),

    closeDrawer: () => set((state) => ({
        drawer: {
            ...state.drawer,
            open: false,
        },
    })),
}));