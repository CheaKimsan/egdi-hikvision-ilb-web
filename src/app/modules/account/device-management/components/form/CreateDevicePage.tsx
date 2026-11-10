import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown, Field, Input, Option } from "@fluentui/react-components";
import { ServerRegular } from "@fluentui/react-icons";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/alert/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/alert/ConfirmEditDialog";
import type { ManagedDevice } from "../../core/model";

const deviceTypes: ManagedDevice["type"][] = [
    "mvr",
    "camera",
    "lightbar",
];

type DeviceFormValues = {
    name: string;
    type: ManagedDevice["type"];
    model: string;
    serialNo: string;
    siteId: string;
    siteName: string;
    firmware: string;
    ip: string;
    httpPort: string;
    sdkPort: string;
    username: string;
    hasPassword: boolean;
};

type CreateDevicePageProps = {
    open: boolean;
    device?: ManagedDevice | null;
    devices: ManagedDevice[];
    onClose: () => void;
    onSave: (device: ManagedDevice) => void;
};

const emptyValues: DeviceFormValues = {
    name: "",
    type: "camera",
    model: "",
    serialNo: "",
    siteId: "",
    siteName: "",
    firmware: "",
    ip: "",
    httpPort: "80",
    sdkPort: "8000",
    username: "Administrator",
    hasPassword: false,
};

const toFormValues = (
    device: ManagedDevice | null | undefined,
): DeviceFormValues =>
    device
        ? {
            name: device.name,
            type: device.type,
            model: device.model,
            serialNo: device.serialNo ?? "",
            siteId: device.siteId,
            siteName: device.siteName,
            firmware: device.firmware ?? "",
            ip: device.ip ?? "",
            httpPort: String(device.httpPort),
            sdkPort: String(device.sdkPort),
            username: device.username,
            hasPassword: device.hasPassword,
        }
        : emptyValues;

