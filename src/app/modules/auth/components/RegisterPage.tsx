import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, InputProps, Spinner } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";

const validationSchema = Yup.object({
    fullName: Yup.string().trim().required("សូមបញ្ចូលឈ្មោះពេញ"),
    username: Yup.string()
        .trim()
        .min(4, "លេខសម្គាល់ត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ")
        .required("សូមបញ្ចូលលេខសម្គាល់"),
    email: Yup.string().email("អ៊ីមែលមិនត្រឹមត្រូវ").required("សូមបញ្ចូលអ៊ីមែល"),
    password: Yup.string()
        .min(8, "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ")
        .required("សូមបញ្ចូលពាក្យសម្ងាត់"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "ពាក្យសម្ងាត់មិនត្រូវគ្នា")
        .required("សូមបញ្ជាក់ពាក្យសម្ងាត់"),
});

type FormValues = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [registered, setRegistered] = useState(false);

    const formik = useFormik<FormValues>({
        initialValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                // TODO: replace with your real API call
                // await api.post("/auth/register", {
                //     fullName: values.fullName,
                //     username: values.username,
                //     email: values.email,
                //     password: values.password,
                // });
                await new Promise((resolve) => window.setTimeout(resolve, 800));
                setRegistered(true);
                window.setTimeout(() => navigate("/login", { replace: true }), 2000);
            } catch {
                setStatus("មានបញ្ហា សូមព្យាយាមម្តងទៀត");
            }
        },
    });

    const renderField = (
        name: keyof FormValues,
        label: string,
        options?: {
            type?: InputProps["type"];   // was: string
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

            <section className="login-card register-card" aria-labelledby="register-title">
                <div className="login-logo my-4">
                    <img src={Logo} alt="General Department of Immigration" />
                </div>

                <header className="login-heading">
                    <h1 id="register-title" lang="km">{AppConfig.orgKm}</h1>
                    <p>{AppConfig.orgEn}</p>
                </header>

                {registered ? (
                    <p className="login-success" role="status" lang="km">
                        បង្កើតគណនីបានជោគជ័យ! កំពុងបញ្ជូនអ្នកទៅទំព័រចូលប្រព័ន្ធ...
                    </p>
                ) : (
                    <form className="login-form" noValidate onSubmit={formik.handleSubmit}>
                        {renderField("fullName", "ឈ្មោះពេញ", { autoComplete: "name" })}
                        {renderField("username", AppConfig.username, { autoComplete: "username" })}
                        {renderField("email", "អ៊ីមែល", { type: "email", autoComplete: "email" })}
                        {renderField("password", AppConfig.password, {
                            autoComplete: "new-password",
                            toggle: {
                                visible: showPassword,
                                onToggle: () => setShowPassword((v) => !v),
                            },
                        })}
                        {renderField("confirmPassword", "បញ្ជាក់ពាក្យសម្ងាត់", {
                            autoComplete: "new-password",
                            toggle: {
                                visible: showConfirm,
                                onToggle: () => setShowConfirm((v) => !v),
                            },
                        })}

                        {formik.status && (
                            <p className="login-field-error" role="alert">{formik.status}</p>
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
                )}

                <div className="flex justify-center mt-4">
                    <Link to="/login" lang="km">មានគណនីរួចហើយ? ចូលប្រព័ន្ធ</Link>
                </div>
            </section>
        </main>
    );
};

export default RegisterPage;