// core/status.ts
export type StatusOption = {
    key: number;
    name: string;
};

export const STATUS_INACTIVE: StatusOption = { key: 0, name: "Inactive" };
export const STATUS_ACTIVE: StatusOption = { key: 1, name: "Active" };
export const STATUS_MAINTENANCE: StatusOption = { key: 2, name: "Maintenance" };

// General active / inactive (users, etc.)
export const statusOptions: StatusOption[] = [STATUS_ACTIVE, STATUS_INACTIVE];

// Vehicles
export const vehicleStatusOptions: StatusOption[] = [
    STATUS_INACTIVE,
    STATUS_ACTIVE,
    STATUS_MAINTENANCE,
];