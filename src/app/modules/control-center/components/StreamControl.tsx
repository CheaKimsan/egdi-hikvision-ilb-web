import { Tooltip } from "@fluentui/react-components";
import {
    Camera, Circle, Maximize, Megaphone, MicSignal, RotateCcw, Square, Volume2, VolumeX, ZoomIn, ZoomOut,
} from "lucide-react";
import { useVideoControls } from "../core/useVideoControl";

type Props = {
    controls: ReturnType<typeof useVideoControls>;
    isLive: boolean;
};

type BtnProps = {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    danger?: boolean;
    children: React.ReactNode;
};

// const fmt = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const Btn: React.FC<BtnProps> = ({ label, onClick, disabled, active, danger, children }) => (
    <Tooltip content={label} relationship="label" positioning="before">
        <button
            type="button"
            className={[
                "stream-controls-btn",
                active ? "stream-controls-btn--active" : "",
                danger ? "stream-controls-btn--danger" : "",
            ].join(" ")}
            onClick={onClick}
            disabled={disabled}
            aria-pressed={active}
        >
            {children}
        </button>
    </Tooltip>
);

const StreamControls: React.FC<Props> = ({ controls: c, isLive }) => (
    <aside className="stream-controls" role="toolbar" aria-label="Camera controls">

        <div className="stream-controls-zoom">
            <span className="stream-controls-zoom-value">{c.zoom.toFixed(2)}</span>
            <span className="stream-controls-zoom-unit">x</span>
        </div>

        <div className="stream-controls-divider" />

        <div className="stream-controls-grid">
            <Btn
                label={c.recording ? "Stop recording" : "Record"}
                onClick={c.toggleRecording}
                disabled={!isLive}
                active={c.recording}
                danger
            >
                {c.recording ? <Square size={16} /> : <Circle size={16} />}
            </Btn>
            <Btn label="Snapshot" onClick={c.snapshot} disabled={!isLive}>
                <Camera size={16} />
            </Btn>

            <Btn label="sound" disabled={!isLive}>
                <Megaphone size={16} />
            </Btn>

            <Btn label="microphone" disabled={!isLive}>
                <MicSignal size={16} />
            </Btn>

            <Btn label="Zoom in" onClick={c.zoomIn} disabled={!isLive || c.zoom >= 4}>
                <ZoomIn size={16} />
            </Btn>
            <Btn label="Zoom out" onClick={c.zoomOut} disabled={!isLive || c.zoom <= 1}>
                <ZoomOut size={16} />
            </Btn>

            <Btn label="Reset zoom" onClick={c.resetZoom} disabled={!isLive || c.zoom === 1}>
                <RotateCcw size={16} />
            </Btn>
            <Btn label={c.muted ? "Unmute" : "Mute"} onClick={c.toggleMute} disabled={!isLive} active={!c.muted}>
                {c.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Btn>

            <Btn label="Red/Blue" disabled={!isLive}>
                <span>L1</span>
            </Btn>
            <Btn label="Off" disabled={!isLive}>
                <span>L2</span>
            </Btn>
        </div>

        <div className="stream-controls-divider" />

        <Btn label="Fullscreen" onClick={c.toggleFullscreen}>
            <Maximize size={16} />
        </Btn>
    </aside>
);

export default StreamControls;