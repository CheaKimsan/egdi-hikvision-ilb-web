import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { Link } from "react-router-dom";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";
import { sendResetEmail } from "../core/auth.service";

const validationSchema = Yup.object({
    email: Yup.string()
        .email("អ៊ីមែលមិនត្រឹមត្រូវ")
        .required("សូមបញ្ចូលអុីម៉ែល"),
});

const ForgotPasswordPage: React.FC = () => {
    const [sent, setSent] = useState(false);

    const formik = useFormik({
        initialValues: { email: "" },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                await sendResetEmail(values.email);
                setSent(true);
            } catch (error) {
                const code = (error as { code?: string }).code;
                if (code === "auth/user-not-found") {
                    setSent(true);
                    return;
                }

                if (code === "auth/invalid-email") {
                    setStatus("អ៊ីមែលមិនត្រឹមត្រូវ");
                } else if (code === "auth/too-many-requests") {
                    setStatus("ព្យាយាមច្រើនពេក សូមរង់ចាំបន្តិចរួចព្យាយាមម្តងទៀត");
                } else {
                    setStatus("មានបញ្ហា សូមព្យាយាមម្តងទៀត");
                }
            }
        },
    });

    return (
        <main className="login-page">
            <ParticleBackground />

            <section className="login-card" aria-labelledby="forgot-title">
                <div className="login-logo">
                    <img src={Logo} alt="General Department of Immigration" />
                </div>

                <header className="login-heading">
                    <h1 id="forgot-title" lang="km">{AppConfig.orgKm}</h1>
                    <p>{AppConfig.orgEn}</p>
                </header>

                {sent ? (
                    <p className="login-success" role="status" lang="km">
                        ប្រសិនបើគណនីមានវត្តមាន យើងបានផ្ញើការណែនាំសម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ។
                    </p>
                ) : (
                    <form className="login-form" noValidate onSubmit={formik.handleSubmit}>
                        <Field
                            className="input-group"
                            validationState={
                                formik.touched.email && formik.errors.email ? "error" : "none"
                            }
                            validationMessage={
                                formik.touched.email ? formik.errors.email : undefined
                            }
                        >
                            <div className="custom-input-wrapper">
                                <Input
                                    id="forgot-email"
                                    name="email"
                                    type="email"
                                    className="login-input"
                                    autoComplete="email"
                                    placeholder=""
                                    appearance="outline"
                                    size="large"
                                    disabled={formik.isSubmitting}
                                    value={formik.values.email}
                                    onChange={(_, data) => {
                                        formik.setStatus(undefined);
                                        formik.setFieldValue("email", data.value);
                                    }}
                                    onBlur={() => formik.setFieldTouched("email", true)}
                                />
                                {!formik.values.email && (
                                    <span className="custom-placeholder">
                                        {AppConfig.email} <span className="required">*</span>
                                    </span>
                                )}
                            </div>
                        </Field>

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
                            {formik.isSubmitting ? "កំពុងផ្ញើ..." : "ផ្ញើការណែនាំ"}
                        </Button>
                    </form>
                )}

                <div className="login-forgot text-center py-2">
                    <Link to="/login" lang="km">← ត្រឡប់ទៅចូលប្រព័ន្ធវិញ</Link>
                </div>
            </section>
        </main>
    );
};

export default ForgotPasswordPage;