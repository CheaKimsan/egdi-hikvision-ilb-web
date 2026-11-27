import {
    collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import { getCurrentAuditUser } from "../../../../../lib/helpers/services/auditUser.service";
import type { IInstallation } from "./model";

export type InstallationInput = Omit<
    IInstallation,
    "key" | "online" | "lastSeen" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;

export const createInstallation = async (input: InstallationInput): Promise<string> => {
    const audit = await getCurrentAuditUser();
    const ref = doc(collection(db, COLLECTIONS.INSTALLATIONS));
    await setDoc(ref, {
        ...input,
        key: ref.id,
        online: false,
        lastSeen: null,
        createdAt: serverTimestamp(),
        createdBy: audit,
        updatedAt: serverTimestamp(),
        updatedBy: audit,
    });
    return ref.id;
};

export const updateInstallation = async (installation: IInstallation): Promise<void> => {
    const audit = await getCurrentAuditUser();
    const {
        key, online, lastSeen, createdAt, createdBy, updatedAt, updatedBy, ...data
    } = installation;
    await updateDoc(doc(db, COLLECTIONS.INSTALLATIONS, key), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: audit,
    });
};

export const deleteInstallation = async (key: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.INSTALLATIONS, key));
};