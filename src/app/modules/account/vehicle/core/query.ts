// vehicle/core/query.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    type DocumentData,
    type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import type { IVehicle } from "./model";

export const vehiclesKeys = {
    all: ["vehicles"] as const,
};

const vehiclesQuery = () =>
    query(collection(db, COLLECTIONS.VEHICLES), orderBy("createdAt", "desc"));

const mapDocs = (docs: QueryDocumentSnapshot<DocumentData>[]): IVehicle[] =>
    docs.map((d) => {
        const data = d.data();
        return {
            ...data,
            key: d.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as IVehicle;
    });

export const useVehiclesQuery = () => {
    const queryClient = useQueryClient();

    // Initial load: gives you real isLoading / error states
    const result = useQuery<IVehicle[]>({
        queryKey: vehiclesKeys.all,
        queryFn: async () => mapDocs((await getDocs(vehiclesQuery())).docs),
        staleTime: Infinity, // the listener keeps it fresh
    });

    // Live updates
    useEffect(() => {
        const unsubscribe = onSnapshot(
            vehiclesQuery(),
            (snapshot) => {
                // Wait for the server timestamp on local writes
                if (snapshot.metadata.hasPendingWrites) return;
                queryClient.setQueryData(vehiclesKeys.all, mapDocs(snapshot.docs));
            },
            (error) => console.error("Vehicle listener error", error),
        );
        return unsubscribe;
    }, [queryClient]);

    return result;
};