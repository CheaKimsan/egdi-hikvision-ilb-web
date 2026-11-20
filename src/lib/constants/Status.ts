
export const statusOptions = [
    { key: 1, name: "Active" },
    { key: 0, name: "Inactive" },
];
export const STATUS_ACTIVE = statusOptions.find((s) => s.key === 1)!;
export const STATUS_INACTIVE = statusOptions.find((s) => s.key === 0)!;