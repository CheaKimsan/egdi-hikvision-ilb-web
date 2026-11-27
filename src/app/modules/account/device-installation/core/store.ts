import { create } from "zustand";
import type { IInstallation } from "./model";

export type InstallationDrawerMode = "create" | "edit";

type DrawerState = {
    open: boolean;
    mode: InstallationDrawerMode;
    installation: IInstallation | null;
};

type InstallationsState = {
    search: string;
    drawer: DrawerState;
    setSearch: (search: string) => void;
    openCreate: () => void;
    openEdit: (installation: IInstallation) => void;
    closeDrawer: () => void;
};

export const useInstallationStore = create<InstallationsState>((set) => ({
    search: "",
    drawer: { open: false, mode: "create", installation: null },
    setSearch: (search) => set({ search }),
    openCreate: () => set({ drawer: { open: true, mode: "create", installation: null } }),
    openEdit: (installation) => set({ drawer: { open: true, mode: "edit", installation } }),
    closeDrawer: () => set((s) => ({ drawer: { ...s.drawer, open: false } })),
}));