import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Button,
    Dropdown,
    Field,
    Input,
    Option,
} from "@fluentui/react-components";
import { CameraRegular, DeleteRegular, PersonAddRegular } from "@fluentui/react-icons";
import NoAvatar from "../../../../../../lib/assets/images/no_avatar.jpeg";
import OpenDrawer from "../../../../../../lib/helpers/shared/drawer/OpenDrawer";
import CustomBtn from "../../../../../../lib/helpers/shared/button/CustomBtn";
import { useUsersStore, type UserDrawerMode } from "../../core/store";
import { useUsersQuery } from "../../core/query";
import { useCreateUserMutation, useUpdateUserMutation } from "../../core/action";
import { useRolesStore } from "../../../roles/core/store";
import ConfirmCreateDialog from "../../../../../../lib/helpers/shared/message/ConfirmCreateDialog";
import ConfirmEditDialog from "../../../../../../lib/helpers/shared/message/ConfirmEditDialog";
import { statusOptions } from "../../../../../../lib/constants/Status";
import { AlertToast } from "../../../../../../lib/helpers/shared/toaster/Toaster";
import { IUser } from "../../core/model";

type UserFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: number;
    avatar: string;
};
type UserFormField = Exclude<keyof UserFormValues, "avatar">;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const splitName = (displayName: string) => {
    const [firstName = "", ...lastNameParts] = displayName.trim().split(/\s+/);
    return { firstName, lastName: lastNameParts.join(" ") };
};

