
import {
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";
import { FireUser } from "./model";
import { db } from "../../../../../config/firebase.config";


const USERS_COLLECTION = "users";

// Create user profile
export const createUser = async (user: FireUser): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, user.uid);

    await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

// Update user profile
export const updateUser = async (user: FireUser): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, user.uid);

    const { uid, ...userData } = user;

    await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
    });
};

// Delete user profile
export const deleteUser = async (uid: string): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await deleteDoc(userRef);
};

// Update user status
export const updateUserStatus = async (
    uid: string,
    status: FireUser["status"]
): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp(),
    });
};
