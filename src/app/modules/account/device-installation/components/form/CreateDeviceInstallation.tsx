import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Checkbox,
    Dropdown,
    Field,
    Input,
    Option,
} from "@fluentui/react-components";
import { MonitorPc } from "lucide-react";
import type { ManagedDevice } from "../../../device-management/core/model";
import type { Vehicle } from "../../../vehicle/core/model";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/alert/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/alert/ConfirmEditDialog";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import type { Installation } from "../../core/model";
import { useAuth } from "../../../../auth/AuthContext";
import { dummyUsers } from "../../../../../../lib/data/dummy";

type InstallationFormValues = {
    deviceId: string;
    vehicleCode: string;
    label: string;
    position: string;
    parentId: string;
    ip: string;
    username: string;
    httpPort: string;
    sdkPort: string;
    hasPassword: boolean;
    online: boolean;
    installedAt: string;
    installedBy: string;
    removedAt: string;
    notes: string;
};

type Props = {
    open: boolean;
    installation: Installation | null;
    installations: Installation[];
    devices: ManagedDevice[];
    vehicles: Vehicle[];
    onClose: () => void;
    onSave: (installation: Installation) => void;
};

const toLocalDateTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
};

const nowAsLocalDateTime = () => toLocalDateTime(new Date().toISOString());
const activeUsers = dummyUsers.filter((candidate) => candidate.status === "active");

const dateTimeField = Yup.string()
    .test("valid-date", "Enter a valid date and time", (value) =>
        !value || !Number.isNaN(new Date(value).getTime()),
    );

