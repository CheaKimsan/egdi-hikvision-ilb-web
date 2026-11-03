import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
    activeItem: string;
    setActiveItem: (item: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            activeItem: "Dashboard",
            setActiveItem: (activeItem) => set({ activeItem }),
        }),
        { name: "sidebar-navigation" },
    ),
);
