import { create } from "zustand";
import type { Installation } from "./model";

const sampleInstalledAt = "2026-10-28T08:30:00.000Z";

export const sampleInstallations: Installation[] = [
    {
        id: "installation-001",
        deviceId: "gdi-02",
        vehicleCode: "VEH-001",
        label: "Patrol MVR 01",
        position: "Under front seat",
        ip: "192.168.1.102",
        username: "Administrator",
        httpPort: 80,
        sdkPort: 8000,
        hasPassword: true,
        online: true,
        lastSeen: "2026-11-05T08:15:00.000Z",
        installedAt: sampleInstalledAt,
        installedBy: "Demo Administrator",
        notes: "Primary mobile video recorder.",
    },
    {
        id: "installation-002",
        deviceId: "gdi-03",
        vehicleCode: "VEH-001",
        label: "Patrol Lightbar 01",
        position: "Vehicle roof",
        parentId: "gdi-02",
        ip: "192.168.1.103",
        username: "Administrator",
        httpPort: 80,
        sdkPort: 8000,
        hasPassword: true,
        online: true,
        lastSeen: "2026-11-05T08:15:00.000Z",
        installedAt: sampleInstalledAt,
        installedBy: "Demo Administrator",
        notes: "Paired with the patrol MVR.",
    },
];

type InstallationState = {
    rows: Installation[];
    addInstallation: (installation: Installation) => void;
    updateInstallation: (installation: Installation) => void;
    deleteInstallation: (id: string) => void;
};

export const useInstallationStore = create<InstallationState>((set) => ({
    rows: sampleInstallations,
    addInstallation: (installation) =>
        set((state) => ({ rows: [...state.rows, installation] })),
    updateInstallation: (updatedInstallation) =>
        set((state) => ({
            rows: state.rows.map((installation) =>
                installation.id === updatedInstallation.id
                    ? updatedInstallation
                    : installation,
            ),
        })),
    deleteInstallation: (id) =>
        set((state) => ({
            rows: state.rows.filter((installation) => installation.id !== id),
        })),
}));
