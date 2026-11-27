import {
    collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import { getCurrentAuditUser } from "../../../../../lib/helpers/services/auditUser.service";
import type { IDevice } from "./model";

export type DeviceInput = Omit<IDevice, "key">;

export const createDevice = async (input: DeviceInput): Promise<string> => {
    const audit = await getCurrentAuditUser();
    const ref = doc(collection(db, COLLECTIONS.DEVICES));
    await setDoc(ref, {
        ...input,
        key: ref.id,
        createdAt: serverTimestamp(),
        createdBy: audit,
        updatedAt: serverTimestamp(),
        updatedBy: audit,
    });
    return ref.id;
};

export const updateDevice = async (device: IDevice): Promise<void> => {
    const audit = await getCurrentAuditUser();
    const { key, createdAt, createdBy, updatedAt, updatedBy, ...data } = device;
    await updateDoc(doc(db, COLLECTIONS.DEVICES, key), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: audit,
    });
};

export const setDeviceActivation = async (key: string, activated: boolean): Promise<void> => {
    const audit = await getCurrentAuditUser();
    await updateDoc(doc(db, COLLECTIONS.DEVICES, key), {
        activated,
        updatedAt: serverTimestamp(),
        updatedBy: audit,
    });
};

export const deleteDevice = async (key: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.DEVICES, key));
};