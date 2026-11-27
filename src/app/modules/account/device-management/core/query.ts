import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    collection, getDocs, onSnapshot, orderBy, query,
    type DocumentData, type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import type { IDevice } from "./model";

export const devicesKeys = { all: ["devices"] as const };

const devicesQuery = () =>
    query(collection(db, COLLECTIONS.DEVICES), orderBy("createdAt", "desc"));

const mapDocs = (docs: QueryDocumentSnapshot<DocumentData>[]): IDevice[] =>
    docs.map((d) => ({ ...d.data(), key: d.id }) as IDevice);

export const useDevicesQuery = () => {
    const queryClient = useQueryClient();

    const result = useQuery<IDevice[]>({
        queryKey: devicesKeys.all,
        queryFn: async () => mapDocs((await getDocs(devicesQuery())).docs),
        staleTime: Infinity,
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(
            devicesQuery(),
            (snapshot) => {
                if (snapshot.metadata.hasPendingWrites) return;
                queryClient.setQueryData(devicesKeys.all, mapDocs(snapshot.docs));
            },
            (error) => console.error("Device listener error", error),
        );
        return unsubscribe;
    }, [queryClient]);

    return result;
};