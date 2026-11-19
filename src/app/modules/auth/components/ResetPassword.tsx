import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../../../../lib/assets/images/GDI.png";
import { AppConfig } from "../../../../config/ilb.config";
import ParticleBackground from "../../../../lib/helpers/shared/animation/ParticalBackground";
import { confirmReset, verifyResetCode } from "../core/auth.service";

type Stage = "verifying" | "invalid" | "ready" | "done";

type FieldName = "password" | "confirmPassword";

const validationSchema = Yup.object({
    password: Yup.string()
        .min(8, "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ")
        .required("សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "ពាក្យសម្ងាត់មិនដូចគ្នា")
        .required("សូមបញ្ជាក់ពាក្យសម្ងាត់"),
});

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Firebase puts these in the link: ?mode=resetPassword&oobCode=...
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    const [stage, setStage] = useState<Stage>("verifying");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Check the link once when the page opens.
    useEffect(() => {
        if (mode !== "resetPassword" || !oobCode) {
            setStage("invalid");
            return;
        }

        let cancelled = false;

        verifyResetCode(oobCode)
            .then((accountEmail) => {
                if (cancelled) return;
                setEmail(accountEmail);
                setStage("ready");
            })
            .catch(() => {
                if (!cancelled) setStage("invalid");
            });

        return () => {
            cancelled = true;
        };
    }, [mode, oobCode]);

    // After success, go to the login page automatically.
    useEffect(() => {
        if (stage !== "done") return;
        const timer = window.setTimeout(
            () => navigate("/login", { replace: true }),
            3000
        );
        return () => window.clearTimeout(timer);
    }, [stage, navigate]);

    const formik = useFormik({
        initialValues: { password: "", confirmPassword: "" },
        validationSchema,
        onSubmit: async (values, { setStatus }) => {
            if (!oobCode) return;

            try {
                await confirmReset(oobCode, values.password);
                setStage("done");
            } catch (error) {
                const code = (error as { code?: string }).code;

                if (
                    code === "auth/expired-action-code" ||
                    code === "auth/invalid-action-code"
                ) {
                    setStage("invalid");
                } else if (code === "auth/weak-password") {
                    setStatus("ពាក្យសម្ងាត់ខ្សោយពេក សូមប្រើពាក្យសម្ងាត់ដែលរឹងមាំជាងនេះ");
                } else {
                    setStatus("មានបញ្ហា សូមព្យាយាមម្តងទៀត");
                }
            }
        },
    });

    const renderPasswordField = (name: FieldName, label: string) => (
        <Field
            className="input-group"
            validationState={
                formik.touched[name] && formik.errors[name] ? "error" : "none"
            }
            validationMessage={
                formik.touched[name] ? formik.errors[name] : undefined
            }
        >
            <div className="custom-input-wrapper">
                <Input
                    id={`reset-${name}`}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    autoComplete="new-password"
                    placeholder=""
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
                    value={formik.values[name]}
                    onChange={(_, data) => {
                        formik.setStatus(undefined);
                        formik.setFieldValue(name, data.value);
                    }}
                    onBlur={() => formik.setFieldTouched(name, true)}
                />
                {!formik.values[name] && (
                    <span className="custom-placeholder" lang="km">
                        {label} <span className="required">*</span>
                    </span>
                )}
            </div>
        </Field>
    );

    return (
        <main className="login-page">
            <ParticleBackground />

            <section className="login-card" aria-labelledby="reset-title">
                <div className="login-logo">
                    <img src={Logo} alt="General Department of Immigration" />
                </div>

                <header className="login-heading">
                    <h1 id="reset-title" lang="km">កំណត់ពាក្យសម្ងាត់ឡើងវិញ</h1>
                    <p>{stage === "ready" && email ? email : AppConfig.orgEn}</p>
                </header>

                {stage === "verifying" && (
                    <p className="login-success" role="status" lang="km">
                        <Spinner size="tiny" /> កំពុងពិនិត្យតំណភ្ជាប់...
                    </p>
                )}

                {stage === "invalid" && (
                    <>
                        <p className="login-field-error" role="alert" lang="km">
                            តំណភ្ជាប់មិនត្រឹមត្រូវ ឬបានផុតកំណត់។ សូមស្នើសុំតំណថ្មី។
                        </p>
                        <div className="login-forgot text-center py-2">
                            <Link to="/forgot-password" lang="km">ស្នើសុំតំណថ្មី</Link>
                        </div>
                    </>
                )}

                {stage === "ready" && (
                    <form className="login-form" noValidate onSubmit={formik.handleSubmit}>
                        {renderPasswordField("password", "ពាក្យសម្ងាត់ថ្មី")}
                        {renderPasswordField("confirmPassword", "បញ្ជាក់ពាក្យសម្ងាត់")}

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
                            {formik.isSubmitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                        </Button>
                    </form>
                )}

                {stage === "done" && (
                    <p className="login-success" role="status" lang="km">
                        បានកំណត់ពាក្យសម្ងាត់ឡើងវិញដោយជោគជ័យ។ កំពុងត្រឡប់ទៅទំព័រចូលប្រព័ន្ធ...
                    </p>
                )}

                <div className="login-forgot text-center py-2">
                    <Link to="/login" lang="km">← ត្រឡប់ទៅចូលប្រព័ន្ធវិញ</Link>
                </div>
            </section>
        </main>
    );
};

export default ResetPasswordPage;