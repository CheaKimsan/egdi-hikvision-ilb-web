import { Lottie } from "lottie-react";
import { ProgressBar } from "@fluentui/react-components";
import loadingAnimation from "../../../assets/images/loading.json";

type LoaderProps = {
    type?: string;
};

export default function Loader({ type }: LoaderProps) {
    if (type === "line-bar") {
        return <ProgressBar aria-label="Loading" />;
    }

    if (!type) {
        return (
            <div
                role="status"
                aria-label="Loading"
                style={{ width: 180, height: 180 }}
            >
                <Lottie
                    src={loadingAnimation}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        );
    }

    return null;
}