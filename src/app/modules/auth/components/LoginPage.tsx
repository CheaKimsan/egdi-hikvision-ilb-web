import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { formatDate, formatTime } from "../../../../_egdi_ilb/helpers/fmtDateTime";
import Logo from "../../../../_egdi_ilb/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import { useAuth } from "../AuthContext";

const validationSchema = Yup.object({
    username: Yup.string().required("សូមបញ្ចូលលេខសម្គាល់"),
    password: Yup.string().required("សូមបញ្ចូលពាក្យសម្ងាត់"),
});

const LoginPage: React.FC = () => {
    const [now, setNow] = useState(() => new Date());
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema,
        onSubmit: (values, { setStatus }) => {
            const authenticated = login(values.username, values.password);
            setStatus(
                authenticated
                    ? undefined
                    : "លេខសម្គាល់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ"
            );
        },
    });

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <main className="login-page">
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
                        label={<span className="visually-hidden">{AppConfig.username}</span>}
                        validationState={
                            formik.touched.username && formik.errors.username ? "error" : "none"
                        }
                        validationMessage={
                            formik.touched.username ? formik.errors.username : undefined
                        }
                    >
                        <Input
                            id="login-username"
                            name="username"
                            className="login-input"
                            autoComplete="username"
                            placeholder={`${AppConfig.username} *`}
                            appearance="outline"
                            size="large"
                            value={formik.values.username}
                            onChange={(_, data) => {
                                formik.setStatus(undefined);
                                formik.setFieldValue("username", data.value);
                            }}
                            onBlur={() => formik.setFieldTouched("username", true)}
                        />
                    </Field>

                    <Field
                        className="input-group"
                        label={<span className="visually-hidden">{AppConfig.password}</span>}
                        validationState={
                            formik.touched.password && formik.errors.password ? "error" : "none"
                        }
                        validationMessage={
                            formik.touched.password ? formik.errors.password : undefined
                        }
                    >
                        <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="login-input"
                            autoComplete="current-password"
                            placeholder={`${AppConfig.password} *`}
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