import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
    activeItem: string;
    isCollapsed: boolean;
    setActiveItem: (item: string) => void;
    toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            activeItem: "Dashboard",
            isCollapsed: false,
            setActiveItem: (activeItem) => set({ activeItem }),
            toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        }),
        { name: "sidebar-navigation" },
    ),
);
