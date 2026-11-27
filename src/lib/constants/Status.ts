export type StatusOption = {
    key: number;
    name: string;
};

export const activationFilterOptions = [
    {
        key: 1,
        name: "Activated"
    },
    {
        key: 0,
        name: "Not activated"
    },
];
export const STATUS_INACTIVE: StatusOption = { key: 0, name: "Inactive" };
export const STATUS_ACTIVE: StatusOption = { key: 1, name: "Active" };
export const STATUS_MAINTENANCE: StatusOption = { key: 2, name: "Maintenance" };

export const statusOptions: StatusOption[] = [STATUS_ACTIVE, STATUS_INACTIVE];

export const vehicleStatusOptions: StatusOption[] = [
    STATUS_ACTIVE,
    STATUS_INACTIVE,
    STATUS_MAINTENANCE,
];