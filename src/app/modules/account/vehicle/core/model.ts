import { Timestamp } from "firebase/firestore";
import type { StatusOption } from "../../../../../lib/constants/Status";
import type { AuditUser } from "../../users/core/model";

export type IVehicle = {
    key: string;
    vehicleCode: string;
    name: string;
    licensePlate: string;
    vehicleType?: string;
    province?: string;
    status: StatusOption;
    createdAt?: Timestamp;
    createdBy?: AuditUser;
    updatedAt?: Timestamp;
    updatedBy?: AuditUser;
};