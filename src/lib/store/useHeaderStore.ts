import { create } from "zustand";
import { persist } from "zustand/middleware";

type HeaderState = {
    isVisible: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export const useHeaderStore = create<HeaderState>()(
    persist(
        (set) => ({
            isVisible: true,
            open: () => set({ isVisible: true }),
            close: () => set({ isVisible: false }),
            toggle: () => set((state) => ({ isVisible: !state.isVisible })),
        }),
        {
            name: "header-store", // localStorage key
            partialize: (state) => ({ isVisible: state.isVisible }),
        },
    ),
);