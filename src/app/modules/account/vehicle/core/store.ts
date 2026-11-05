import { create } from "zustand";
import type { Vehicle } from "./model";

const sampleTimestamp = "2026-11-01T08:00:00.000Z";

export const sampleVehicles: Vehicle[] = [
    {
        id: "vehicle-001",
        vehicleCode: "VEH-001",
        name: "Patrol SUV 01",
        licensePlate: "2A-1234",
        vehicleType: "SUV",
        province: "Phnom Penh",
        status: "active",
        createdAt: sampleTimestamp,
        updatedAt: sampleTimestamp,
    },
    {
        id: "vehicle-002",
        vehicleCode: "VEH-002",
        name: "Border Patrol Pickup",
        licensePlate: "2B-5678",
        vehicleType: "Pickup",
        province: "Banteay Meanchey",
        status: "maintenance",
        createdAt: sampleTimestamp,
        updatedAt: sampleTimestamp,
    },
    {
        id: "vehicle-003",
        vehicleCode: "VEH-003",
        name: "Operations Van",
        licensePlate: "2C-9012",
        vehicleType: "Van",
        province: "Siem Reap",
        status: "inactive",
        createdAt: sampleTimestamp,
        updatedAt: sampleTimestamp,
    },
];

type VehicleState = {
    rows: Vehicle[];
    addVehicle: (vehicle: Vehicle) => void;
    updateVehicle: (vehicle: Vehicle) => void;
    deleteVehicle: (id: string) => void;
};

export const useVehicleStore = create<VehicleState>((set) => ({
    rows: sampleVehicles,
    addVehicle: (vehicle) =>
        set((state) => ({ rows: [...state.rows, vehicle] })),
    updateVehicle: (updatedVehicle) =>
        set((state) => ({
            rows: state.rows.map((vehicle) =>
                vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
            ),
        })),
    deleteVehicle: (id) =>
        set((state) => ({
            rows: state.rows.filter((vehicle) => vehicle.id !== id),
        })),
}));