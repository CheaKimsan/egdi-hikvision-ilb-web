import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { formatDate, formatTime } from "../../../../lib/helpers/services/fmtDateTime";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import { useAuth } from "../AuthContext";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";
import { GoogleIcon } from "../../../../lib/assets/icons/svg/google-icon";

const validationSchema = Yup.object({
    email: Yup.string()
        .email("អ៊ីមែលមិនត្រឹមត្រូវ")
        .required("សូមបញ្ចូលអុីម៉ែល"),
    password: Yup.string().required("សូមបញ្ចូលពាក្យសម្ងាត់"),
});

const LoginPage: React.FC = () => {
    const [now, setNow] = useState(() => new Date());
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = (location.state as { from?: Location } | null)?.from;

    // True only when the user submitted the form (a real login)
    const submittedRef = useRef(false);

    const destination = from
        ? `${from.pathname}${from.search}${from.hash}`
        : "/control-center";

    useEffect(() => {
        if (!isLoading && user) {
            navigate(destination, {
                replace: true,
                state: { justLoggedIn: submittedRef.current },
            });
        }
    }, [isLoading, user, destination, navigate]);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            // Set BEFORE login(), because the redirect effect can run as soon as user is set
            submittedRef.current = true;
            const ok = await login(values.email, values.password);
            if (!ok) {
                submittedRef.current = false;
                setStatus("អុីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ");
            }
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
                            formik.touched.email && formik.errors.email ? "error" : "none"
                        }
                        validationMessage={
                            formik.touched.email ? formik.errors.email : undefined
                        }
                    >
                        <div className="custom-input-wrapper">
                            <Input
                                id="login-username"
                                name="email"
                                type="email"
                                className="login-input"
                                autoComplete="email"
                                placeholder="" // Hide native placeholder
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
                        <Link to="/forgot-password" className="hover:underline" lang="km">
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
                            console.log("Google login clicked");
                        }}
                    >
                        ចូលជាមួយ Google
                    </Button>

                    <div className="flex justify-center">
                        <Link to="/register" lang="km" className="hover:underline">មិនទាន់មានគណនី? ចុះឈ្មោះ</Link>
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