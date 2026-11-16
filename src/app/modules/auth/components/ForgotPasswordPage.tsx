import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { Link } from "react-router-dom";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";

const validationSchema = Yup.object({
    username: Yup.string().required("សូមបញ្ចូលលេខសម្គាល់"),
});

const ForgotPasswordPage: React.FC = () => {
    const [sent, setSent] = useState(false);

    const formik = useFormik({
        initialValues: { username: "" },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                // TODO: replace with your real API call
                // await api.post("/auth/forgot-password", { username: values.username });
                await new Promise((resolve) => window.setTimeout(resolve, 800));
                setSent(true);
            } catch {
                setStatus("មានបញ្ហា សូមព្យាយាមម្តងទៀត");
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
                    <h1 id="forgot-title" lang="km">ភ្លេចពាក្យសម្ងាត់</h1>
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
                                formik.touched.username && formik.errors.username ? "error" : "none"
                            }
                            validationMessage={
                                formik.touched.username ? formik.errors.username : undefined
                            }
                        >
                            <div className="custom-input-wrapper">
                                <Input
                                    name="username"
                                    className="login-input"
                                    autoComplete="username"
                                    placeholder=""
                                    appearance="outline"
                                    size="large"
                                    disabled={formik.isSubmitting}
                                    value={formik.values.username}
                                    onChange={(_, data) => {
                                        formik.setStatus(undefined);
                                        formik.setFieldValue("username", data.value);
                                    }}
                                    onBlur={() => formik.setFieldTouched("username", true)}
                                />
                                {!formik.values.username && (
                                    <span className="custom-placeholder">
                                        {AppConfig.username} <span className="required">*</span>
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

                <div className="login-forgot login-forgot--back">
                    <Link to="/login" lang="km">← ត្រឡប់ទៅចូលប្រព័ន្ធវិញ</Link>
                </div>
            </section>
        </main>
    );
};

export default ForgotPasswordPage;