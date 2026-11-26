// vehicle/core/mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicle, deleteVehicle, updateVehicle } from "./service";
import { vehiclesKeys } from "./query";
import type { IVehicle } from "./model";

const useInvalidate = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.all });
};

export const useCreateVehicleMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (vehicle: Omit<IVehicle, "key">) => createVehicle(vehicle),
        onSuccess: invalidate,
    });
};

export const useUpdateVehicleMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (vehicle: IVehicle) => updateVehicle(vehicle),
        onSuccess: invalidate,
    });
};

export const useDeleteVehicleMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (id: string) => deleteVehicle(id),
        onSuccess: invalidate,
    });
};