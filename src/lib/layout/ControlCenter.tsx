import { useEffect, useState } from "react";
import { ChevronDown, Maximize2, VideoOff } from "lucide-react";
import { Tooltip } from "@fluentui/react-components";
import Header from "./components/Header";
import { useInstallationStore } from "../../app/modules/account/device-installation/core/store";
import { useVehicleStore } from "../../app/modules/account/vehicle/core/store";
import { CameraFeed, cameraFeeds } from "../constants/CameraFeeds";


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
                <span>No Signal</span>
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
    const installations = useInstallationStore((state) => state.rows);
    const vehicles = useVehicleStore((state) => state.rows);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [mainCameraId, setMainCameraId] = useState(cameraFeeds[0].id);
    const [timestamp, setTimestamp] = useState(() => new Date());
    const [liveSubCameras, setLiveSubCameras] = useState<Record<string, boolean>>({});
    const [isMainCameraLive, setIsMainCameraLive] = useState(false);
    const mainCamera = cameraFeeds.find((camera) => camera.id === mainCameraId) ?? cameraFeeds[0];
    const subCameras = cameraFeeds.filter((camera) => camera.id !== mainCamera.id);
    const activeStreamCount = (isMainCameraLive ? 1 : 0)
        + subCameras.filter((camera) => liveSubCameras[camera.id]).length;
    const offlineStreamCount = cameraFeeds.length - activeStreamCount;
    const installedVehicleCodes = new Set(
        installations
            .filter((installation) => !installation.removedAt)
            .map((installation) => installation.vehicleCode),
    );
    const installedVehicleNames = Array.from(installedVehicleCodes, (vehicleCode) =>
        vehicles.find((vehicle) => vehicle.vehicleCode === vehicleCode)?.name ?? vehicleCode,
    );
    const vehicleLocation = Array.from(
        new Set(
            Array.from(installedVehicleCodes, (vehicleCode) =>
                vehicles.find((vehicle) => vehicle.vehicleCode === vehicleCode)?.province,
            ).filter((province): province is string => Boolean(province)),
        ),
    ).join(", ") || "N/A";


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
                <div className="control-center-main-camera-brackets" aria-hidden="true">
                    <span className="control-center-main-camera-bracket control-center-main-camera-bracket--top-left" />
                    <span className="control-center-main-camera-bracket control-center-main-camera-bracket--top-right" />
                    <span className="control-center-main-camera-bracket control-center-main-camera-bracket--bottom-left" />
                    <span className="control-center-main-camera-bracket control-center-main-camera-bracket--bottom-right" />
                    <span className="control-center-main-camera-crosshair" />
                </div>
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
                <div
                    className="control-center-feed-summary"
                    role="status"
                    aria-label={`${cameraFeeds.length} cameras, installed vehicles: ${installedVehicleNames.join(", ") || "none"}, ${activeStreamCount} streams active, ${offlineStreamCount} offline`}
                >
                    <div className="control-center-feed-summary-model">
                        <span
                            className={`control-center-status-dot ${activeStreamCount > 0 ? "control-center-status-dot--live" : "control-center-status-dot--offline"}`}
                            aria-hidden="true"
                        />
                        <strong>TVJ860-GIR</strong>
                        <span className="control-center-feed-summary-caption">CAMERA SYSTEM</span>
                    </div>
                    <span className="control-center-feed-summary-divider" aria-hidden="true" />
                    <div className="control-center-feed-summary-metric">
                        <span>Location</span>
                        <strong>{vehicleLocation}</strong>
                    </div>
                    <div className="control-center-feed-summary-metric control-center-feed-summary-vehicles">
                        {/* <strong title={installedVehicleNames.join(", ")}>
                            {installedVehicleNames.join(", ") || "None"}
                        </strong> */}
                        <strong>{installedVehicleNames.length}</strong>
                        <span>VEHICLES</span>
                    </div>
                    <div className="control-center-feed-summary-metric control-center-feed-summary-metric--online">
                        <strong>{activeStreamCount}</strong>
                        <span>ONLINE</span>
                    </div>
                    <div className="control-center-feed-summary-metric control-center-feed-summary-metric--offline">
                        <strong>{offlineStreamCount}</strong>
                        <span>OFFLINE</span>
                    </div>
                </div>
                <section className="control-center-sub-cameras" aria-label="Other camera feeds">
                    {subCameras.map((camera) => (
                        <button
                            type="button"
                            className="control-center-sub-camera"
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