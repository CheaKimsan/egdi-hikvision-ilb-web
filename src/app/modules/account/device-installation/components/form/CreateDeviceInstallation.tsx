import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Timestamp } from "firebase/firestore";
import { Checkbox, Dropdown, Field, Input, Option } from "@fluentui/react-components";
import { MonitorPc } from "lucide-react";
import type { IDevice } from "../../../device-management/core/model";
import type { IVehicle } from "../../../vehicle/core/model";
import type { IInstallation } from "../../core/model";
import type { InstallationDrawerMode } from "../../core/store";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/message/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/message/ConfirmEditDialog";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import type { InputProps } from "@fluentui/react-components";

type FormValues = {
    deviceKey: string;
    vehicleKey: string;
    label: string;
    position: string;
    parentDeviceKey: string;
    ip: string;
    username: string;
    httpPort: string;
    sdkPort: string;
    hasPassword: boolean;
    installedAt: string;
    removedAt: string;
    notes: string;
};

type Props = {
    open: boolean;
    mode: InstallationDrawerMode;
    installation: IInstallation | null;
    installations: IInstallation[];
    devices: IDevice[];
    vehicles: IVehicle[];
    onClose: () => void;
    onSave: (installation: IInstallation) => Promise<void>;
};

const IPV4 = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

