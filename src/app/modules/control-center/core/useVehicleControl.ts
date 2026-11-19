import { useCallback, useEffect, useRef, useState } from "react";

export const SIREN_TONES = ["Wail", "Yelp", "Hi-Lo", "Phaser"] as const;
export const LIGHT_LEVELS = [1, 2, 3] as const;
export const MAX_VOLUME = 10;
export const PATTERN_COUNT = 6;

type Command =
    | "light"
    | "siren"
    | "sirenTone"
    | "horn"
    | "mic"
    | "volume"
    | "lightLevel"
    | "lightPattern"
    | "allOff";

/**
 * TODO: replace the body with your real device call, for example:
 *   const res = await fetch(`/api/vehicles/${vehicleCode}/commands`, {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ command, value }),
 *   });
 *   if (!res.ok) throw new Error("Command failed");
 */
async function sendCommand(vehicleCode: string, command: Command, value?: unknown) {
    console.log("[vehicle command]", vehicleCode, command, value);
    await new Promise((resolve) => window.setTimeout(resolve, 80));
}

export function useVehicleControls(vehicleCode: string) {
    const [lightOn, setLightOn] = useState(false);
    const [sirenOn, setSirenOn] = useState(false);
    const [hornOn, setHornOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [toneIndex, setToneIndex] = useState(0);
    const [volume, setVolume] = useState(5);
    const [lightLevel, setLightLevel] = useState<(typeof LIGHT_LEVELS)[number]>(1);
    const [pattern, setPattern] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Refs so hold-buttons never send duplicate on/off commands
    const hornRef = useRef(false);
    const micRef = useRef(false);

    // Optimistic update: apply immediately, roll back if the command fails
    const run = useCallback(
        async (command: Command, value: unknown, commit: () => void, rollback: () => void) => {
            commit();
            try {
                await sendCommand(vehicleCode, command, value);
                setError(null);
            } catch {
                rollback();
                setError("Command failed. Check the device connection.");
            }
        },
        [vehicleCode],
    );

    const toggleLight = () => {
        const next = !lightOn;
        void run("light", next, () => setLightOn(next), () => setLightOn(!next));
    };

    const toggleSiren = () => {
        const next = !sirenOn;
        void run("siren", next, () => setSirenOn(next), () => setSirenOn(!next));
    };

    const cycleTone = () => {
        const prev = toneIndex;
        const next = (prev + 1) % SIREN_TONES.length;
        void run("sirenTone", SIREN_TONES[next], () => setToneIndex(next), () => setToneIndex(prev));
    };

    const holdHorn = (on: boolean) => {
        if (hornRef.current === on) return;
        hornRef.current = on;
        void run("horn", on, () => setHornOn(on), () => {
            hornRef.current = !on;
            setHornOn(!on);
        });
    };

    const holdMic = (on: boolean) => {
        if (micRef.current === on) return;
        micRef.current = on;
        void run("mic", on, () => setMicOn(on), () => {
            micRef.current = !on;
            setMicOn(!on);
        });
    };

    const changeVolume = (delta: number) => {
        const prev = volume;
        const next = Math.min(MAX_VOLUME, Math.max(0, prev + delta));
        if (next === prev) return;
        void run("volume", next, () => setVolume(next), () => setVolume(prev));
    };

    const chooseLightLevel = (level: (typeof LIGHT_LEVELS)[number]) => {
        const prev = lightLevel;
        if (level === prev) return;
        void run("lightLevel", level, () => setLightLevel(level), () => setLightLevel(prev));
    };

    const changePattern = (delta: number) => {
        const prev = pattern;
        const next = ((prev - 1 + delta + PATTERN_COUNT) % PATTERN_COUNT) + 1;
        void run("lightPattern", next, () => setPattern(next), () => setPattern(prev));
    };

    const allOff = () => {
        hornRef.current = false;
        micRef.current = false;
        setLightOn(false);
        setSirenOn(false);
        setHornOn(false);
        setMicOn(false);
        sendCommand(vehicleCode, "allOff").then(
            () => setError(null),
            () => setError("Command failed. Check the device connection."),
        );
    };

    // Release horn and PA mic if the panel unmounts while held
    useEffect(() => {
        return () => {
            if (hornRef.current) void sendCommand(vehicleCode, "horn", false);
            if (micRef.current) void sendCommand(vehicleCode, "mic", false);
        };
    }, [vehicleCode]);

    return {
        lightOn, sirenOn, hornOn, micOn,
        tone: SIREN_TONES[toneIndex],
        volume, lightLevel, pattern, error,
        toggleLight, toggleSiren, cycleTone,
        holdHorn, holdMic,
        changeVolume, chooseLightLevel, changePattern,
        allOff,
    };
}