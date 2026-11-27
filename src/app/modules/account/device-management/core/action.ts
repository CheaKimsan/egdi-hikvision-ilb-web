import { useMutation } from "@tanstack/react-query";
import {
    createDevice, deleteDevice, setDeviceActivation, updateDevice,
    type DeviceInput,
} from "./service";
import type { IDevice } from "./model";

export const useCreateDeviceMutation = () =>
    useMutation({ mutationFn: (input: DeviceInput) => createDevice(input) });

export const useUpdateDeviceMutation = () =>
    useMutation({ mutationFn: (device: IDevice) => updateDevice(device) });

export const useToggleDeviceActivationMutation = () =>
    useMutation({
        mutationFn: ({ key, activated }: { key: string; activated: boolean }) =>
            setDeviceActivation(key, activated),
    });

export const useDeleteDeviceMutation = () =>
    useMutation({ mutationFn: (key: string) => deleteDevice(key) });