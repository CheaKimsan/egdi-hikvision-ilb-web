// modules/control-center/components/StreamGpsOverlay.tsx
import { Satellite } from "lucide-react";
import { GpsStatus } from "../core/useGpsStatus";

type StreamGpsOverlayProps = {
    gps?: GpsStatus;
    speedLimitKph?: number; // "Speed Limit of Alarm" from the device settings
};

const formatCoord = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`;

const StreamGpsOverlay: React.FC<StreamGpsOverlayProps> = ({ gps, speedLimitKph = 100 }) => {
    const hasFix = gps && gps.state !== "failed";
    const isOverLimit = hasFix && gps.speedKph > speedLimitKph;

    return (
        <div
            className={`gps-overlay ${isOverLimit ? "gps-overlay--alert" : ""}`}
            role="status"
            aria-label={
                hasFix
                    ? `Device speed ${gps.speedKph} kilometers per hour`
                    : "GPS signal unavailable"
            }
        >
            <div className="gps-overlay-speed">
                <strong>{hasFix ? gps.speedKph : "--"}</strong>
                <span>km/h</span>
            </div>

            <div className="gps-overlay-meta">
                <span className="gps-overlay-state">
                    <Satellite size={13} aria-hidden="true" />
                    {hasFix ? `${gps.satellites} sats · ±${gps.accuracy}` : "No GPS fix"}
                </span>
                {hasFix && (
                    <span className="gps-overlay-coords">
                        {formatCoord(gps.latitude, "N", "S")}
                        <br />
                        {formatCoord(gps.longitude, "E", "W")}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StreamGpsOverlay;