import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { formatDate, formatTime } from "../../../../_egdi_ilb/helpers/shared/formation/fmtDateTime";
import Logo from "../../../../_egdi_ilb/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import { useAuth } from "../AuthContext";
import ParticleBackground from "../../../../_egdi_ilb/helpers/shared/animation/ParticalBackground";


const validationSchema = Yup.object({
    username: Yup.string().required("សូមបញ្ចូលលេខសម្គាល់"),
    password: Yup.string().required("សូមបញ្ចូលពាក្យសម្ងាត់"),
});

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
        onSubmit: (values, { setStatus }) => {
            const authenticated = login(values.username, values.password);
            if (authenticated) {
                const destination = from
                    ? `${from.pathname}${from.search}${from.hash}`
                    : "/management";
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
                <div className="login-logo">
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
                                contentAfter={
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        size="small"
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
                    >
                        {AppConfig.submit}
                    </Button>
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