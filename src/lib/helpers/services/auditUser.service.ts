// getCurrentAuditUser.ts
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase.config";
import { COLLECTIONS } from "../../../config/firestore.constant";
import type { AuditUser, IUser } from "../../../app/modules/account/users/core/model";

export const getCurrentAuditUser = async (): Promise<AuditUser> => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("You must be signed in");

    const snap = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    const profile = snap.data() as IUser | undefined;
    const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

    return {
        uid: user.uid,
        name: fullName,
        email: user.email ?? "",
    };
};