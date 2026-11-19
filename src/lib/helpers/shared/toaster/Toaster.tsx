import * as React from "react";
import type { JSXElement, ToastIntent } from "@fluentui/react-components";
import { Toast, ToastTitle, Toaster, useId, useToastController, } from "@fluentui/react-components";
import { icons } from "lucide-react";

type AlertToastProps = {
    message: string;
    intent?: ToastIntent;
    open: boolean;
    icon?: JSXElement | null;
};

export const AlertToast = ({
    message,
    intent = "info",
    open,
    icon
}: AlertToastProps): JSXElement => {
    const toasterId = useId("alert-toast");
    const { dispatchToast } = useToastController(toasterId);
    const dispatched = React.useRef(false);

    React.useEffect(() => {
        if (!open) {
            dispatched.current = false;
            return;
        }
        if (dispatched.current) return;
        dispatched.current = true;
        dispatchToast(
            <Toast>
                <ToastTitle media={icon}>{message}</ToastTitle>
            </Toast>,
            {
                intent,
                position: "bottom",
                timeout: 3000,
            },
        );
    }, [open, dispatchToast, intent, message, icon]);

    return <Toaster toasterId={toasterId} position="bottom" />;
};