const CreateUserPage: React.FC = () => {
    const drawer = useUsersStore((state) => state.drawer);
    const closeDrawer = useUsersStore((state) => state.closeDrawer);
    const roles = useRolesStore((state) => state.rows);
    const userRoles = useMemo(() => roles.map((role) => role.name), [roles]);

    const { data: users = [] } = useUsersQuery();
    const createMutation = useCreateUserMutation();
    const updateMutation = useUpdateUserMutation();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarError, setAvatarError] = useState("");
    const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
    const [pendingCreateUser, setPendingCreateUser] = useState<IUser | null>(null);
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);
    const [pendingEditUser, setPendingEditUser] = useState<IUser | null>(null);

    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        intent: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", intent: "info" });

    const mode: UserDrawerMode = drawer.mode;
    const isView = mode === "view";
    const isCreate = mode === "create";
    const title = isCreate ? "Add new user" : mode === "edit" ? "Edit user" : "User details";

    const initialValues = useMemo<UserFormValues>(() => {
        const user = drawer.user;
        const fallbackName = splitName(user?.displayName ?? "");
        return {
            firstName: user?.firstName ?? fallbackName.firstName,
            lastName: user?.lastName ?? fallbackName.lastName,
            email: user?.email ?? "",
            role: user?.role ?? userRoles[0] ?? "",
            status: user?.status?.key ?? 1,
            avatar: user?.avatar ?? "",
        };
    }, [drawer.user, userRoles]);

    useEffect(() => {
        setAvatarError("");
    }, [drawer.open, drawer.user]);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                firstName: Yup.string()
                    .trim()
                    .min(2, "First name must be at least 2 characters")
                    .max(50, "First name must be 50 characters or fewer")
                    .required("First name is required"),
                lastName: Yup.string()
                    .trim()
                    .min(2, "Last name must be at least 2 characters")
                    .max(50, "Last name must be 50 characters or fewer")
                    .required("Last name is required"),
                email: Yup.string()
                    .trim()
                    .email("Enter a valid email address")
                    .max(254, "Email address is too long")
                    .required("Email address is required")
                    .test(
                        "unique-email",
                        "This email is already in use",
                        (value) =>
                            !users.some(
                                (user) =>
                                    user.uid !== drawer.user?.uid &&
                                    user.email.toLowerCase() === value?.trim().toLowerCase(),
                            ),
                    ),
                role: Yup.string()
                    .oneOf(userRoles, "Select a valid role")
                    .required("Role is required"),
            }),
        [drawer.user?.uid, users, userRoles, isCreate],
    );

    const formik = useFormik<UserFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const now = new Date().toISOString();
            const firstName = values.firstName.trim();
            const lastName = values.lastName.trim();

            const selectedStatus = statusOptions.find((option) => option.key === values.status)!;

            const data = {
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`.toUpperCase(),
                email: values.email.trim().toLowerCase(),
                role: values.role,
                status: { key: selectedStatus.key, name: selectedStatus.name },
                avatar: values.avatar,
                updatedAt: now,
            };

            if (mode === "edit" && drawer.user) {
                setPendingEditUser({ ...drawer.user, ...data });
                setConfirmEditOpen(true);
            } else if (isCreate) {
                setPendingCreateUser({
                    uid: "", // real uid is assigned in createUser (Auth uid or doc id)
                    ...data,
                    createdAt: now,
                });
                setConfirmCreateOpen(true);
            }

            setSubmitting(false);
        },
    });

    const confirmCreate = () => {
        if (!pendingCreateUser) return;
        createMutation.mutate(pendingCreateUser, {
            onSuccess: () => {
                setPendingCreateUser(null);
                setConfirmCreateOpen(false);
                closeDrawer();
                setToast({ open: true, message: "User created successfully.", intent: "success" });
            },
            onError: (error) => {
                setConfirmCreateOpen(false)
                setToast({ open: true, message: error.message, intent: "error" });
            },
        });
    };

    const cancelCreateConfirmation = () => {
        setConfirmCreateOpen(false);
        setPendingCreateUser(null);
    };

    const confirmEdit = () => {
        if (!pendingEditUser) return;
        updateMutation.mutate(pendingEditUser, {
            onSuccess: () => {
                setPendingEditUser(null);
                setConfirmEditOpen(false);
                closeDrawer();
            },
        });
    };

    const cancelEditConfirmation = () => {
        setConfirmEditOpen(false);
        setPendingEditUser(null);
    };

    const fieldProps = (field: UserFormField, reserveMessageSpace = false) => ({
        validationState:
            formik.touched[field] && formik.errors[field]
                ? ("error" as const)
                : ("none" as const),
        validationMessage: formik.touched[field]
            ? formik.errors[field] || (reserveMessageSpace ? " " : undefined)
            : reserveMessageSpace
                ? " "
                : undefined,
    });

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;

        if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
            setAvatarError("Choose a JPG, PNG, or WebP image.");
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setAvatarError("Profile photos must be 2 MB or smaller.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                setAvatarError("The selected image could not be loaded.");
                return;
            }

            formik.setFieldValue("avatar", reader.result);
            setAvatarError("");
        };
        reader.onerror = () => {
            setAvatarError("The selected image could not be loaded. Please try again.");
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <OpenDrawer
                open={drawer.open}
                title={title}
                titleIcon={isCreate ? <PersonAddRegular /> : undefined}
                width={480}
                className="user-form-drawer"
                onClose={closeDrawer}
                footer={
                    <>
                        {!isView && (
                            <CustomBtn
                                type="cancel"
                                label="Cancel"
                                onClick={closeDrawer}
                                size="medium"
                            />
                        )}
                        {isView ? (
                            <CustomBtn
                                type="close"
                                label="Done"
                                onClick={closeDrawer}
                                size="medium"
                            />
                        ) : (
                            <CustomBtn
                                type="submit"
                                label={mode === "edit" ? "Save changes" : "Create user"}
                                form="user-form"
                                disabled={!formik.dirty || !formik.isValid || createMutation.isPending || updateMutation.isPending}
                                loading={formik.isSubmitting}
                                size="medium"
                            />
                        )}
                    </>
                }
            >
                <form
                    id="user-form"
                    className="user-form"
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <div className="user-form-fields">
                        <Field
                            label="Profile photo"
                            className="user-form-photo-field"
                            validationState={avatarError ? "error" : "none"}
                            validationMessage={avatarError || undefined}
                        >
                            <div className={`user-form-photo-uploader${formik.values.avatar ? " has-photo" : ""}`}>
                                <input
                                    ref={avatarInputRef}
                                    className="user-form-photo-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    aria-label="Upload profile photo"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    type="button"
                                    appearance="subtle"
                                    className="user-form-photo-upload"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isView}
                                    aria-label={formik.values.avatar ? "Change profile photo" : "Add a profile photo"}
                                >
                                    {formik.values.avatar ? (
                                        <img
                                            className="user-form-photo-image"
                                            src={formik.values.avatar}
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            className="user-form-photo-image user-form-photo-fallback"
                                            src={NoAvatar}
                                            alt=""
                                        />
                                    )}
                                </Button>
                                {!isView && (
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        size="small"
                                        icon={<CameraRegular />}
                                        aria-label={formik.values.avatar ? "Change profile photo" : "Upload profile photo"}
                                        title={formik.values.avatar ? "Change photo" : "Upload photo"}
                                        className="user-form-photo-camera-button"
                                        onClick={() => avatarInputRef.current?.click()}
                                    />
                                )}
                                {formik.values.avatar && !isView && (
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        size="small"
                                        icon={<DeleteRegular />}
                                        aria-label="Remove profile photo"
                                        title="Remove photo"
                                        className="user-form-photo-remove"
                                        onClick={() => {
                                            formik.setFieldValue("avatar", "");
                                            setAvatarError("");
                                        }}
                                    />
                                )}
                            </div>
                            {!avatarError && (
                                <span className="user-form-photo-help">
                                    JPG, PNG, or WebP. Maximum file size: 2 MB.
                                </span>
                            )}
                        </Field>

                        <Field
                            label="First name"
                            required
                            className="user-form-paired-field"
                            {...fieldProps("firstName", true)}
                        >
                            <Input
                                autoFocus
                                name="firstName"
                                autoComplete="given-name"
                                appearance="outline"
                                size="large"
                                value={formik.values.firstName}
                                onChange={(_, data) => formik.setFieldValue("firstName", data.value)}
                                onBlur={() => formik.setFieldTouched("firstName", true)}
                                disabled={isView}
                                placeholder="First name"
                            />
                        </Field>

                        <Field
                            label="Last name"
                            required
                            className="user-form-paired-field"
                            {...fieldProps("lastName", true)}
                        >
                            <Input
                                name="lastName"
                                autoComplete="family-name"
                                appearance="outline"
                                size="large"
                                value={formik.values.lastName}
                                onChange={(_, data) => formik.setFieldValue("lastName", data.value)}
                                onBlur={() => formik.setFieldTouched("lastName", true)}
                                disabled={isView}
                                placeholder="Last name"
                            />
                        </Field>

                        <Field
                            label="Role"
                            required
                            className="user-form-paired-field"
                            {...fieldProps("role", true)}
                        >
                            <Dropdown
                                aria-label="Role"
                                appearance="outline"
                                size="large"
                                value={formik.values.role}
                                selectedOptions={formik.values.role ? [formik.values.role] : []}
                                onOptionSelect={(_, data) => {
                                    formik.setFieldValue("role", data.optionValue ?? "");
                                    formik.setFieldTouched("role", true);
                                }}
                                onBlur={() => formik.setFieldTouched("role", true)}
                                disabled={isView}
                            >
                                {userRoles.map((role) => (
                                    <Option key={role} value={role}>
                                        {role}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field
                            label="Status"
                            required
                            className="user-form-paired-field"
                            {...fieldProps("status", true)}
                        >
                            <Dropdown
                                aria-label="Status"
                                appearance="outline"
                                size="large"
                                value={
                                    statusOptions.find((option) => option.key === formik.values.status)?.name ?? ""
                                }
                                selectedOptions={[String(formik.values.status)]}
                                onOptionSelect={(_, data) => {
                                    formik.setFieldValue("status", Number(data.optionValue));
                                    formik.setFieldTouched("status", true);
                                }}
                                onBlur={() => formik.setFieldTouched("status", true)}
                                disabled={isView}
                            >
                                {statusOptions.map((option) => (
                                    <Option key={option.key} value={String(option.key)}>
                                        {option.name}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field
                            label="Email address"
                            required
                            className="user-form-email-field"
                            {...fieldProps("email")}
                        >
                            <Input
                                type="email"
                                name="email"
                                autoComplete="email"
                                appearance="outline"
                                size="large"
                                value={formik.values.email}
                                onChange={(_, data) => formik.setFieldValue("email", data.value)}
                                onBlur={() => formik.setFieldTouched("email", true)}
                                disabled={isView}
                                placeholder="name@immigration.gov.com"
                            />
                        </Field>


                    </div>
                </form>
            </OpenDrawer>
            <ConfirmCreateDialog
                open={confirmCreateOpen}
                title="user"
                name={pendingCreateUser?.displayName}
                onConfirm={confirmCreate}
                onCancel={cancelCreateConfirmation}
                loading={createMutation.isPending}
            />
            <ConfirmEditDialog
                open={confirmEditOpen}
                title="user"
                name={pendingEditUser?.displayName}
                onConfirm={confirmEdit}
                onCancel={cancelEditConfirmation}
            />

            <AlertToast
                open={toast.open}
                message={toast.message}
                intent={toast.intent}
            />
        </>
    );
};

export default CreateUserPage;