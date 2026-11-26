import { StatusOption } from "../../../../../lib/constants/Status";
import { AuditUser } from "../../users/core/model";

export type IVehicle = {
    key: string;
    vehicleCode: string;
    name: string;
    licensePlate: string | null;
    vehicleType?: string;
    province?: string;
    status: StatusOption;
    createdAt?: any;
    createdBy: AuditUser;
    updatedAt?: any;
    updatedBy: AuditUser;
};