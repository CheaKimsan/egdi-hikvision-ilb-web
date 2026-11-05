export type Vehicle = {
    id: string;
    vehicleCode: string;
    name: string;
    licensePlate: string;
    vehicleType?: string;
    province?: string;
    status: "active" | "inactive" | "maintenance";
    createdAt: string;
    updatedAt: string;
};