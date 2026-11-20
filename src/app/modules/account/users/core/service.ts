import { initializeApp, deleteApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import {
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db, firebaseConfig } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import { IUser } from "./model";

const DEFAULT_PASSWORD = "Immigration@2026"; // at least 6 characters

export const createUser = async (user: IUser): Promise<void> => {
    const { uid: _uid, password: _password, ...profile } = user;

    const secondaryApp = initializeApp(firebaseConfig, `create-user-${Date.now()}`);

    try {
        const secondaryAuth = getAuth(secondaryApp);

        const cred = await createUserWithEmailAndPassword(
            secondaryAuth,
            profile.email,
            DEFAULT_PASSWORD,
        );
        const uid = cred.user.uid;
        await signOut(secondaryAuth);

        await setDoc(doc(db, COLLECTIONS.USERS, uid), {
            ...profile,
            uid,
            status: profile.status ?? { key: 1, name: "Active" },
            defaultPassword: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } finally {
        await deleteApp(secondaryApp);
    }
};

export const updateUser = async (user: IUser): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);

    const { uid, password, createdAt, ...userData } = user;

    await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
    });
};

export const deleteUser = async (uid: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
};

// Update user status
export const updateUserStatus = async (
    uid: string,
    status: IUser["status"],
): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
        status,
        updatedAt: serverTimestamp(),
    });
};