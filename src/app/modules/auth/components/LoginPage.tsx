import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { formatDate, formatTime } from "../../../../lib/helpers/services/formation/fmtDateTime";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import { useAuth } from "../AuthContext";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";


const validationSchema = Yup.object({
    username: Yup.string().required("សូមបញ្ចូលលេខសម្គាល់"),
    password: Yup.string().required("សូមបញ្ចូលពាក្យសម្ងាត់"),
});

const GoogleIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
);

const LoginPage: React.FC = () => {
    const [now, setNow] = useState(() => new Date());
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = (location.state as { from?: Location } | null)?.from;

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            await new Promise((resolve) => window.setTimeout(resolve, 500));
            const authenticated = login(values.username, values.password);
            if (authenticated) {
                const destination = from
                    ? `${from.pathname}${from.search}${from.hash}`
                    : "/control-center";
                navigate(destination, { replace: true });
                return;
            }

            setStatus(
                "លេខសម្គាល់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ"
            );
        },
    });

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <main className="login-page">

            <ParticleBackground />

            <section className="login-card" aria-labelledby="login-title">
                <div className="login-logo my-4">
                    <img src={Logo} alt="General Department of Immigration" />
                </div>

                <header className="login-heading">
                    <h1 id="login-title" lang="km">{AppConfig.orgKm}</h1>
                    <p>{AppConfig.orgEn}</p>
                </header>

                <div className="login-datetime" aria-live="off">
                    <time className="login-clock">{formatTime(now)}</time>
                    <time className="login-date" dateTime={now.toISOString()}>
                        {formatDate(now)}
                    </time>
                </div>

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
                                id="login-username"
                                name="username"
                                className="login-input"
                                autoComplete="username"
                                placeholder="" // Hide native placeholder
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

                    <Field
                        className="input-group"
                        validationState={
                            formik.touched.password && formik.errors.password ? "error" : "none"
                        }
                        validationMessage={
                            formik.touched.password ? formik.errors.password : undefined
                        }
                    >
                        <div className="custom-input-wrapper">
                            <Input
                                id="login-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="login-input"
                                autoComplete="current-password"
                                placeholder="" // Hide native placeholder
                                appearance="outline"
                                size="large"
                                disabled={formik.isSubmitting}
                                contentAfter={
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        size="small"
                                        disabled={formik.isSubmitting}
                                        icon={showPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        aria-pressed={showPassword}
                                        onClick={() => setShowPassword((visible) => !visible)}
                                    />
                                }
                                value={formik.values.password}
                                onChange={(_, data) => {
                                    formik.setStatus(undefined);
                                    formik.setFieldValue("password", data.value);
                                }}
                                onBlur={() => formik.setFieldTouched("password", true)}
                            />
                            {!formik.values.password && (
                                <span className="custom-placeholder">
                                    {AppConfig.password} <span className="required">*</span>
                                </span>
                            )}
                        </div>
                    </Field>
                    <div className="login-forgot flex justify-end">
                        <Link to="/forgot-password" lang="km">
                            ភ្លេចពាក្យសម្ងាត់?
                        </Link>
                    </div>

                    {formik.status && (
                        <p className="login-field-error" role="alert">
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
                        {formik.isSubmitting ? "កំពុងចូលប្រព័ន្ធ..." : AppConfig.submit}
                    </Button>

                    <div className="login-divider" aria-hidden="true">
                        <span lang="km">ឬ</span>
                    </div>

                    <Button
                        className="login-google"
                        type="button"
                        appearance="outline"
                        size="large"
                        lang="km"
                        disabled={formik.isSubmitting}
                        icon={<GoogleIcon />}
                        onClick={() => {
                            // TODO: hook up Google login later
                            console.log("Google login clicked");
                        }}
                    >
                        ចូលជាមួយ Google
                    </Button>

                    <div className="flex justify-center">
                        <Link to="/register" lang="km">មិនទាន់មានគណនី? ចុះឈ្មោះ</Link>
                    </div>
                </form>

                <footer className="login-footer">
                    <p lang="km">
                        ©{now.getFullYear()} {AppConfig.copyright} {AppConfig.orgKm}
                    </p>
                    <span>{AppConfig.version}</span>
                </footer>
            </section>
        </main>
    );
};

export default LoginPage;