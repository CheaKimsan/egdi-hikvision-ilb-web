import {
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import type { IVehicle } from "./model";
import { getCurrentAuditUser } from "../../../../../lib/helpers/services/auditUser.service";

export const createVehicle = async (vehicle: Omit<IVehicle, "key">): Promise<string> => {
    const ref = doc(collection(db, COLLECTIONS.VEHICLES)); // generates an ID, no write yet
    await setDoc(ref, {
        ...vehicle,
        key: ref.id,
        createdAt: serverTimestamp(),
        createdBy: getCurrentAuditUser(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
};

export const updateVehicle = async (vehicle: IVehicle): Promise<void> => {
    const { key, createdAt, ...data } = vehicle;
    await updateDoc(doc(db, COLLECTIONS.VEHICLES, key), {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteVehicle = async (key: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.VEHICLES, key));
};