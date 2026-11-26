import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
} from "./service";

import { IUser } from "./model";
import { usersKeys } from "./query";

const useCreateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: IUser) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: usersKeys.all,
            });
        },
    });
};

const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: IUser) => updateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: usersKeys.all,
            });
        },
    });
};

const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (uid: string) => deleteUser(uid),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: usersKeys.all,
            });
        },
    });
};

const useUpdateUserStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            uid,
            status,
        }: {
            uid: string;
            status: IUser["status"];
        }) => updateUserStatus(uid, status),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: usersKeys.all,
            });
        },
    });
};

export {
    useCreateUserMutation,
    useDeleteUserMutation,
    useUpdateUserMutation,
    useUpdateUserStatusMutation
}