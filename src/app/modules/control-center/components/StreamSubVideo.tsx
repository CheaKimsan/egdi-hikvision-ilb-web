import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { Tooltip } from "@fluentui/react-components";
import { CameraFeed } from "../../../../lib/constants/CameraFeeds";
import StreamVideoLive from "./StreamVideoLive";

type StreamSubVideoProps = {
    cameras: CameraFeed[];
    liveByCameraId: Record<string, boolean>;
    onSelect: (cameraId: string) => void;
    onStreamStatusChange: (cameraId: string, isLive: boolean) => void;
};

const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

const StreamSubVideo: React.FC<StreamSubVideoProps> = ({
    cameras,
    liveByCameraId,
    onSelect,
    onStreamStatusChange,
}) => {
    const [timestamp, setTimestamp] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setTimestamp(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const timestampLabel = timestampFormatter.format(timestamp);

    return (
        <section className="control-center-sub-cameras" aria-label="Other camera feeds">
            {cameras.map((camera) => {
                const isLive = Boolean(liveByCameraId[camera.id]);

                return (
                    <button
                        type="button"
                        className="control-center-sub-camera"
                        key={camera.id}
                        aria-label={`Switch main view to ${camera.label}`}
                        aria-pressed="false"
                        onClick={() => onSelect(camera.id)}
                    >
                        <StreamVideoLive
                            camera={camera}
                            variant="sub"
                            onStreamStatusChange={(live) => onStreamStatusChange(camera.id, live)}
                        />

                        {isLive && (
                            <div className="control-center-sub-camera-status">
                                <time
                                    className="control-center-sub-camera-timestamp"
                                    dateTime={timestamp.toISOString()}
                                >
                                    {timestampLabel}
                                </time>
                            </div>
                        )}

                        <Tooltip content="Switch to main view" relationship="label">
                            <span className="control-center-switch-hint">
                                <Maximize2 size={13} strokeWidth={2.25} aria-hidden="true" />
                            </span>
                        </Tooltip>

                        {
                            isLive && (
                                <div className="control-center-sub-camera-label">
                                    <span
                                        className={`control-center-status-dot ${isLive ? "control-center-status-dot--live" : "control-center-status-dot--offline"}`}
                                        role="img"
                                        aria-label={isLive ? "Stream active" : "No active stream"}
                                    />
                                    <span>{camera.id}</span>
                                    <strong>{camera.label}</strong>
                                </div>
                            )
                        }

                    </button>
                );
            })}
        </section>
    );
};

export default StreamSubVideo;