import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Header from "./components/Header";
import { useInstallationStore } from "../../app/modules/account/device-installation/core/store";
import { useVehicleStore } from "../../app/modules/account/vehicle/core/store";
import { cameraFeeds } from "../constants/CameraFeeds";
import StreamVideoLive from "../../app/modules/control-center/components/StreamVideoLive";
import StreamSubVideo from "../../app/modules/control-center/components/StreamSubVideo";
import StreamFeedSummary from "../../app/modules/control-center/components/StreamFeedSummary";
import StreamGpsOverlay from "../../app/modules/control-center/components/GpsOverlay";
import { useGpsStatus } from "../../app/modules/control-center/core/useGpsStatus";
import { useVideoControls } from "../../app/modules/control-center/core/useVideoControl";
import StreamControls from "../../app/modules/control-center/components/StreamControl";

const ControlCenter: React.FC = () => {
    const installations = useInstallationStore((state) => state.rows);
    const vehicles = useVehicleStore((state) => state.rows);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [mainCameraId, setMainCameraId] = useState(cameraFeeds[0].id);
    const [liveSubCameras, setLiveSubCameras] = useState<Record<string, boolean>>({});
    const [isMainCameraLive, setIsMainCameraLive] = useState(false);
    const { data: gps } = useGpsStatus("TVJ860-GIR");
    const mainCamera = cameraFeeds.find((camera) => camera.id === mainCameraId) ?? cameraFeeds[0];
    const subCameras = cameraFeeds.filter((camera) => camera.id !== mainCamera.id);

    const monitorRef = useRef<HTMLElement>(null);
    const controls = useVideoControls(monitorRef, mainCamera.id);

    const activeStreamCount = (isMainCameraLive ? 1 : 0)
        + subCameras.filter((camera) => liveSubCameras[camera.id]).length;
    const offlineStreamCount = cameraFeeds.length - activeStreamCount;
    const installedVehicleCodes = new Set(
        installations
            .filter((installation) => !installation.removedAt)
            .map((installation) => installation.vehicleCode),
    );
    const vehicleLocation = Array.from(
        new Set(
            Array.from(installedVehicleCodes, (vehicleCode) =>
                vehicles.find((vehicle) => vehicle.vehicleCode === vehicleCode)?.province,
            ).filter((province): province is string => Boolean(province)),
        ),
    ).join(", ") || "N/A";

    useEffect(() => {
        setIsMainCameraLive(false);
    }, [mainCameraId]);

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
            <main
                ref={monitorRef}
                className="control-center-monitor"
                aria-label="Camera monitoring"
            >
                <StreamVideoLive
                    key={mainCamera.id}
                    camera={mainCamera}
                    variant="main"
                    onStreamStatusChange={setIsMainCameraLive}
                />
                <div className="stream-brackets" aria-hidden="true">
                    <span className="stream-bracket stream-bracket--top-left" />
                    <span className="stream-bracket stream-bracket--top-right" />
                    <span className="stream-bracket stream-bracket--bottom-left" />
                    <span className="stream-bracket stream-bracket--bottom-right" />
                    <span className="stream-crosshair" />
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

                <StreamFeedSummary
                    cameraCount={cameraFeeds.length}
                    // vehicleNames={installedVehicleNames}
                    location={vehicleLocation}
                    activeCount={activeStreamCount}
                    offlineCount={offlineStreamCount}
                />

                <StreamGpsOverlay gps={gps} speedLimitKph={100} />

                <StreamControls controls={controls} isLive={isMainCameraLive} />

                <StreamSubVideo
                    cameras={subCameras}
                    liveByCameraId={liveSubCameras}
                    onSelect={setMainCameraId}
                    onStreamStatusChange={(cameraId, isLive) =>
                        setLiveSubCameras((current) => ({ ...current, [cameraId]: isLive }))
                    }
                />
            </main>
        </div>
    );
};

export default ControlCenter;