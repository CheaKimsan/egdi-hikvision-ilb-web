export interface DummyUser {
    id: string;
    username: string;
    email: string;
    password: string;
    displayName: string;
    avatarUrl: string;
    role: string;
    status: "active" | "inactive";
    lastLoginAt?: string;
    createdAt: any;
    updatedAt: any;
}