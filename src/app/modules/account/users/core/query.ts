
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { FireUser } from "./model";
import { db } from "../../../../../config/firebase.config";

const USERS_COLLECTION = "users";

export const USERS_QUERY_KEY = ["users"];

export const fetchUsers = async (): Promise<FireUser[]> => {
    const snapshot = await getDocs(
        collection(db, USERS_COLLECTION)
    );

    return snapshot.docs.map((document) => ({
        ...document.data(),
        uid: document.id,
    })) as FireUser[];
};

export const useUsersQuery = () => {
    return useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 5,
    });
};
