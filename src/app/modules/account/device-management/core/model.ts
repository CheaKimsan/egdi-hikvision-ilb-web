export type Device = {
    id: string;
    name: string;
    type: "mvr" | "camera" | "lightbar";
    model: string;
    serialNo?: string;
    siteId: string;
    siteName: string;
    firmware?: string;
    ip?: string;
    httpPort: number;
    sdkPort: number;
    username: string;
    hasPassword: boolean;
    activated: boolean;
    online: boolean;
    lastSeen?: string;
};

export type ManagedDevice = Device;
