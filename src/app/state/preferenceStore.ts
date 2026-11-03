import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LandingPage = "dashboard" | "pending-approvals";

export const LANDING_PAGE_PATHS: Record<LandingPage, string> = {
    dashboard: "/dashboard",
    "pending-approvals": "/management/pending-approvals",
};

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type PreferencesStore = {
    defaultLandingPage: LandingPage;
    defaultPageSize: number;

    setDefaultLandingPage: (page: LandingPage) => void;
    setDefaultPageSize: (size: number) => void;
};

// Client-only display preferences — nothing here has a backend column,
// unlike auth/user state. Persisted locally so a reload doesn't reset them.
export const usePreferencesStore = create<PreferencesStore>()(
    persist(
        (set) => ({
            defaultLandingPage: "dashboard",
            defaultPageSize: 10,

            setDefaultLandingPage: (page) => set({ defaultLandingPage: page }),
            setDefaultPageSize: (size) => set({ defaultPageSize: size }),
        }),
        {
            name: "gdi-ui-preferences",
        }
    )
);
