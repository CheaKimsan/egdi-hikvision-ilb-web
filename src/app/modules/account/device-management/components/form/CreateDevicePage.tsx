import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown, Field, Input, Option } from "@fluentui/react-components";
import { ServerRegular } from "@fluentui/react-icons";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/message/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/message/ConfirmEditDialog";
import type { DeviceType, IDevice } from "../../core/model";
import type { DeviceDrawerMode } from "../../core/store";

const deviceTypes: DeviceType[] = ["mvr", "camera", "lightbar"];

type DeviceFormValues = {
    deviceCode: string;
    name: string;
    type: DeviceType;
    model: string;
    serialNo: string;
    firmware: string;
};

type Props = {
    open: boolean;
    mode: DeviceDrawerMode;
    device: IDevice | null;
    devices: IDevice[];
    onClose: () => void;
    onSave: (device: IDevice) => Promise<void>;
};

const emptyValues: DeviceFormValues = {
    deviceCode: "",
    name: "",
    type: "camera",
    model: "",
    serialNo: "",
    firmware: "",
};

const titles: Record<DeviceDrawerMode, string> = {
    create: "Create device",
    edit: "Edit device",
    view: "Device details",
};

const CreateDevicePage: React.FC<Props> = ({
    open,
    mode,
    device,
    devices,
    onClose,
    onSave,
}) => {
    const isEditing = mode === "edit";
    const readOnly = mode === "view";

    const [pendingDevice, setPendingDevice] = useState<IDevice | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<DeviceFormValues>(
        () =>
            device
                ? {
                    deviceCode: device.deviceCode ?? "",
                    name: device.name ?? "",
                    type: device.type,
                    model: device.model ?? "",
                    serialNo: device.serialNo ?? "",
                    firmware: device.firmware ?? "",
                }
                : emptyValues,
        [device],
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                deviceCode: Yup.string()
                    .trim()
                    .required("Device code is required")
                    .max(30, "Device code must be 30 characters or fewer")
                    .test(
                        "unique-code",
                        "Device code already exists",
                        (value) =>
                            !devices.some(
                                (item) =>
                                    item.key !== device?.key &&
                                    (item.deviceCode ?? "").toLowerCase() ===
                                    value?.trim().toLowerCase(),
                            ),
                    ),
                name: Yup.string()
                    .trim()
                    .required("Device name is required")
                    .max(100, "Device name must be 100 characters or fewer"),
                type: Yup.string()
                    .oneOf(deviceTypes, "Select a valid device type")
                    .required("Device type is required"),
                model: Yup.string()
                    .trim()
                    .required("Model is required")
                    .max(100, "Model must be 100 characters or fewer"),
                serialNo: Yup.string()
                    .trim()
                    .max(100, "Serial number must be 100 characters or fewer")
                    .test(
                        "unique-serial-number",
                        "This serial number is already in use",
                        (value) =>
                            !value ||
                            !devices.some(
                                (item) =>
                                    item.key !== device?.key &&
                                    (item.serialNo ?? "").toLowerCase() ===
                                    value.trim().toLowerCase(),
                            ),
                    ),
                firmware: Yup.string().max(100, "Firmware must be 100 characters or fewer"),
            }),
        [device?.key, devices],
    );

    const formik = useFormik<DeviceFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            // createdAt / updatedAt are set by the service with serverTimestamp()
            const nextDevice: IDevice = {
                key: device?.key ?? "",
                deviceCode: values.deviceCode.trim(),
                name: values.name.trim(),
                type: values.type,
                model: values.model.trim(),
                serialNo: values.serialNo.trim(),
                firmware: values.firmware.trim(),
                activated: device?.activated ?? false,
                createdAt: device?.createdAt,
                updatedAt: device?.updatedAt,
                createdBy: device?.createdBy,
                updatedBy: device?.updatedBy,
            };
            setPendingDevice(nextDevice);
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
        setPendingDevice(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = async () => {
        if (!pendingDevice) return;
        try {
            await onSave(pendingDevice);
            closeConfirmation();
            onClose();
        } catch (error) {
            console.error("Save device failed", error); // swap for your toast/message component
            closeConfirmation();
        }
    };

    const fieldProps = (field: keyof DeviceFormValues) => {
        const error = formik.errors[field];
        const message = typeof error === "string" ? error : undefined;

        return {
            validationState:
                formik.touched[field] && error ? ("error" as const) : ("none" as const),
            validationMessage: formik.touched[field] ? message : undefined,
        };
    };

    const textField = (
        name: Exclude<keyof DeviceFormValues, "type">,
        label: string,
        options: { required?: boolean; placeholder?: string; autoFocus?: boolean } = {},
    ) => (
        <Field label={label} required={options.required} {...fieldProps(name)}>
            <Input
                autoFocus={options.autoFocus && !readOnly}
                disabled={readOnly}
                appearance="outline"
                size="large"
                value={formik.values[name]}
                placeholder={options.placeholder ?? label}
                onChange={(_, data) => formik.setFieldValue(name, data.value)}
                onBlur={() => formik.setFieldTouched(name, true)}
            />
        </Field>
    );

    return (
        <>
            <OpenDrawer
                open={open}
                title={titles[mode]}
                titleIcon={<ServerRegular />}
                width={620}
                className="user-form-drawer device-form-drawer"
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
                                label={isEditing ? "Save changes" : "Create device"}
                                form="device-form"
                                disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                                loading={formik.isSubmitting}
                                size="medium"
                            />
                        </>
                    )
                }
            >
                <form
                    id="device-form"
                    className="user-form device-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="device-form-fields">
                        {textField("deviceCode", "Device code", {
                            required: true,
                            placeholder: "DEV-001",
                            autoFocus: true,
                        })}
                        {textField("name", "Device name", { required: true })}
                        {textField("model", "Model", { required: true })}

                        <Field label="Device type" required {...fieldProps("type")}>
                            <Dropdown
                                aria-label="Device type"
                                disabled={readOnly}
                                appearance="outline"
                                size="large"
                                value={formik.values.type.toUpperCase()}
                                selectedOptions={[formik.values.type]}
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("type", data.optionValue ?? "camera")
                                }
                                onBlur={() => formik.setFieldTouched("type", true)}
                            >
                                {deviceTypes.map((type) => (
                                    <Option key={type} value={type} text={type.toUpperCase()}>
                                        {type.toUpperCase()}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        {textField("serialNo", "Serial number")}
                        {textField("firmware", "Firmware")}
                    </div>
                </form>
            </OpenDrawer>

            <ConfirmCreateDialog
                open={confirmCreateOpen}
                title="device"
                name={pendingDevice?.name}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="device"
                name={pendingDevice?.name}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
        </>
    );
};

export default CreateDevicePage;