import demoVideo from "../assets/video/dummy_video.mp4";
import demoVideo2 from "../assets/video/dummy_video2.mp4";


export type CameraFeed = {
    id: string;
    label: string;
    location: string;
    src?: string;
};

export const cameraFeeds: CameraFeed[] = [
    { id: "CAM-01", label: "Main Entrance", location: "North Gate", src: demoVideo },
    { id: "CAM-02", label: "Vehicle Inspection", location: "Inspection Lane", src: demoVideo2 },
    { id: "CAM-03", label: "Arrival Lane", location: "Inbound" },
    { id: "CAM-04", label: "Departure Lane", location: "Outbound" },
    { id: "CAM-05", label: "Vehicle Parking", location: "Parking Area" },
    { id: "CAM-06", label: "Perimeter", location: "East Boundary" },
];


