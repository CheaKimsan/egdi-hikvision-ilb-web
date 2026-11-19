
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
} from "./service";

import { FireUser } from "./model";

import { USERS_QUERY_KEY } from "./query";

// Create user
export const useCreateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: FireUser) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USERS_QUERY_KEY,
            });
        },
    });
};

// Update user
export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: FireUser) => updateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USERS_QUERY_KEY,
            });
        },
    });
};

// Delete user
export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (uid: string) => deleteUser(uid),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USERS_QUERY_KEY,
            });
        },
    });
};

// Update user status
export const useUpdateUserStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            uid,
            status,
        }: {
            uid: string;
            status: FireUser["status"];
        }) => updateUserStatus(uid, status),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USERS_QUERY_KEY,
            });
        },
    });
};
