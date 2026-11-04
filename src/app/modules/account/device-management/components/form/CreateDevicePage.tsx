import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown, Field, Input, Option } from "@fluentui/react-components";
import { ServerRegular } from "@fluentui/react-icons";
import OpenDrawer from "../../../../../../_egdi_ilb/helpers/shared/drawer/OpenDrawer";
import CustomBtn from "../../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import ConfirmCreateDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmEditDialog";
import type { ManagedDevice } from "../../core/model";

const deviceTypes: ManagedDevice["type"][] = [
    "Camera",
    "NVR",
    "Access Control",
    "Terminal Server",
];

type DeviceFormValues = {
    name: string;
    type: ManagedDevice["type"];
    model: string;
    serialNumber: string;
    firmwareVersion: string;
    encodingVersion: string;
    webVersion: string;
    pluginVersion: string;
    channelCount: string;
    hddCount: string;
    alarmInputCount: string;
    alarmOutputCount: string;
    ipAddress: string;
    location: string;
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
    type: "Camera",
    model: "",
    serialNumber: "",
    firmwareVersion: "",
    encodingVersion: "",
    webVersion: "",
    pluginVersion: "",
    channelCount: "0",
    hddCount: "0",
    alarmInputCount: "0",
    alarmOutputCount: "0",
    ipAddress: "",
    location: "",
};

const toFormValues = (device?: ManagedDevice | null): DeviceFormValues =>
    device
        ? {
            name: device.name,
            type: device.type,
            model: device.model,
            serialNumber: device.serialNumber,
            firmwareVersion: device.firmwareVersion,
            encodingVersion: device.encodingVersion,
            webVersion: device.webVersion,
            pluginVersion: device.pluginVersion,
            channelCount: String(device.channelCount),
            hddCount: String(device.hddCount),
            alarmInputCount: String(device.alarmInputCount),
            alarmOutputCount: String(device.alarmOutputCount),
            ipAddress: device.ipAddress ?? "",
            location: device.location ?? "",
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
                serialNumber: Yup.string()
                    .trim()
                    .max(100, "Serial number must be 100 characters or fewer")
                    .required("Serial number is required")
                    .test("unique-serial-number", "This serial number is already in use", (value) =>
                        !devices.some(
                            (item) =>
                                item.id !== device?.id &&
                                item.serialNumber.toLowerCase() === value?.trim().toLowerCase(),
                        ),
                    ),
                firmwareVersion: Yup.string().max(100, "Version must be 100 characters or fewer"),
                encodingVersion: Yup.string().max(100, "Version must be 100 characters or fewer"),
                webVersion: Yup.string().max(100, "Version must be 100 characters or fewer"),
                pluginVersion: Yup.string().max(100, "Version must be 100 characters or fewer"),
                channelCount: Yup.number()
                    .typeError("Enter a valid channel count")
                    .integer("Use a whole number")
                    .min(0, "Count cannot be negative")
                    .required("Channel count is required"),
                hddCount: Yup.number()
                    .typeError("Enter a valid HDD count")
                    .integer("Use a whole number")
                    .min(0, "Count cannot be negative")
                    .required("HDD count is required"),
                alarmInputCount: Yup.number()
                    .typeError("Enter a valid alarm input count")
                    .integer("Use a whole number")
                    .min(0, "Count cannot be negative")
                    .required("Alarm input count is required"),
                alarmOutputCount: Yup.number()
                    .typeError("Enter a valid alarm output count")
                    .integer("Use a whole number")
                    .min(0, "Count cannot be negative")
                    .required("Alarm output count is required"),
                ipAddress: Yup.string().max(100, "IP address must be 100 characters or fewer"),
                location: Yup.string().max(150, "Location must be 150 characters or fewer"),
            }),
        [device?.id, devices],
    );

    const formik = useFormik<DeviceFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const now = new Date().toISOString();
            const deviceNumber = device?.deviceNumber ??
                Math.max(0, ...devices.map((item) => item.deviceNumber)) + 1;
            const savedDevice: ManagedDevice = {
                id: device?.id ?? `DEV-${String(deviceNumber).padStart(4, "0")}`,
                deviceNumber,
                name: values.name.trim(),
                type: values.type,
                model: values.model.trim(),
                serialNumber: values.serialNumber.trim(),
                firmwareVersion: values.firmwareVersion.trim(),
                encodingVersion: values.encodingVersion.trim(),
                webVersion: values.webVersion.trim(),
                pluginVersion: values.pluginVersion.trim(),
                channelCount: Number(values.channelCount),
                hddCount: Number(values.hddCount),
                alarmInputCount: Number(values.alarmInputCount),
                alarmOutputCount: Number(values.alarmOutputCount),
                ipAddress: values.ipAddress.trim() || undefined,
                location: values.location.trim() || undefined,
                status: device?.status ?? "active",
                updatedAt: now,
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
        name: Exclude<keyof DeviceFormValues, "type">,
        label: string,
        options: { required?: boolean; numeric?: boolean } = {},
    ) => (
        <Field
            label={label}
            required={options.required}
            {...fieldProps(name)}
        >
            <Input
                type={options.numeric ? "number" : "text"}
                min={options.numeric ? 0 : undefined}
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
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Dropdown>
                        </Field>
                        {textField("serialNumber", "Serial number", { required: true })}
                        {textField("firmwareVersion", "Firmware version")}
                        {textField("channelCount", "Channel count", { required: true, numeric: true })}
                        {textField("hddCount", "HDD count", { required: true, numeric: true })}
                        {textField("alarmInputCount", "Alarm input count", { required: true, numeric: true })}
                        {textField("alarmOutputCount", "Alarm output count", { required: true, numeric: true })}
                        {textField("ipAddress", "IP address")}
                        {textField("location", "Location")}
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