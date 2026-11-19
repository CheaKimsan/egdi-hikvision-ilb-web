import { useEffect, useState } from "react";
import { VideoOff } from "lucide-react";
import { CameraFeed } from "../../../../lib/constants/CameraFeeds";

type StreamVideoLiveProps = {
    camera: CameraFeed;
    variant: "main" | "sub";
    onStreamStatusChange?: (isLive: boolean) => void;
};

const StreamVideoLive: React.FC<StreamVideoLiveProps> = ({
    camera,
    variant,
    onStreamStatusChange,
}) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [camera.src]);

    if (!camera.src || hasError) {
        return (
            <div
                className={`control-center-video-off control-center-video-off--${variant}`}
                role="img"
                aria-label={`No video stream for ${camera.label}`}
            >
                <VideoOff aria-hidden="true" />
                <span>No Signal</span>
            </div>
        );
    }

    return (
        <video
            className={variant === "main" ? "control-center-main-camera" : "control-center-sub-camera-video"}
            src={camera.src}
            crossOrigin="anonymous"
            autoPlay
            muted
            loop
            playsInline
            preload={variant === "sub" ? "metadata" : undefined}
            aria-label={`${camera.label} video feed`}
            onLoadedData={() => onStreamStatusChange?.(true)}
            onEmptied={() => onStreamStatusChange?.(false)}
            onError={() => {
                setHasError(true);
                onStreamStatusChange?.(false);
            }}
        />
    );
};

export default StreamVideoLive;