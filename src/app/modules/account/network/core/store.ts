import { create } from "zustand";
import type { NetworkConfiguration } from "./model";

type NetworkState = {
    rows: NetworkConfiguration[];
    addConfiguration: (configuration: NetworkConfiguration) => void;
    updateConfiguration: (configuration: NetworkConfiguration) => void;
    deleteConfiguration: (id: string) => void;
};

const initialConfigurations: NetworkConfiguration[] = [
    {
        id: "network-sample-1",
        ipAddress: "192.168.1.100",
        httpPort: 80,
        username: "Administrator",
        password: "",
        updatedAt: new Date().toISOString(),
    },
];

const useNetworkStore = create<NetworkState>((set) => ({
    rows: initialConfigurations,
    addConfiguration: (configuration) =>
        set((state) => ({ rows: [...state.rows, configuration] })),
    updateConfiguration: (updatedConfiguration) =>
        set((state) => ({
            rows: state.rows.map((configuration) =>
                configuration.id === updatedConfiguration.id
                    ? updatedConfiguration
                    : configuration,
            ),
        })),
    deleteConfiguration: (id) =>
        set((state) => ({
            rows: state.rows.filter((configuration) => configuration.id !== id),
        })),
}));

export { useNetworkStore };