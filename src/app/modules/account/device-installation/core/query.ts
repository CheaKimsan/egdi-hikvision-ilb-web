import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    collection, getDocs, onSnapshot, orderBy, query,
    type DocumentData, type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import type { IInstallation } from "./model";

export const installationsKeys = { all: ["installations"] as const };

const installationsQuery = () =>
    query(collection(db, COLLECTIONS.INSTALLATIONS), orderBy("createdAt", "desc"));

const mapDocs = (docs: QueryDocumentSnapshot<DocumentData>[]): IInstallation[] =>
    docs.map((d) => ({ ...d.data(), key: d.id }) as IInstallation);

export const useInstallationsQuery = () => {
    const queryClient = useQueryClient();

    const result = useQuery<IInstallation[]>({
        queryKey: installationsKeys.all,
        queryFn: async () => mapDocs((await getDocs(installationsQuery())).docs),
        staleTime: Infinity,
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(
            installationsQuery(),
            (snapshot) => {
                if (snapshot.metadata.hasPendingWrites) return;
                queryClient.setQueryData(installationsKeys.all, mapDocs(snapshot.docs));
            },
            (error) => console.error("Installation listener error", error),
        );
        return unsubscribe;
    }, [queryClient]);

    return result;
};