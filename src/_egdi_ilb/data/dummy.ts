export interface DummyUser {
    id: string;
    username: string;
    password: string;
    displayName: string;
    role: string;
}

// Development-only credentials. Replace with server-side authentication before production.
export const dummyUsers: DummyUser[] = [
    {
        id: "0001",
        username: "admin",
        password: "Admin@123",
        displayName: "Demo Administrator",
        role: "Administrator",
    },
];
