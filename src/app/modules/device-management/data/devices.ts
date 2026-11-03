import type { ManagedDevice } from "../core/model";

export const dummyDevices: ManagedDevice[] = [
    {
        id: "DEV-0255",
        name: "Embedded Terminal Server",
        deviceNumber: 255,
        type: "Terminal Server",
        model: "DS-TP50-09I",
        serialNumber: "Not available",
        firmwareVersion: "V5.6.2 build 260905 15:27:59 r135279",
        encodingVersion: "V5.6.0 118358 build 260818 14:57:42",
        webVersion: "V4.0.1.105151 build 260905",
        pluginVersion: "V4.0.2608.1",
        channelCount: 1,
        hddCount: 1,
        alarmInputCount: 2,
        alarmOutputCount: 1,
        status: "active",
        updatedAt: "2026-11-03T08:30:00.000Z",
    },
];
