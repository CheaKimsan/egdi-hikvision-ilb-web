export interface IFireStatus {
    key: number;
    name: string;
}

export type SessionInfo = {
    browser: string;
    browser_version: string;
    city: string;
    country: string;
    device: string;
    deviceType: "desktop" | "mobile" | "tablet";
    ipAddress: string;
    isVpn: boolean;
    isp: string;
    orientation: "landscape" | "portrait";
    os: string;
    os_version: string;
    region: string;
    userAgent: string;
};

export interface IUser {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    displayName?: string;
    avatar?: any;
    role: string;
    status?: IFireStatus;
    createdAt: any;
    createdBy?: any;
    updatedAt: any;
    updatedBy?: any;
}