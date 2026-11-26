import { getAuth } from "firebase/auth";
import type { AuditUser } from "../../../app/modules/account/users/core/model";

export const getCurrentAuditUser = (): AuditUser => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("You must be signed in");

    const email = user.email ?? "";

    return {
        uid: user.uid,
        name: user.displayName || email,
        email,
    };
};