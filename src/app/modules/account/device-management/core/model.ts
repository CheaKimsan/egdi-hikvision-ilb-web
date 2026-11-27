import type { Timestamp } from "firebase/firestore";
import { AuditUser } from "../../users/core/model";

export type DeviceType = "mvr" | "camera" | "lightbar";

export interface IDevice {
    key: string;
    deviceCode: string;
    name: string;
    type: DeviceType;
    model: string;
    serialNo: string;
    firmware: string;
    activated: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: AuditUser;
    updatedBy?: AuditUser;
}