export type Installation = {
    id: string;
    deviceId: string;
    vehicleCode: string;
    label: string;
    position: string;
    parentId?: string;
    ip?: string;
    username?: string;
    httpPort?: number;
    sdkPort?: number;
    hasPassword: boolean;
    online: boolean;
    lastSeen?: string;
    installedAt: string;
    installedBy: string;
    removedAt?: string;
    notes?: string;
};