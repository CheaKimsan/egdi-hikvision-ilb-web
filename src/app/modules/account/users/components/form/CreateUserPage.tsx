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
import NoAvatar from "../../../../../../_egdi_ilb/assets/images/no_avatar.jpeg";
import OpenDrawer from "../../../../../../_egdi_ilb/helpers/shared/drawer/OpenDrawer";
import CustomBtn from "../../../../../../_egdi_ilb/helpers/shared/button/CustomBtn";
import { useUsersStore, type UserDrawerMode } from "../../core/store";
import type { FireUser } from "../../core/model";
import { useRolesStore } from "../../../roles/core/store";

type UserFormValues = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string;
};
type UserFormField = Exclude<keyof UserFormValues, "avatarUrl">;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const splitName = (displayName: string) => {
    const [firstName = "", ...lastNameParts] = displayName.trim().split(/\s+/);
    return { firstName, lastName: lastNameParts.join(" ") };
};

const CreateUserPage: React.FC = () => {
    const drawer = useUsersStore((state) => state.drawer);
    const rows = useUsersStore((state) => state.rows);
    const roles = useRolesStore((state) => state.rows);
    const userRoles = useMemo(() => roles.map((role) => role.name), [roles]);
    const addUser = useUsersStore((state) => state.addUser);
    const updateUser = useUsersStore((state) => state.updateUser);
    const closeDrawer = useUsersStore((state) => state.closeDrawer);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarError, setAvatarError] = useState("");

    const mode: UserDrawerMode = drawer.mode;
    const isView = mode === "view";
    const title =
        mode === "create" ? "Add new user" : mode === "edit" ? "Edit user" : "User details";

    const initialValues = useMemo<UserFormValues>(
        () => ({
            ...splitName(drawer.user?.displayName ?? ""),
            username: drawer.user?.username ?? "",
            email: drawer.user?.email ?? "",
            role: drawer.user?.role ?? userRoles[0] ?? "",
            avatarUrl: drawer.user?.avatarUrl ?? "",
        }),
        [drawer.user, userRoles],
    );

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
                username: Yup.string()
                    .trim()
                    .matches(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dots, underscores, or hyphens")
                    .min(3, "Username must be at least 3 characters")
                    .max(50, "Username must be 50 characters or fewer")
                    .required("Username is required")
                    .test(
                        "unique-username",
                        "This username is already in use",
                        (value) =>
                            !rows.some(
                                (user) =>
                                    user.id !== drawer.user?.id &&
                                    user.username.toLowerCase() === value?.trim().toLowerCase(),
                            ),
                    ),
                email: Yup.string()
                    .trim()
                    .email("Enter a valid email address")
                    .max(254, "Email address is too long")
                    .required("Email address is required"),
                role: Yup.string()
                    .oneOf(userRoles, "Select a valid role")
                    .required("Role is required"),
            }),
        [drawer.user?.id, rows, userRoles],
    );

    const formik = useFormik<UserFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const now = new Date().toISOString();
            const { firstName, lastName, ...userValues } = values;
            const savedValues = {
                ...userValues,
                displayName: `${firstName.trim()} ${lastName.trim()}`,
            };

            if (mode === "edit" && drawer.user) {
                updateUser({ ...drawer.user, ...savedValues, updatedAt: now });
            } else if (mode === "create") {
                const user: FireUser = {
                    id: String(Date.now()),
                    ...savedValues,
                    status: "active",
                    createdAt: now,
                    updatedAt: now,
                };
                addUser(user);
            }

            setSubmitting(false);
            closeDrawer();
        },
    });

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

            formik.setFieldValue("avatarUrl", reader.result);
            setAvatarError("");
        };
        reader.onerror = () => {
            setAvatarError("The selected image could not be loaded. Please try again.");
        };
        reader.readAsDataURL(file);
    };

    return (
        <OpenDrawer
            open={drawer.open}
            title={title}
            titleIcon={mode === "create" ? <PersonAddRegular /> : undefined}
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
                            disabled={!formik.dirty || !formik.isValid}
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
                        <div className={`user-form-photo-uploader${formik.values.avatarUrl ? " has-photo" : ""}`}>
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
                                aria-label={formik.values.avatarUrl ? "Change profile photo" : "Add a profile photo"}
                            >
                                {formik.values.avatarUrl ? (
                                    <img
                                        className="user-form-photo-image"
                                        src={formik.values.avatarUrl}
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
                                    aria-label={formik.values.avatarUrl ? "Change profile photo" : "Upload profile photo"}
                                    title={formik.values.avatarUrl ? "Change photo" : "Upload photo"}
                                    className="user-form-photo-camera-button"
                                    onClick={() => avatarInputRef.current?.click()}
                                />
                            )}
                            {formik.values.avatarUrl && !isView && (
                                <Button
                                    type="button"
                                    appearance="subtle"
                                    size="small"
                                    icon={<DeleteRegular />}
                                    aria-label="Remove profile photo"
                                    title="Remove photo"
                                    className="user-form-photo-remove"
                                    onClick={() => {
                                        formik.setFieldValue("avatarUrl", "");
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
                        label="Username"
                        required
                        className="user-form-paired-field"
                        {...fieldProps("username", true)}
                    >
                        <Input
                            name="username"
                            autoComplete="username"
                            appearance="outline"
                            size="large"
                            value={formik.values.username}
                            onChange={(_, data) => formik.setFieldValue("username", data.value)}
                            onBlur={() => formik.setFieldTouched("username", true)}
                            disabled={isView}
                            placeholder="e.g. sokha.chan"
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

                {mode === "create" && (
                    <div className="user-form-note">
                        <span className="user-form-note-indicator" />
                        <span>New accounts are created with active status.</span>
                    </div>
                )}
            </form>
        </OpenDrawer>
    );
};

export default CreateUserPage;