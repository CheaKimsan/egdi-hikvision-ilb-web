import { useEffect, useState } from "react";
import { ChevronDown, Maximize2, VideoOff } from "lucide-react";
import { Tooltip } from "@fluentui/react-components";
import Header from "./components/Header";
import demoVideo from "../assets/video/dummy_video.mp4";
import demoVideo2 from "../assets/video/dummy_video2.mp4";

type CameraFeed = {
    id: string;
    label: string;
    location: string;
    src?: string;
};

const cameraFeeds: CameraFeed[] = [
    { id: "CAM-01", label: "Main Entrance", location: "North Gate", src: demoVideo },
    { id: "CAM-02", label: "Vehicle Inspection", location: "Inspection Lane", src: demoVideo2 },
    { id: "CAM-03", label: "Arrival Lane", location: "Inbound" },
    { id: "CAM-04", label: "Departure Lane", location: "Outbound" },
    { id: "CAM-05", label: "Vehicle Parking", location: "Parking Area" },
    { id: "CAM-06", label: "Perimeter", location: "East Boundary" },
];

type CameraVideoProps = {
    camera: CameraFeed;
    variant: "main" | "sub";
    onStreamStatusChange?: (isLive: boolean) => void;
};

const CameraVideo: React.FC<CameraVideoProps> = ({
    camera,
    variant,
    onStreamStatusChange,
}) => {
    const [hasError, setHasError] = useState(false);

    if (!camera.src || hasError) {
        return (
            <div
                className={`control-center-video-off control-center-video-off--${variant}`}
                role="img"
                aria-label={`No video stream for ${camera.label}`}
            >
                <VideoOff aria-hidden="true" />
            </div>
        );
    }

    return (
        <video
            className={variant === "main" ? "control-center-main-camera" : "control-center-sub-camera-video"}
            src={camera.src}
            autoPlay
            muted
            loop
            playsInline
            preload={variant === "sub" ? "metadata" : undefined}
            aria-label={`${camera.label} video feed`}
            onLoadedData={() => onStreamStatusChange?.(true)}
            onError={() => {
                setHasError(true);
                onStreamStatusChange?.(false);
            }}
        />
    );
};

const ControlCenter: React.FC = () => {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [mainCameraId, setMainCameraId] = useState(cameraFeeds[0].id);
    const [timestamp, setTimestamp] = useState(() => new Date());
    const [liveSubCameras, setLiveSubCameras] = useState<Record<string, boolean>>({});
    const [isMainCameraLive, setIsMainCameraLive] = useState(false);
    const mainCamera = cameraFeeds.find((camera) => camera.id === mainCameraId) ?? cameraFeeds[0];
    const subCameras = cameraFeeds.filter((camera) => camera.id !== mainCamera.id);
    const overlayPositions = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "top-center",
    ] as const;

    useEffect(() => {
        const timer = window.setInterval(() => setTimestamp(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setIsMainCameraLive(false);
    }, [mainCameraId]);

    const timestampLabel = timestamp.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    return (
        <div className="control-center-shell">
            {isHeaderVisible ? (
                <Header onClose={() => setIsHeaderVisible(false)} />
            ) : (
                <button
                    type="button"
                    className="control-center-header-toggle"
                    aria-label="Show header"
                    onClick={() => setIsHeaderVisible(true)}
                >
                    <ChevronDown size={20} aria-hidden="true" />
                </button>
            )}
            <main className="control-center-monitor" aria-label="Camera monitoring">
                <CameraVideo
                    key={mainCamera.id}
                    camera={mainCamera}
                    variant="main"
                    onStreamStatusChange={setIsMainCameraLive}
                />
                <div className="control-center-main-label">
                    <span
                        className={`control-center-status-dot ${isMainCameraLive ? "control-center-status-dot--live" : "control-center-status-dot--offline"}`}
                        role="img"
                        aria-label={isMainCameraLive ? "Stream active" : "No active stream"}
                    />
                    <span>{mainCamera.id}</span>
                    <strong>{mainCamera.label}</strong>
                    <span>{mainCamera.location}</span>
                </div>
                <span className="control-center-feed-count">
                    <span className="control-center-status-dot" />
                    {cameraFeeds.length} demo feeds
                </span>
                <section className="control-center-sub-cameras" aria-label="Other camera feeds">
                    {subCameras.map((camera, index) => (
                        <button
                            type="button"
                            className={`control-center-sub-camera control-center-sub-camera--${overlayPositions[index]}`}
                            key={camera.id}
                            aria-label={`Switch main view to ${camera.label}`}
                            aria-pressed="false"
                            onClick={() => setMainCameraId(camera.id)}
                        >
                            <CameraVideo
                                camera={camera}
                                variant="sub"
                                onStreamStatusChange={(isLive) =>
                                    setLiveSubCameras((current) => ({
                                        ...current,
                                        [camera.id]: isLive,
                                    }))
                                }
                            />
                            <div className="control-center-sub-camera-status">
                                <time
                                    className="control-center-sub-camera-timestamp"
                                    dateTime={timestamp.toISOString()}
                                >
                                    {timestampLabel}
                                </time>
                            </div>
                            <Tooltip content="Switch to main view" relationship="label">
                                <span className="control-center-switch-hint">
                                    <Maximize2 size={13} strokeWidth={2.25} aria-hidden="true" />
                                </span>
                            </Tooltip>
                            <div className="control-center-sub-camera-label">
                                <span
                                    className={`control-center-status-dot ${liveSubCameras[camera.id] ? "control-center-status-dot--live" : "control-center-status-dot--offline"}`}
                                    role="img"
                                    aria-label={liveSubCameras[camera.id] ? "Stream active" : "No active stream"}
                                />
                                <span>{camera.id}</span>
                                <strong>{camera.label}</strong>
                            </div>
                        </button>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default ControlCenter;