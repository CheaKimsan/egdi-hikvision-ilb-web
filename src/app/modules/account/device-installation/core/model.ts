import type { Timestamp } from "firebase/firestore";
import type { IVehicle } from "../../vehicle/core/model";
import { AuditUser } from "../../users/core/model";

export interface IInstallation {
    key: string;
    deviceKey: string;
    vehicleKey: string;
    label: string;
    position: string;
    parentDeviceKey: string;
    ip: string;
    username: string;
    httpPort: number | null;
    sdkPort: number | null;
    hasPassword: boolean;
    online: boolean;                  // written by a backend poller, not the form
    lastSeen: Timestamp | null;       // written by a backend poller, not the form
    installedAt: Timestamp;
    removedAt: Timestamp | null;      // null = still installed
    notes: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: AuditUser;
    updatedBy?: AuditUser;
}