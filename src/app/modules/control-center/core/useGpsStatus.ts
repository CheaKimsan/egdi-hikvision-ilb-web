// modules/control-center/hooks/useGpsStatus.ts
import { useQuery } from "@tanstack/react-query";

export type GpsStatus = {
    speedKph: number;
    latitude: number;
    longitude: number;
    satellites: number;
    accuracy: number; // HDOP
    state: "normal" | "weak" | "failed";
};

// Replace with a real call, e.g. fetch(`/api/devices/${deviceId}/gps`)
const fetchGpsStatus = async (): Promise<GpsStatus> => ({
    speedKph: Math.round(40 + Math.random() * 70),
    latitude: 11.5564,
    longitude: 104.9282,
    satellites: 10,
    accuracy: 0.8,
    state: "normal",
});

export const useGpsStatus = (deviceId: string) =>
    useQuery({
        queryKey: ["gps", deviceId],
        queryFn: fetchGpsStatus,
        refetchInterval: 1000, // update every second
        staleTime: 0,
    });