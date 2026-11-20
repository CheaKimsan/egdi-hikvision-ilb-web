import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../../../../config/firebase.config";
import { COLLECTIONS } from "../../../../../config/firestore.constant";
import { IUser } from "./model";

export const usersKeys = {
    all: ["users"] as const,
    detail: (uid: string) => ["users", uid] as const,
};

export const fetchUsers = async (): Promise<IUser[]> => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));

    return snapshot.docs.map((document) => ({
        ...document.data(),
        uid: document.id,
    })) as IUser[];
};

export const useUsersQuery = () => {
    return useQuery({
        queryKey: usersKeys.all,
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 5,
    });
};