const CreateDeviceInstallation: React.FC<Props> = ({
    open,
    installation,
    installations,
    devices,
    vehicles,
    onClose,
    onSave,
}) => {
    const { user } = useAuth();
    const isEditing = installation !== null;
    const [pendingInstallation, setPendingInstallation] =
        useState<Installation | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<InstallationFormValues>(
        () =>
            installation
                ? {
                    deviceId: installation.deviceId,
                    vehicleCode: installation.vehicleCode,
                    label: installation.label,
                    position: installation.position,
                    parentId: installation.parentId ?? "",
                    ip: installation.ip ?? "",
                    username: installation.username ?? "",
                    httpPort: installation.httpPort ? String(installation.httpPort) : "",
                    sdkPort: installation.sdkPort ? String(installation.sdkPort) : "",
                    hasPassword: installation.hasPassword,
                    online: installation.online,
                    installedAt: toLocalDateTime(installation.installedAt),
                    installedBy: installation.installedBy,
                    removedAt: toLocalDateTime(installation.removedAt),
                    notes: installation.notes ?? "",
                }
                : {
                    deviceId: "",
                    vehicleCode: "",
                    label: "",
                    position: "",
                    parentId: "",
                    ip: "",
                    username: "",
                    httpPort: "",
                    sdkPort: "",
                    hasPassword: false,
                    online: false,
                    installedAt: nowAsLocalDateTime(),
                    installedBy: user?.displayName ?? user?.username ?? "",
                    removedAt: "",
                    notes: "",
                },
        [installation, user?.displayName, user?.username],
    );

    const validationSchema = useMemo(() => Yup.object({
        deviceId: Yup.string()
            .required("Device is required")
            .test("device-available", "This device already has an active installation", (value) =>
                !installations.some(
                    (item) =>
                        item.deviceId === value &&
                        item.id !== installation?.id &&
                        !item.removedAt,
                ),
            ),
        vehicleCode: Yup.string()
            .required("Vehicle is required")
            .oneOf(vehicles.map((vehicle) => vehicle.vehicleCode), "Select a valid vehicle"),
        label: Yup.string().trim().required("Installation label is required").max(100),
        position: Yup.string().trim().required("Position is required").max(100),
        parentId: Yup.string().test(
            "lightbar-parent",
            "Select an MVR as the lightbar parent",
            (value, context) => {
                const selectedDevice = devices.find(
                    (device) => device.id === context.parent.deviceId,
                );
                if (selectedDevice?.type !== "lightbar") return true;
                return devices.some((device) => device.id === value && device.type === "mvr");
            },
        ),
        ip: Yup.string().max(255, "IP address must be 255 characters or fewer"),
        username: Yup.string().max(100, "Username must be 100 characters or fewer"),
        httpPort: Yup.number()
            .transform((value, originalValue) => originalValue === "" ? undefined : value)
            .integer("Port must be a whole number")
            .min(1, "Port must be between 1 and 65535")
            .max(65535, "Port must be between 1 and 65535")
            .notRequired(),
        sdkPort: Yup.number()
            .transform((value, originalValue) => originalValue === "" ? undefined : value)
            .integer("Port must be a whole number")
            .min(1, "Port must be between 1 and 65535")
            .max(65535, "Port must be between 1 and 65535")
            .notRequired(),
        hasPassword: Yup.boolean().required(),
        online: Yup.boolean().required(),
        installedAt: dateTimeField.required("Installation date is required"),
        installedBy: Yup.string()
            .required("Installed by is required")
            .oneOf(activeUsers.map((candidate) => candidate.displayName), "Select an active user"),
        removedAt: dateTimeField,
        notes: Yup.string().max(500, "Notes must be 500 characters or fewer"),
    }), [devices, installation?.id, installations, vehicles]);

    const formik = useFormik<InstallationFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const nextInstallation: Installation = {
                id: installation?.id ?? `installation-${Date.now()}`,
                deviceId: values.deviceId,
                vehicleCode: values.vehicleCode,
                label: values.label.trim(),
                position: values.position.trim(),
                parentId: values.parentId || undefined,
                ip: values.ip.trim() || undefined,
                username: values.username.trim() || undefined,
                httpPort: values.httpPort ? Number(values.httpPort) : undefined,
                sdkPort: values.sdkPort ? Number(values.sdkPort) : undefined,
                hasPassword: values.hasPassword,
                online: values.removedAt ? false : values.online,
                lastSeen: installation?.lastSeen,
                installedAt: new Date(values.installedAt).toISOString(),
                installedBy: values.installedBy.trim(),
                removedAt: values.removedAt
                    ? new Date(values.removedAt).toISOString()
                    : undefined,
                notes: values.notes.trim() || undefined,
            };
            setPendingInstallation(nextInstallation);
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
        setPendingInstallation(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = () => {
        if (!pendingInstallation) return;
        onSave(pendingInstallation);
        closeConfirmation();
        onClose();
    };

    const fieldProps = (field: keyof InstallationFormValues) => ({
        validationState:
            formik.touched[field] && formik.errors[field]
                ? "error" as const
                : "none" as const,
        validationMessage: formik.touched[field]
            ? formik.errors[field] as string | undefined
            : undefined,
    });

    const selectedDevice = devices.find((device) => device.id === formik.values.deviceId);
    const mvrDevices = devices.filter((device) => device.type === "mvr");
    const usedDeviceIds = new Set(
        installations
            .filter((item) => item.id !== installation?.id && !item.removedAt)
            .map((item) => item.deviceId),
    );

    return (
        <>
            <OpenDrawer
                open={open}
                title={isEditing ? "Edit installation" : "Add installation"}
                titleIcon={<MonitorPc />}
                width={720}
                className="user-form-drawer device-form-drawer device-installation-form-drawer"
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
                            label={isEditing ? "Save changes" : "Save installation"}
                            form="device-installation-form"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                            loading={formik.isSubmitting}
                            size="medium"
                        />
                    </>
                }
            >
                <form
                    id="device-installation-form"
                    className="user-form device-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="device-installation-form-fields device-form-fields">
                        <Field label="Device" required {...fieldProps("deviceId")}>
                            <Dropdown
                                aria-label="Device"
                                appearance="outline"
                                size="large"
                                value={selectedDevice?.name ?? ""}
                                selectedOptions={formik.values.deviceId ? [formik.values.deviceId] : []}
                                placeholder="Select a device"
                                onOptionSelect={(_, data) => {
                                    const device = devices.find((item) => item.id === data.optionValue);
                                    if (!device) return;
                                    formik.setValues((current) => ({
                                        ...current,
                                        deviceId: device.id,
                                        parentId: device.type === "lightbar" ? current.parentId : "",
                                        ip: device.ip ?? "",
                                        username: device.username ?? "",
                                        httpPort: String(device.httpPort || 80),
                                        sdkPort: String(device.sdkPort || 8000),
                                        hasPassword: device.hasPassword,
                                    }));
                                    formik.setFieldTouched("deviceId", true);
                                }}
                                onBlur={() => formik.setFieldTouched("deviceId", true)}
                            >
                                {devices.map((device) => (
                                    <Option
                                        key={device.id}
                                        value={device.id}
                                        text={`${device.name} (${device.id})`}
                                        disabled={usedDeviceIds.has(device.id)}
                                    >
                                        {device.name} ({device.type.toUpperCase()})
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Vehicle" required {...fieldProps("vehicleCode")}>
                            <Dropdown
                                aria-label="Vehicle"
                                appearance="outline"
                                size="large"
                                value={vehicles.find(
                                    (vehicle) => vehicle.vehicleCode === formik.values.vehicleCode,
                                )?.name ?? ""}
                                selectedOptions={formik.values.vehicleCode ? [formik.values.vehicleCode] : []}
                                placeholder="Select a vehicle"
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("vehicleCode", data.optionValue ?? "")
                                }
                                onBlur={() => formik.setFieldTouched("vehicleCode", true)}
                            >
                                {vehicles.map((vehicle) => (
                                    <Option
                                        key={vehicle.id}
                                        value={vehicle.vehicleCode}
                                        text={`${vehicle.vehicleCode} ${vehicle.name}`}
                                    >
                                        {vehicle.vehicleCode} · {vehicle.name}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Installation label" required {...fieldProps("label")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.label}
                                placeholder="Patrol MVR 01"
                                onChange={(_, data) => formik.setFieldValue("label", data.value)}
                                onBlur={() => formik.setFieldTouched("label", true)}
                            />
                        </Field>
                        <Field label="Position" required {...fieldProps("position")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.position}
                                placeholder="Under front seat"
                                onChange={(_, data) => formik.setFieldValue("position", data.value)}
                                onBlur={() => formik.setFieldTouched("position", true)}
                            />
                        </Field>
                        {selectedDevice?.type === "lightbar" && (
                            <Field label="Parent MVR" required {...fieldProps("parentId")}>
                                <Dropdown
                                    aria-label="Parent MVR"
                                    appearance="outline"
                                    size="large"
                                    value={mvrDevices.find(
                                        (device) => device.id === formik.values.parentId,
                                    )?.name ?? ""}
                                    selectedOptions={formik.values.parentId ? [formik.values.parentId] : []}
                                    placeholder="Select parent MVR"
                                    onOptionSelect={(_, data) =>
                                        formik.setFieldValue("parentId", data.optionValue ?? "")
                                    }
                                    onBlur={() => formik.setFieldTouched("parentId", true)}
                                >
                                    {mvrDevices.map((device) => (
                                        <Option
                                            key={device.id}
                                            value={device.id}
                                            text={`${device.name} (${device.id})`}
                                        >
                                            {device.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            </Field>
                        )}
                        <Field label="IP address" {...fieldProps("ip")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.ip}
                                placeholder="192.168.1.100"
                                onChange={(_, data) => formik.setFieldValue("ip", data.value)}
                                onBlur={() => formik.setFieldTouched("ip", true)}
                            />
                        </Field>
                        <Field label="Username" {...fieldProps("username")}>
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.username}
                                placeholder="Administrator"
                                onChange={(_, data) => formik.setFieldValue("username", data.value)}
                                onBlur={() => formik.setFieldTouched("username", true)}
                            />
                        </Field>
                        <Field label="HTTP port" {...fieldProps("httpPort")}>
                            <Input
                                type="number"
                                min={1}
                                max={65535}
                                appearance="outline"
                                size="large"
                                value={formik.values.httpPort}
                                placeholder="80"
                                onChange={(_, data) => formik.setFieldValue("httpPort", data.value)}
                                onBlur={() => formik.setFieldTouched("httpPort", true)}
                            />
                        </Field>
                        <Field label="SDK port" {...fieldProps("sdkPort")}>
                            <Input
                                type="number"
                                min={1}
                                max={65535}
                                appearance="outline"
                                size="large"
                                value={formik.values.sdkPort}
                                placeholder="8000"
                                onChange={(_, data) => formik.setFieldValue("sdkPort", data.value)}
                                onBlur={() => formik.setFieldTouched("sdkPort", true)}
                            />
                        </Field>
                        <Field label="Installed at" required {...fieldProps("installedAt")}>
                            <Input
                                type="datetime-local"
                                appearance="outline"
                                size="large"
                                value={formik.values.installedAt}
                                onChange={(_, data) => formik.setFieldValue("installedAt", data.value)}
                                onBlur={() => formik.setFieldTouched("installedAt", true)}
                            />
                        </Field>
                        <Field label="Installed by" required {...fieldProps("installedBy")}>
                            <Dropdown
                                aria-label="Installed by"
                                appearance="outline"
                                size="large"
                                value={formik.values.installedBy}
                                selectedOptions={formik.values.installedBy ? [formik.values.installedBy] : []}
                                placeholder="Select a user"
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("installedBy", data.optionValue ?? "")
                                }
                                onBlur={() => formik.setFieldTouched("installedBy", true)}
                            >
                                {activeUsers.map((candidate) => (
                                    <Option
                                        key={candidate.id}
                                        value={candidate.displayName}
                                        text={`${candidate.displayName} (${candidate.role})`}
                                    >
                                        {candidate.displayName} ({candidate.role})
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Removed at" {...fieldProps("removedAt")}>
                            <Input
                                type="datetime-local"
                                appearance="outline"
                                size="large"
                                value={formik.values.removedAt}
                                onChange={(_, data) => formik.setFieldValue("removedAt", data.value)}
                                onBlur={() => formik.setFieldTouched("removedAt", true)}
                            />
                        </Field>
                        <Field label="Online" {...fieldProps("online")}>
                            <Dropdown
                                aria-label="Online status"
                                appearance="outline"
                                size="large"
                                value={formik.values.online ? "Online" : "Offline"}
                                selectedOptions={[String(formik.values.online)]}
                                onOptionSelect={(_, data) =>
                                    formik.setFieldValue("online", data.optionValue === "true")
                                }
                            >
                                <Option value="true">Online</Option>
                                <Option value="false">Offline</Option>
                            </Dropdown>
                        </Field>
                        <div className="device-installation-form-checkbox">
                            <Checkbox
                                checked={formik.values.hasPassword}
                                label="Device password is configured"
                                onChange={(_, data) =>
                                    formik.setFieldValue("hasPassword", data.checked === true)
                                }
                            />
                        </div>
                        <Field
                            className="device-installation-notes"
                            label="Notes"
                            {...fieldProps("notes")}
                        >
                            <Input
                                appearance="outline"
                                size="large"
                                value={formik.values.notes}
                                placeholder="Optional installation notes"
                                onChange={(_, data) => formik.setFieldValue("notes", data.value)}
                                onBlur={() => formik.setFieldTouched("notes", true)}
                            />
                        </Field>
                    </div>
                </form>
            </OpenDrawer>
            <ConfirmCreateDialog
                open={confirmCreateOpen}
                title="device installation"
                name={pendingInstallation?.label}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="device installation"
                name={pendingInstallation?.label}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
        </>
    );
};

export default CreateDeviceInstallation;