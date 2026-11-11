import { LocateFixed } from "lucide-react";

type StreamFeedSummaryProps = {
    cameraCount: number;
    location: string;
    activeCount: number;
    offlineCount: number;
};

const StreamFeedSummary: React.FC<StreamFeedSummaryProps> = ({
    cameraCount,
    location,
    activeCount,
    offlineCount,
}) => (
    <div
        className="control-center-feed-summary"
        role="status"
        aria-label={`${cameraCount} cameras, ${activeCount} streams active, ${offlineCount} offline`}
    >
        <div className="control-center-feed-summary-model">
            <span className={`control-center-status-dot ${activeCount > 0 ? "control-center-status-dot--live" : "control-center-status-dot--offline"}`} />
            <strong>TVJ860-GIR</strong>
        </div>
        <span className="control-center-feed-summary-divider" />
        <div className="control-center-feed-summary-metric flex gap-2 items-center justify-center">
            <LocateFixed size={16} aria-hidden="true" />
            <strong>{location}</strong>
        </div>

        <span className="control-center-feed-summary-divider" />

        <div className="control-center-feed-summary-metric control-center-feed-summary-metric--online">
            <strong className="mx-1">{activeCount}</strong>
            <strong>Online</strong>
        </div>
        <span className="control-center-feed-summary-divider" />

        <div className="control-center-feed-summary-metric control-center-feed-summary-metric--offline">
            <strong className="mx-1">{offlineCount}</strong>
            <strong>Offline</strong>
        </div>
    </div>
);

export default StreamFeedSummary;