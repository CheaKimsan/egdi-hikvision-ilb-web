import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown, Field, Input, Option } from "@fluentui/react-components";
import CustomBtn from "../../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import OpenDrawer from "../../../../../../_egdi_ilb/helpers/shared/drawer/OpenDrawer";
import ConfirmCreateDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmEditDialog";
import { CAMBODIA_PROVINCES } from "../../../../../../_egdi_ilb/data/CambodiaProvinces";
import type { Vehicle } from "../../core/model";
import { CarTaxiFront } from "lucide-react";

type VehicleFormValues = {
    vehicleCode: string;
    name: string;
    licensePlate: string;
    vehicleType: string;
    province: string;
    status: Vehicle["status"];
};

type Props = {
    open: boolean;
    vehicle: Vehicle | null;
    vehicles: Vehicle[];
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
};

const emptyValues: VehicleFormValues = {
    vehicleCode: "",
    name: "",
    licensePlate: "",
    vehicleType: "",
    province: "",
    status: "active",
};

const statuses: Vehicle["status"][] = ["active", "inactive", "maintenance"];

const CreateVehiclePage: React.FC<Props> = ({
    open,
    vehicle,
    vehicles,
    onClose,
    onSave,
}) => {
    const isEditing = vehicle !== null;
    const [pendingVehicle, setPendingVehicle] = useState<Vehicle | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<VehicleFormValues>(
        () =>
            vehicle
                ? {
                    vehicleCode: vehicle.vehicleCode,
                    name: vehicle.name,
                    licensePlate: vehicle.licensePlate,
                    vehicleType: vehicle.vehicleType ?? "",
                    province: vehicle.province ?? "",
                    status: vehicle.status,
                }
                : emptyValues,
        [vehicle],
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                vehicleCode: Yup.string()
                    .trim()
                    .required("Vehicle code is required")
                    .max(30, "Vehicle code must be 30 characters or fewer")
                    .test(
                        "unique-code",
                        "Vehicle code already exists",
                        (value) =>
                            !vehicles.some(
                                (item) =>
                                    item.id !== vehicle?.id &&
                                    item.vehicleCode.toLowerCase() === value?.trim().toLowerCase(),
                            ),
                    ),
                name: Yup.string().trim().required("Vehicle name is required").max(100),
                licensePlate: Yup.string()
                    .trim()
                    .required("License plate is required")
                    .max(20, "License plate must be 20 characters or fewer")
                    .test(
                        "unique-plate",
                        "License plate already exists",
                        (value) =>
                            !vehicles.some(
                                (item) =>
                                    item.id !== vehicle?.id &&
                                    item.licensePlate.toLowerCase() === value?.trim().toLowerCase(),
                            ),
                    ),
                vehicleType: Yup.string().max(50, "Vehicle type must be 50 characters or fewer"),
                province: Yup.string().oneOf([
                    "",
                    ...CAMBODIA_PROVINCES.map((province) => province.name),
                ], "Select a valid province"),
                status: Yup.mixed<Vehicle["status"]>()
                    .oneOf(statuses)
                    .required("Status is required"),
            }),
        [vehicle?.id, vehicles],
    );

    const formik = useFormik<VehicleFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const now = new Date().toISOString();
            const nextVehicle: Vehicle = {
                id: vehicle?.id ?? `vehicle-${Date.now()}`,
                vehicleCode: values.vehicleCode.trim(),
                name: values.name.trim(),
                licensePlate: values.licensePlate.trim(),
                vehicleType: values.vehicleType.trim() || undefined,
                province: values.province.trim() || undefined,
                status: values.status,
                createdAt: vehicle?.createdAt ?? now,
                updatedAt: now,
            };
            setPendingVehicle(nextVehicle);
            if (isEditing) setConfirmEditOpen(true);
            else setConfirmCreateOpen(true);
            setSubmitting(false);
        },
    });

    const resetForm = formik.resetForm;
    useEffect(() => {
        if (open) resetForm({ values: initialValues });
    }, [open, initialValues, resetForm]);

    const closeConfirmation = () => {
        setPendingVehicle(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = () => {
        if (!pendingVehicle) return;
        onSave(pendingVehicle);
        closeConfirmation();
        onClose();
    };

    const fieldProps = (field: keyof VehicleFormValues) => ({
        validationState:
            formik.touched[field] && formik.errors[field]
                ? "error" as const
                : "none" as const,
        validationMessage: formik.touched[field] ? formik.errors[field] : undefined,
    });

    return (
        <>
            <OpenDrawer
                open={open}
                title={isEditing ? "Edit vehicle" : "Add vehicle"}
                titleIcon={<CarTaxiFront />}
                width={620}
                className="user-form-drawer device-form-drawer vehicle-form-drawer"
                onClose={onClose}
                footer={
                    <>
                        <CustomBtn
                            type="cancel"
                            label="Cancel"
                            onClick={onClose}
                            size="medium"
                        />
                        <CustomBtn
                            type="submit"
                            label={isEditing ? "Save changes" : "Save vehicle"}
                            form="vehicle-form"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                            loading={formik.isSubmitting}
                            size="medium"
                        />
                    </>
                }
            >
                <form
                    id="vehicle-form"
                    className="user-form device-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="device-form-fields">
                        <Field label="Vehicle code" required {...fieldProps("vehicleCode")}>
                            <Input
                                autoFocus
                                appearance="outline"
                                size="large"
                                value={formik.values.vehicleCode}
                                placeholder="VEH-004"
                                onChange={(_, data) => formik.setFieldValue("vehicleCode", data.value)}
                                onBlur={() => formik.setFieldTouched("vehicleCode", true)}
                            />
                        </Field>
                        <Field label="Vehicle name" required {...fieldProps("name")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.name}
                                placeholder="Patrol SUV"
                                onChange={(_, data) => formik.setFieldValue("name", data.value)}
                                onBlur={() => formik.setFieldTouched("name", true)}
                            />
                        </Field>
                        <Field label="License plate" required {...fieldProps("licensePlate")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.licensePlate}
                                placeholder="2A-1234"
                                onChange={(_, data) => formik.setFieldValue("licensePlate", data.value)}
                                onBlur={() => formik.setFieldTouched("licensePlate", true)}
                            />
                        </Field>
                        <Field label="Vehicle type" {...fieldProps("vehicleType")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.vehicleType}
                                placeholder="SUV, pickup, van..."
                                onChange={(_, data) => formik.setFieldValue("vehicleType", data.value)}
                                onBlur={() => formik.setFieldTouched("vehicleType", true)}
                            />
                        </Field>
                        <Field label="Province" {...fieldProps("province")}>
                            <Dropdown
                                aria-label="Province"
                                appearance="outline"
                                size="large"
                                value={formik.values.province}
                                selectedOptions={formik.values.province ? [formik.values.province] : []}
                                placeholder="Select a province"
                                onOptionSelect={(_, data) => {
                                    formik.setFieldValue("province", data.optionValue ?? "");
                                }}
                                onBlur={() => formik.setFieldTouched("province", true)}
                            >
                                {CAMBODIA_PROVINCES.map((province) => (
                                    <Option
                                        key={province.code}
                                        value={province.name}
                                        text={`${province.name} (${province.nameKh})`}
                                    >
                                        {province.name} ({province.nameKh})
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Status" required {...fieldProps("status")}>
                            <Dropdown
                                aria-label="Vehicle status"
                                appearance="outline"
                                size="large"
                                value={formik.values.status}
                                selectedOptions={[formik.values.status]}
                                onOptionSelect={(_, data) => {
                                    if (data.optionValue) {
                                        formik.setFieldValue("status", data.optionValue);
                                    }
                                }}
                                onBlur={() => formik.setFieldTouched("status", true)}
                            >
                                {statuses.map((status) => (
                                    <Option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                    </div>
                </form>
            </OpenDrawer>
            <ConfirmCreateDialog
                open={confirmCreateOpen}
                title="vehicle"
                name={pendingVehicle?.name}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="vehicle"
                name={pendingVehicle?.name}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
        </>
    );
};

export default CreateVehiclePage;