const CreateDevicePage: React.FC<CreateDevicePageProps> = ({
    open,
    device,
    devices,
    onClose,
    onSave,
}) => {
    const isEditing = Boolean(device);
    const [pendingDevice, setPendingDevice] = useState<ManagedDevice | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);
    const initialValues = useMemo(() => toFormValues(device), [device]);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                name: Yup.string()
                    .trim()
                    .max(100, "Device name must be 100 characters or fewer")
                    .required("Device name is required"),
                type: Yup.string()
                    .oneOf(deviceTypes, "Select a valid device type")
                    .required("Device type is required"),
                model: Yup.string()
                    .trim()
                    .max(100, "Model must be 100 characters or fewer")
                    .required("Model is required"),
                serialNo: Yup.string()
                    .trim()
                    .max(100, "Serial number must be 100 characters or fewer")
                    .test("unique-serial-number", "This serial number is already in use", (value) =>
                        !devices.some(
                            (item) =>
                                item.id !== device?.id &&
                                item.serialNo?.toLowerCase() === value?.trim().toLowerCase(),
                        ),
                    ),
                siteId: Yup.string().trim().required("Site ID is required"),
                siteName: Yup.string().trim().required("Site name is required"),
                firmware: Yup.string().max(100, "Firmware must be 100 characters or fewer"),
                httpPort: Yup.number()
                    .typeError("Enter a valid HTTP port")
                    .integer("Use a whole number")
                    .min(1, "Port must be between 1 and 65535")
                    .max(65535, "Port must be between 1 and 65535")
                    .required("HTTP port is required"),
                sdkPort: Yup.number()
                    .typeError("Enter a valid SDK port")
                    .integer("Use a whole number")
                    .min(1, "Port must be between 1 and 65535")
                    .max(65535, "Port must be between 1 and 65535")
                    .required("SDK port is required"),
                ip: Yup.string().max(100, "IP address must be 100 characters or fewer"),
                username: Yup.string().max(100, "Username must be 100 characters or fewer"),
            }),
        [device?.id, devices],
    );

    const formik = useFormik<DeviceFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const savedDevice: ManagedDevice = {
                id: device?.id ?? `device-${Date.now()}`,
                name: values.name.trim(),
                type: values.type,
                model: values.model.trim(),
                serialNo: values.serialNo.trim() || undefined,
                siteId: values.siteId.trim(),
                siteName: values.siteName.trim(),
                firmware: values.firmware.trim() || undefined,
                ip: values.ip.trim() || undefined,
                httpPort: Number(values.httpPort),
                sdkPort: Number(values.sdkPort),
                username: values.username.trim(),
                hasPassword: values.hasPassword,
                activated: device?.activated ?? false,
                online: device?.online ?? false,
                lastSeen: device?.lastSeen,
            };

            setPendingDevice(savedDevice);
            if (isEditing) {
                setConfirmEditOpen(true);
            } else {
                setConfirmCreateOpen(true);
            }
            setSubmitting(false);
        },
    });

    const closeConfirmation = () => {
        setPendingDevice(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = () => {
        if (!pendingDevice) return;
        onSave(pendingDevice);
        closeConfirmation();
        onClose();
    };

    const fieldProps = (field: keyof DeviceFormValues) => ({
        validationState: formik.touched[field] && formik.errors[field] ? "error" as const : "none" as const,
        validationMessage: formik.touched[field] ? formik.errors[field] : undefined,
    });

    const textField = (
        name: Exclude<keyof DeviceFormValues, "type" | "hasPassword">,
        label: string,
        options: { required?: boolean; numeric?: boolean; min?: number; max?: number } = {},
    ) => (
        <Field
            label={label}
            required={options.required}
            {...fieldProps(name)}
        >
            <Input
                type={options.numeric ? "number" : "text"}
                min={options.min ?? (options.numeric ? 0 : undefined)}
                max={options.max}
                step={options.numeric ? 1 : undefined}
                appearance="outline"
                size="large"
                value={formik.values[name]}
                onChange={(_, data) => formik.setFieldValue(name, data.value)}
                onBlur={() => formik.setFieldTouched(name, true)}
                placeholder={label}
            />
        </Field>
    );

    return (
        <>
            <OpenDrawer
                open={open}
                title={isEditing ? "Edit device" : "Create device"}
                titleIcon={<ServerRegular />}
                width={620}
                className="user-form-drawer device-form-drawer"
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
                            label={isEditing ? "Save changes" : "Create device"}
                            form="device-form"
                            disabled={!formik.dirty || !formik.isValid}
                            loading={formik.isSubmitting}
                            size="medium"
                        />
                    </>
                }
            >
                <form
                    id="device-form"
                    className="user-form device-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="device-form-fields">
                        <div className="device-form-full-width">
                            {textField("name", "Device name", { required: true })}
                        </div>
                        {textField("model", "Model", { required: true })}
                        <Field label="Device type" required {...fieldProps("type")}>
                            <Dropdown
                                aria-label="Device type"
                                appearance="outline"
                                size="large"
                                value={formik.values.type}
                                selectedOptions={[formik.values.type]}
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("type", data.optionValue ?? "")
                                }
                                onBlur={() => formik.setFieldTouched("type", true)}
                            >
                                {deviceTypes.map((type) => (
                                    <Option key={type} value={type}>
                                        {type.toUpperCase()}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        {textField("serialNo", "Serial number")}
                        {textField("firmware", "Firmware")}
                        {/* {textField("siteId", "Site ID", { required: true })} */}
                        {/* {textField("siteName", "Site name", { required: true })} */}
                        {/* {textField("ip", "IP address")} */}
                        {/* {textField("httpPort", "HTTP port", { required: true, numeric: true, min: 1, max: 65535 })} */}
                        {/* {textField("sdkPort", "SDK port", { required: true, numeric: true, min: 1, max: 65535 })} */}
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