const toLocalInput = (ts?: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (value: string) => Timestamp.fromDate(new Date(value));
const nowInput = () => toLocalInput(Timestamp.now());

const emptyValues = (): FormValues => ({
    deviceKey: "", vehicleKey: "", label: "", position: "", parentDeviceKey: "",
    ip: "", username: "", httpPort: "80", sdkPort: "8000", hasPassword: false,
    installedAt: nowInput(), removedAt: "", notes: "",
});

const portRule = Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Enter a valid port")
    .integer("Port must be a whole number")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535")
    .notRequired();

const CreateDeviceInstallation: React.FC<Props> = ({
    open, mode, installation, installations, devices, vehicles, onClose, onSave,
}) => {
    const isEditing = mode === "edit";

    const [pending, setPending] = useState<IInstallation | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<FormValues>(
        () =>
            installation
                ? {
                    deviceKey: installation.deviceKey,
                    vehicleKey: installation.vehicleKey,
                    label: installation.label,
                    position: installation.position,
                    parentDeviceKey: installation.parentDeviceKey ?? "",
                    ip: installation.ip ?? "",
                    username: installation.username ?? "",
                    httpPort: installation.httpPort ? String(installation.httpPort) : "",
                    sdkPort: installation.sdkPort ? String(installation.sdkPort) : "",
                    hasPassword: installation.hasPassword,
                    installedAt: toLocalInput(installation.installedAt),
                    removedAt: toLocalInput(installation.removedAt),
                    notes: installation.notes ?? "",
                }
                : emptyValues(),
        [installation],
    );

    // Other installations that are still active (not removed)
    const activeOthers = useMemo(
        () => installations.filter((i) => i.key !== installation?.key && !i.removedAt),
        [installations, installation?.key],
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                deviceKey: Yup.string()
                    .required("Device is required")
                    .oneOf(devices.map((d) => d.key), "Select a valid device")
                    .test(
                        "device-available",
                        "This device already has an active installation",
                        (value, ctx) =>
                            !!ctx.parent.removedAt || !activeOthers.some((i) => i.deviceKey === value),
                    ),
                vehicleKey: Yup.string()
                    .required("Vehicle is required")
                    .oneOf(vehicles.map((v) => v.key), "Select a valid vehicle"),
                label: Yup.string().trim().required("Installation label is required").max(100),
                position: Yup.string().trim().required("Position is required").max(100),
                parentDeviceKey: Yup.string().test(
                    "lightbar-parent",
                    "Select an MVR installed on this vehicle",
                    (value, ctx) => {
                        const device = devices.find((d) => d.key === ctx.parent.deviceKey);
                        if (device?.type !== "lightbar") return true;
                        const parent = devices.find((d) => d.key === value);
                        return (
                            parent?.type === "mvr" &&
                            activeOthers.some(
                                (i) =>
                                    i.deviceKey === value &&
                                    i.vehicleKey === ctx.parent.vehicleKey,
                            )
                        );
                    },
                ),
                ip: Yup.string()
                    .trim()
                    .test("ipv4", "Enter a valid IPv4 address", (v) => !v || IPV4.test(v))
                    .test(
                        "unique-ip",
                        "This IP is used by another active installation",
                        (v, ctx) =>
                            !v ||
                            !!ctx.parent.removedAt ||
                            !activeOthers.some((i) => i.ip === v),
                    ),
                username: Yup.string().max(100, "Username must be 100 characters or fewer"),
                httpPort: portRule,
                sdkPort: portRule,
                hasPassword: Yup.boolean().required(),
                installedAt: Yup.string()
                    .required("Installation date is required")
                    .test("valid", "Enter a valid date and time", (v) => !v || !Number.isNaN(new Date(v).getTime())),
                removedAt: Yup.string()
                    .test("valid", "Enter a valid date and time", (v) => !v || !Number.isNaN(new Date(v).getTime()))
                    .test(
                        "after-installed",
                        "Removed at must be after installed at",
                        (v, ctx) =>
                            !v || !ctx.parent.installedAt ||
                            new Date(v).getTime() > new Date(ctx.parent.installedAt).getTime(),
                    ),
                notes: Yup.string().max(500, "Notes must be 500 characters or fewer"),
            }),
        [devices, vehicles, activeOthers],
    );

    const formik = useFormik<FormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const device = devices.find((d) => d.key === values.deviceKey);
            const next: IInstallation = {
                key: installation?.key ?? "",
                deviceKey: values.deviceKey,
                vehicleKey: values.vehicleKey,
                label: values.label.trim(),
                position: values.position.trim(),
                parentDeviceKey: device?.type === "lightbar" ? values.parentDeviceKey : "",
                ip: values.ip.trim(),
                username: values.username.trim(),
                httpPort: values.httpPort ? Number(values.httpPort) : null,
                sdkPort: values.sdkPort ? Number(values.sdkPort) : null,
                hasPassword: values.hasPassword,
                online: installation?.online ?? false,
                lastSeen: installation?.lastSeen ?? null,
                installedAt: fromLocalInput(values.installedAt),
                removedAt: values.removedAt ? fromLocalInput(values.removedAt) : null,
                notes: values.notes.trim(),
                createdAt: installation?.createdAt,
                updatedAt: installation?.updatedAt,
                createdBy: installation?.createdBy,
                updatedBy: installation?.updatedBy,
            };
            setPending(next);
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
        setPending(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = async () => {
        if (!pending) return;
        try {
            await onSave(pending);
            closeConfirmation();
            onClose();
        } catch (error) {
            console.error("Save installation failed", error); // swap for your toast component
            closeConfirmation();
        }
    };

    const fieldProps = (field: keyof FormValues) => {
        const error = formik.errors[field];
        const message = typeof error === "string" ? error : undefined;
        return {
            validationState:
                formik.touched[field] && error ? ("error" as const) : ("none" as const),
            validationMessage: formik.touched[field] ? message : undefined,
        };
    };

    const selectedDevice = devices.find((d) => d.key === formik.values.deviceKey);
    const selectedVehicle = vehicles.find((v) => v.key === formik.values.vehicleKey);
    const usedDeviceKeys = new Set(activeOthers.map((i) => i.deviceKey));

    // MVRs that are installed (and not removed) on the selected vehicle
    const parentOptions = useMemo(
        () =>
            devices.filter(
                (d) =>
                    d.type === "mvr" &&
                    activeOthers.some(
                        (i) => i.deviceKey === d.key && i.vehicleKey === formik.values.vehicleKey,
                    ),
            ),
        [devices, activeOthers, formik.values.vehicleKey],
    );

    const textField = (
        name: Exclude<keyof FormValues, "hasPassword" | "deviceKey" | "vehicleKey" | "parentDeviceKey">,
        label: string,
        options: {
            required?: boolean;
            placeholder?: string;
            type?: "text" | "number" | "datetime-local";
        } = {},
    ) => (
        <Field label={label} required={options.required} {...fieldProps(name)}>
            <Input
                type={options.type ?? "text"}
                appearance="outline"
                size="large"
                value={formik.values[name]}
                placeholder={options.placeholder}
                onChange={(_, data) => formik.setFieldValue(name, data.value)}
                onBlur={() => formik.setFieldTouched(name, true)}
            />
        </Field>
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
                        <CustomBtn type="cancel" label="Cancel" onClick={onClose} size="medium" />
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
                        <Field label="Device" required {...fieldProps("deviceKey")}>
                            <Dropdown
                                aria-label="Device"
                                appearance="outline"
                                size="large"
                                value={selectedDevice ? `${selectedDevice.deviceCode} · ${selectedDevice.name}` : ""}
                                selectedOptions={formik.values.deviceKey ? [formik.values.deviceKey] : []}
                                placeholder="Select a device"
                                onOptionSelect={(_, data) => {
                                    const device = devices.find((d) => d.key === data.optionValue);
                                    if (!device) return;
                                    formik.setValues((current) => ({
                                        ...current,
                                        deviceKey: device.key,
                                        parentDeviceKey: device.type === "lightbar" ? current.parentDeviceKey : "",
                                    }));
                                    formik.setFieldTouched("deviceKey", true);
                                }}
                                onBlur={() => formik.setFieldTouched("deviceKey", true)}
                            >
                                {devices.map((d) => (
                                    <Option
                                        key={d.key}
                                        value={d.key}
                                        text={`${d.deviceCode} · ${d.name}`}
                                        disabled={usedDeviceKeys.has(d.key)}
                                    >
                                        {d.deviceCode} · {d.name} ({d.type.toUpperCase()})
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field label="Vehicle" required {...fieldProps("vehicleKey")}>
                            <Dropdown
                                aria-label="Vehicle"
                                appearance="outline"
                                size="large"
                                value={selectedVehicle ? `${selectedVehicle.vehicleCode} · ${selectedVehicle.name}` : ""}
                                selectedOptions={formik.values.vehicleKey ? [formik.values.vehicleKey] : []}
                                placeholder="Select a vehicle"
                                onOptionSelect={(_, data) => {
                                    formik.setValues((current) => ({
                                        ...current,
                                        vehicleKey: data.optionValue ?? "",
                                        parentDeviceKey: "", // parent depends on the vehicle
                                    }));
                                }}
                                onBlur={() => formik.setFieldTouched("vehicleKey", true)}
                            >
                                {vehicles.map((v) => (
                                    <Option key={v.key} value={v.key} text={`${v.vehicleCode} · ${v.name}`}>
                                        {v.vehicleCode} · {v.name}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        {textField("label", "Installation label", { required: true, placeholder: "Patrol MVR 01" })}
                        {textField("position", "Position", { required: true, placeholder: "Under front seat" })}

                        {selectedDevice?.type === "lightbar" && (
                            <Field label="Parent MVR" required {...fieldProps("parentDeviceKey")}>
                                <Dropdown
                                    aria-label="Parent MVR"
                                    appearance="outline"
                                    size="large"
                                    value={devices.find((d) => d.key === formik.values.parentDeviceKey)?.name ?? ""}
                                    selectedOptions={formik.values.parentDeviceKey ? [formik.values.parentDeviceKey] : []}
                                    placeholder={
                                        formik.values.vehicleKey
                                            ? parentOptions.length ? "Select parent MVR" : "No MVR on this vehicle"
                                            : "Select a vehicle first"
                                    }
                                    disabled={!formik.values.vehicleKey}
                                    onOptionSelect={(_, data) =>
                                        formik.setFieldValue("parentDeviceKey", data.optionValue ?? "")
                                    }
                                    onBlur={() => formik.setFieldTouched("parentDeviceKey", true)}
                                >
                                    {parentOptions.map((d) => (
                                        <Option key={d.key} value={d.key} text={`${d.deviceCode} · ${d.name}`}>
                                            {d.deviceCode} · {d.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            </Field>
                        )}

                        {textField("ip", "IP address", { placeholder: "192.168.1.100" })}
                        {textField("username", "Username", { placeholder: "Administrator" })}
                        {textField("httpPort", "HTTP port", { type: "number", placeholder: "80" })}
                        {textField("sdkPort", "SDK port", { type: "number", placeholder: "8000" })}
                        {textField("installedAt", "Installed at", { required: true, type: "datetime-local" })}
                        {textField("removedAt", "Removed at", { type: "datetime-local" })}

                        <div className="device-installation-form-checkbox">
                            <Checkbox
                                checked={formik.values.hasPassword}
                                label="Device password is configured"
                                onChange={(_, data) => formik.setFieldValue("hasPassword", data.checked === true)}
                            />
                        </div>

                        <Field className="device-installation-notes" label="Notes" {...fieldProps("notes")}>
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
                name={pending?.label}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="device installation"
                name={pending?.label}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
        </>
    );
};

export default CreateDeviceInstallation;