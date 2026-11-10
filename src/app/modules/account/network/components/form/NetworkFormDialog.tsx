import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Field, Input } from "@fluentui/react-components";
import { NetworkCheckRegular } from "@fluentui/react-icons";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/alert/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/alert/ConfirmEditDialog";
import type { NetworkConfiguration } from "../../core/model";

type NetworkFormValues = {
    ipAddress: string;
    httpPort: string;
    username: string;
    password: string;
};

type Props = {
    open: boolean;
    configuration: NetworkConfiguration | null;
    configurations: NetworkConfiguration[];
    onClose: () => void;
    onSave: (configuration: NetworkConfiguration) => void;
};

const emptyValues: NetworkFormValues = {
    ipAddress: "",
    httpPort: "80",
    username: "",
    password: "",
};

const isValidIpv4 = (value: string) =>
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(value);

const NetworkFormDialog: React.FC<Props> = ({
    open,
    configuration,
    configurations,
    onClose,
    onSave,
}) => {
    const isEditing = configuration !== null;
    const [pendingConfiguration, setPendingConfiguration] =
        useState<NetworkConfiguration | null>(null);
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);

    const initialValues = useMemo<NetworkFormValues>(
        () =>
            configuration
                ? {
                    ipAddress: configuration.ipAddress,
                    httpPort: String(configuration.httpPort),
                    username: configuration.username,
                    password: configuration.password,
                }
                : emptyValues,
        [configuration],
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                ipAddress: Yup.string()
                    .trim()
                    .required("IP address is required")
                    .test("ipv4", "Enter a valid IPv4 address", (value) =>
                        value ? isValidIpv4(value.trim()) : false,
                    )
                    .test(
                        "unique-address",
                        "A configuration already exists for this IP address and port",
                        (value, context) =>
                            !configurations.some(
                                (item) =>
                                    item.id !== configuration?.id &&
                                    item.ipAddress === value?.trim() &&
                                    item.httpPort === Number(context.parent.httpPort),
                            ),
                    ),
                httpPort: Yup.number()
                    .typeError("Enter a valid HTTP port")
                    .integer("Port must be a whole number")
                    .min(1, "Port must be between 1 and 65535")
                    .max(65535, "Port must be between 1 and 65535")
                    .required("HTTP port is required"),
                username: Yup.string().max(100, "Username must be 100 characters or fewer"),
                password: Yup.string().max(256, "Password must be 256 characters or fewer"),
            }),
        [configuration?.id, configurations],
    );

    const formik = useFormik<NetworkFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const nextConfiguration: NetworkConfiguration = {
                id: configuration?.id ?? `network-${Date.now()}`,
                ipAddress: values.ipAddress.trim(),
                httpPort: Number(values.httpPort),
                username: values.username.trim(),
                password: values.password,
                updatedAt: new Date().toISOString(),
            };
            setPendingConfiguration(nextConfiguration);
            if (isEditing) setConfirmEditOpen(true);
            else setConfirmCreateOpen(true);
            setSubmitting(false);
        },
    });

    useEffect(() => {
        if (open) formik.resetForm({ values: initialValues });
    }, [open, initialValues, formik.resetForm]);

    const closeConfirmation = () => {
        setPendingConfiguration(null);
        setConfirmCreateOpen(false);
        setConfirmEditOpen(false);
    };

    const confirmSave = () => {
        if (!pendingConfiguration) return;
        onSave(pendingConfiguration);
        closeConfirmation();
        onClose();
    };

    const fieldProps = (field: keyof NetworkFormValues) => ({
        validationState:
            formik.touched[field] && formik.errors[field] ? "error" as const : "none" as const,
        validationMessage: formik.touched[field] ? formik.errors[field] : undefined,
    });

    return (
        <>
            <OpenDrawer
                open={open}
                title={isEditing ? "Edit network settings" : "Add network settings"}
                titleIcon={<NetworkCheckRegular />}
                width={620}
                className="user-form-drawer device-form-drawer network-form-drawer"
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
                            label={isEditing ? "Save changes" : "Save network"}
                            form="network-configuration-form"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                            loading={formik.isSubmitting}
                            size="medium"
                        />
                    </>
                }
            >
                <form
                    id="network-configuration-form"
                    className="user-form device-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="device-form-fields">
                    <Field label="IP address" required {...fieldProps("ipAddress")}>
                        <Input
                            autoFocus
                            appearance="outline"
                            size="large"
                            value={formik.values.ipAddress}
                            placeholder="192.168.1.100"
                            onChange={(_, data) =>
                                formik.setFieldValue("ipAddress", data.value)
                            }
                            onBlur={() => formik.setFieldTouched("ipAddress", true)}
                        />
                    </Field>
                    <Field label="HTTP port" required {...fieldProps("httpPort")}>
                        <Input
                            type="number"
                            min={1}
                            max={65535}
                            step={1}
                            appearance="outline"
                            size="large"
                            value={formik.values.httpPort}
                            placeholder="80"
                            onChange={(_, data) =>
                                formik.setFieldValue("httpPort", data.value)
                            }
                            onBlur={() => formik.setFieldTouched("httpPort", true)}
                        />
                    </Field>
                    <Field label="Username" {...fieldProps("username")}>
                        <Input
                            autoComplete="username"
                            appearance="outline"
                            size="large"
                            value={formik.values.username}
                            placeholder="Administrator"
                            onChange={(_, data) =>
                                formik.setFieldValue("username", data.value)
                            }
                            onBlur={() => formik.setFieldTouched("username", true)}
                        />
                    </Field>
                    <Field label="Password" {...fieldProps("password")}>
                        <Input
                            type="password"
                            autoComplete={isEditing ? "current-password" : "new-password"}
                            appearance="outline"
                            size="large"
                            value={formik.values.password}
                            placeholder="Enter password"
                            onChange={(_, data) =>
                                formik.setFieldValue("password", data.value)
                            }
                            onBlur={() => formik.setFieldTouched("password", true)}
                        />
                    </Field>
                    </div>
                </form>
            </OpenDrawer>
            <ConfirmCreateDialog
                open={confirmCreateOpen}
                title="network configuration"
                name={pendingConfiguration?.ipAddress}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="network configuration"
                name={pendingConfiguration?.ipAddress}
                onConfirm={confirmSave}
                onCancel={closeConfirmation}
            />
        </>
    );
};

export default NetworkFormDialog;
