
export const statusOptions = [
    { key: 0, name: "Inactive" },
    { key: 1, name: "Active" },

];
export const STATUS_ACTIVE = statusOptions.find((s) => s.key === 1)!;
export const STATUS_INACTIVE = statusOptions.find((s) => s.key === 0)!;