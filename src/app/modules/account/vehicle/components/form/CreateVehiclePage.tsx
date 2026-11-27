import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown, Field, Input, Option } from "@fluentui/react-components";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/message/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/message/ConfirmEditDialog";
import { CAMBODIA_PROVINCES } from "../../../../../../lib/data/CambodiaProvinces";
import type { IVehicle } from "../../core/model";
import type { VehicleDrawerMode } from "../../core/store";

import { CarTaxiFront } from "lucide-react";
import { STATUS_ACTIVE, StatusOption, vehicleStatusOptions } from "../../../../../../lib/constants/Status";

type VehicleFormValues = {
    vehicleCode: string;
    name: string;
    licensePlate: string;
    vehicleType: string;
    province: string;
    status: StatusOption;
};

type Props = {
    open: boolean;
    mode: VehicleDrawerMode;
    vehicle: IVehicle | null;
    vehicles: IVehicle[];
    onClose: () => void;
    onSave: (vehicle: IVehicle) => Promise<void>;
};

const emptyValues: VehicleFormValues = {
    vehicleCode: "",
    name: "",
    licensePlate: "",
    vehicleType: "",
    province: "",
    status: STATUS_ACTIVE,
};

const titles: Record<VehicleDrawerMode, string> = {
    create: "Add vehicle",
    edit: "Edit vehicle",
    view: "Vehicle details",
};

const CreateVehiclePage: React.FC<Props> = ({
    open,
    mode,
    vehicle,
    vehicles,
    onClose,
    onSave,
}) => {
    const isEditing = mode === "edit";
    const readOnly = mode === "view";

    const [pendingVehicle, setPendingVehicle] = useState<IVehicle | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<VehicleFormValues>(
        () =>
            vehicle
                ? {
                    vehicleCode: vehicle.vehicleCode,
                    name: vehicle.name ?? "",
                    licensePlate: vehicle.licensePlate ?? "",
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
                                    item.key !== vehicle?.key &&
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
                                    item.key !== vehicle?.key &&
                                    (item.licensePlate ?? "").toLowerCase() ===
                                    value?.trim().toLowerCase(),
                            ),
                    ),
                vehicleType: Yup.string().max(50, "Vehicle type must be 50 characters or fewer"),
                province: Yup.string().oneOf(
                    ["", ...CAMBODIA_PROVINCES.map((province) => province.name)],
                    "Select a valid province",
                ),
                status: Yup.object({
                    key: Yup.number()
                        .oneOf(vehicleStatusOptions.map((s) => s.key))
                        .required(),
                    name: Yup.string().required(),
                }).required("Status is required"),
            }),
        [vehicle?.key, vehicles],
    );

    const formik = useFormik<VehicleFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            // createdAt / updatedAt are set by the service with serverTimestamp()
            const nextVehicle: IVehicle = {
                key: vehicle?.key ?? "",
                vehicleCode: values.vehicleCode.trim(),
                name: values.name.trim(),
                licensePlate: values.licensePlate.trim(),
                vehicleType: values.vehicleType.trim(),
                province: values.province.trim(),
                status: values.status,
                createdAt: vehicle?.createdAt,
                updatedAt: vehicle?.updatedAt,
                createdBy: vehicle?.createdBy,
                updatedBy: vehicle?.updatedBy,
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

    const confirmSave = async () => {
        if (!pendingVehicle) return;
        try {
            await onSave(pendingVehicle);
            closeConfirmation();
            onClose();
        } catch (error) {
            console.error("Save vehicle failed", error); // swap for your toast/message component
            closeConfirmation();
        }
    };

    // formik.errors.status is an object, so only pass strings as the message
    const fieldProps = (field: keyof VehicleFormValues) => {
        const error = formik.errors[field];
        const message =
            typeof error === "string" ? error : error ? "Invalid value" : undefined;

        return {
            validationState:
                formik.touched[field] && error ? ("error" as const) : ("none" as const),
            validationMessage: formik.touched[field] ? message : undefined,
        };
    };

    return (
        <>
            <OpenDrawer
                open={open}
                title={titles[mode]}
                titleIcon={<CarTaxiFront />}
                width={620}
                className="user-form-drawer device-form-drawer vehicle-form-drawer"
                onClose={onClose}
                footer={
                    readOnly ? (
                        <CustomBtn type="cancel" label="Close" onClick={onClose} size="medium" />
                    ) : (
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
                    )
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
                                autoFocus={!readOnly}
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
                                appearance="outline"
                                size="large"
                                value={formik.values.province}
                                selectedOptions={formik.values.province ? [formik.values.province] : []}
                                placeholder="Select a province"
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("province", data.optionValue ?? "")
                                }
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
                                disabled={readOnly}
                                appearance="outline"
                                size="large"
                                value={formik.values.status.name}
                                selectedOptions={[String(formik.values.status.key)]}
                                onOptionSelect={(_, data) => {
                                    const selected = vehicleStatusOptions.find(
                                        (s) => String(s.key) === data.optionValue,
                                    );
                                    if (selected) formik.setFieldValue("status", selected);
                                }}
                                onBlur={() => formik.setFieldTouched("status", true)}
                            >
                                {vehicleStatusOptions.map((s) => (
                                    <Option key={s.key} value={String(s.key)}>
                                        {s.name}
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