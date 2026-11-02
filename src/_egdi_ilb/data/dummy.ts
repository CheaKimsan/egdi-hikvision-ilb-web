import { DummyUser } from "../../app/modules/auth/core/model";
import NoAvatar from "../assets/images/no_avatar.jpeg";


// Development-only credentials. Replace with server-side authentication before production.
export const dummyUsers: DummyUser[] = [
    {
        id: "0001",
        username: "admin",
        email: "0001@immigration.gov.kh",
        password: "Admin@123",
        displayName: "Demo Administrator",
        avatarUrl: NoAvatar,
        role: "Administrator",
    },
];
