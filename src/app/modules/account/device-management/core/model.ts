export type ManagedDeviceStatus = "active" | "inactive";

export interface ManagedDevice {
    id: string;
    name: string;
    deviceNumber: number;
    type: "Camera" | "NVR" | "Access Control" | "Terminal Server";
    model: string;
    serialNumber: string;
    firmwareVersion: string;
    encodingVersion: string;
    webVersion: string;
    pluginVersion: string;
    channelCount: number;
    hddCount: number;
    alarmInputCount: number;
    alarmOutputCount: number;
    ipAddress?: string;
    location?: string;
    status: ManagedDeviceStatus;
    updatedAt: string;
}
