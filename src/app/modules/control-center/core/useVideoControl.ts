import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export function useVideoControls(containerRef: RefObject<HTMLElement | null>, cameraId: string) {
    const [zoom, setZoom] = useState(1);
    const [muted, setMuted] = useState(true);
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const getVideo = useCallback(
        () => containerRef.current?.querySelector("video") ?? null,
        [containerRef]
    );

    // Zoom
    useEffect(() => {
        const video = getVideo();
        if (!video) return;
        video.style.transform = `scale(${zoom})`;
        video.style.transformOrigin = "center center";
        video.style.transition = "transform 0.2s ease";
    }, [zoom, getVideo]);

    // Audio
    useEffect(() => {
        const video = getVideo();
        if (video) video.muted = muted;
    }, [muted, getVideo]);

    // Record timer
    useEffect(() => {
        if (!recording) {
            setSeconds(0);
            return;
        }
        const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => window.clearInterval(timer);
    }, [recording]);

    // Stop recording if the component unmounts
    useEffect(() => {
        return () => {
            if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        };
    }, []);

    const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
    const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
    const resetZoom = () => setZoom(1);
    const toggleMute = () => setMuted((m) => !m);

    const snapshot = () => {
        const video = getVideo();
        if (!video || !video.videoWidth) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) download(blob, `${cameraId}-${stamp()}.png`);
            }, "image/png");
        } catch {
            console.error("Snapshot blocked (stream is cross-origin without CORS headers).");
        }
    };

    const toggleRecording = () => {
        if (recording) {
            recorderRef.current?.stop();
            setRecording(false);
            return;
        }
        const video = getVideo() as (HTMLVideoElement & {
            captureStream?: () => MediaStream;
            mozCaptureStream?: () => MediaStream;
        }) | null;
        const stream = video?.captureStream?.() ?? video?.mozCaptureStream?.();
        if (!stream || typeof MediaRecorder === "undefined") return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
            download(new Blob(chunksRef.current, { type: "video/mp4" }), `${cameraId}-${stamp()}.mp4`);
        };
        recorder.start(1000);
        recorderRef.current = recorder;
        setRecording(true);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (document.fullscreenElement) void document.exitFullscreen();
        else void el.requestFullscreen();
    };

    return {
        zoom, muted, recording, seconds,
        zoomIn, zoomOut, resetZoom, toggleMute,
        snapshot, toggleRecording, toggleFullscreen,
    };
}