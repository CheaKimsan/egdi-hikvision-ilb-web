import { useMutation } from "@tanstack/react-query";
import {
    createInstallation, deleteInstallation, updateInstallation,
    type InstallationInput,
} from "./service";
import type { IInstallation } from "./model";

export const useCreateInstallationMutation = () =>
    useMutation({ mutationFn: (input: InstallationInput) => createInstallation(input) });

export const useUpdateInstallationMutation = () =>
    useMutation({ mutationFn: (item: IInstallation) => updateInstallation(item) });

export const useDeleteInstallationMutation = () =>
    useMutation({ mutationFn: (key: string) => deleteInstallation(key) });