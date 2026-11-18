import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner, type InputProps } from "@fluentui/react-components";
import { CheckmarkCircle24Filled, Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";
import { registerAccount } from "../core/auth.service";
import { AlertToast } from "../../../../lib/helpers/shared/toaster/Toaster";

const validationSchema = Yup.object({
    firstName: Yup.string().trim().required("សូមបញ្ចូលនាមត្រកូល"),
    lastName: Yup.string().trim().required("សូមបញ្ចូលនាម"),
    email: Yup.string().email("អ៊ីមែលមិនត្រឹមត្រូវ").required("សូមបញ្ចូលអ៊ីមែល"),
    password: Yup.string()
        .min(8, "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ")
        .required("សូមបញ្ចូលពាក្យសម្ងាត់"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "ពាក្យសម្ងាត់មិនត្រូវគ្នា")
        .required("សូមបញ្ជាក់ពាក្យសម្ងាត់"),
});

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [registered, setRegistered] = useState(false);

    // After success, go to the login page.
    useEffect(() => {
        if (!registered) return;
        const timer = window.setTimeout(
            () => navigate("/login", { replace: true }),
            2500
        );
        return () => window.clearTimeout(timer);
    }, [registered, navigate]);

    const formik = useFormik<FormValues>({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                await registerAccount(values.firstName, values.lastName, values.email, values.password);
                setRegistered(true);
            } catch (error) {
                const code = (error as { code?: string }).code;

                switch (code) {
                    case "auth/email-already-in-use":
                        setStatus("អ៊ីមែលនេះមានគណនីរួចហើយ");
                        break;
                    case "auth/invalid-email":
                        setStatus("អ៊ីមែលមិនត្រឹមត្រូវ");
                        break;
                    case "auth/weak-password":
                        setStatus("ពាក្យសម្ងាត់ខ្សោយពេក សូមប្រើពាក្យសម្ងាត់ដែលរឹងមាំជាងនេះ");
                        break;
                    case "auth/network-request-failed":
                        setStatus("បញ្ហាបណ្តាញ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត");
                        break;
                    default:
                        console.error("Register failed:", code, error);
                        setStatus("មានបញ្ហា សូមព្យាយាមម្តងទៀត");
                }
            }
        },
    });

    const renderField = (
        name: keyof FormValues,
        label: string,
        options?: {
            type?: InputProps["type"];
            autoComplete?: string;
            toggle?: { visible: boolean; onToggle: () => void };
        }
    ) => (
        <Field
            className="input-group"
            validationState={formik.touched[name] && formik.errors[name] ? "error" : "none"}
            validationMessage={formik.touched[name] ? formik.errors[name] : undefined}
        >
            <div className="custom-input-wrapper">
                <Input
                    id={`register-${name}`}
                    name={name}
                    type={
                        options?.toggle
                            ? options.toggle.visible ? "text" : "password"
                            : options?.type ?? "text"
                    }
                    className="login-input"
                    autoComplete={options?.autoComplete}
                    placeholder=""
                    appearance="outline"
                    size="large"
                    disabled={formik.isSubmitting}
                    contentAfter={
                        options?.toggle ? (
                            <Button
                                type="button"
                                appearance="subtle"
                                size="small"
                                disabled={formik.isSubmitting}
                                icon={options.toggle.visible ? <EyeOff20Regular /> : <Eye20Regular />}
                                aria-label={options.toggle.visible ? "Hide password" : "Show password"}
                                aria-pressed={options.toggle.visible}
                                onClick={options.toggle.onToggle}
                            />
                        ) : undefined
                    }
                    value={formik.values[name]}
                    onChange={(_, data) => {
                        formik.setStatus(undefined);
                        formik.setFieldValue(name, data.value);
                    }}
                    onBlur={() => formik.setFieldTouched(name, true)}
                />
                {!formik.values[name] && (
                    <span className="custom-placeholder">
                        {label} <span className="required">*</span>
                    </span>
                )}
            </div>
        </Field>
    );

    return (
        <main className="login-page">
            <ParticleBackground />

            <AlertToast
                message="អ្នកបានង្កើតគណនីជោគជ័យ!"
                intent="success"
                icon={<CheckmarkCircle24Filled style={{ color: "#107c10" }} />}
                open={registered}
            />

            <section className="login-card register-card" aria-labelledby="register-title">
                <div className="login-logo my-4">
                    <img src={Logo} alt="General Department of Immigration" />
                </div>

                <header className="login-heading">
                    <h1 id="register-title" lang="km">{AppConfig.orgKm}</h1>
                    <p>{AppConfig.orgEn}</p>
                </header>
                <form className="login-form" noValidate onSubmit={formik.handleSubmit}>
                    {renderField("firstName", "នាមត្រកូល", { autoComplete: "firtname" })}
                    {renderField("lastName", "នាម", { autoComplete: "ls" })}
                    {renderField("email", "អ៊ីមែល", { type: "email", autoComplete: "email" })}
                    {renderField("password", AppConfig.password, {
                        autoComplete: "new-password",
                        toggle: {
                            visible: showPassword,
                            onToggle: () => setShowPassword((v) => !v),
                        },
                    })}
                    {
                        renderField("confirmPassword", "បញ្ជាក់ពាក្យសម្ងាត់", {
                            autoComplete: "new-password",
                            toggle: {
                                visible: showConfirm,
                                onToggle: () => setShowConfirm((v) => !v),
                            },
                        })
                    }

                    {formik.status && (
                        <p className="login-field-error" role="alert" lang="km">
                            {formik.status}
                        </p>
                    )}

                    <Button
                        className="login-submit"
                        type="submit"
                        appearance="primary"
                        lang="km"
                        disabled={formik.isSubmitting || !formik.isValid}
                        icon={formik.isSubmitting ? <Spinner size="tiny" /> : undefined}
                    >
                        {formik.isSubmitting ? "កំពុងចុះឈ្មោះ..." : "ចុះឈ្មោះ"}
                    </Button>
                </form>

                <div className="flex justify-center mt-4">
                    <Link to="/login" lang="km">មានគណនីរួចហើយ? ចូលប្រព័ន្ធ</Link>
                </div>
            </section>
        </main>
    );
};

export default RegisterPage;