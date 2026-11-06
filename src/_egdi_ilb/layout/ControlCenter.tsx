import Header from "./components/Header";
import demoVideo from "../assets/video/dummy_video.mp4";

type CameraFeed = {
    id: string;
    label: string;
    location: string;
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-right";
};

const cameraFeeds: CameraFeed[] = [
    { id: "CAM-01", label: "Main Entrance", location: "North Gate" },
    { id: "CAM-02", label: "Vehicle Inspection", location: "Inspection Lane", position: "top-left" },
    { id: "CAM-03", label: "Arrival Lane", location: "Inbound", position: "top-right" },
    { id: "CAM-04", label: "Departure Lane", location: "Outbound", position: "bottom-left" },
    { id: "CAM-05", label: "Vehicle Parking", location: "Parking Area", position: "bottom-right" },
    { id: "CAM-06", label: "Perimeter", location: "East Boundary", position: "top-center" },
];

const ControlCenter: React.FC = () => {
    const [mainCamera, ...subCameras] = cameraFeeds;

    return (
        <div className="control-center-shell">
            <Header />
            <main className="control-center-monitor" aria-label="Camera monitoring">
                <video
                    className="control-center-main-camera"
                    src={demoVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label={`${mainCamera.label} main camera feed`}
                />
                <div className="control-center-main-label">
                    <span className="control-center-status-dot" />
                    <span>{mainCamera.id}</span>
                    <strong>{mainCamera.label}</strong>
                    <span>{mainCamera.location}</span>
                </div>
                <span className="control-center-feed-count">
                    <span className="control-center-status-dot" />
                    {cameraFeeds.length} demo feeds
                </span>
                <section className="control-center-sub-cameras" aria-label="Other camera feeds">
                    {subCameras.map((camera) => (
                        <article
                            className={`control-center-sub-camera control-center-sub-camera--${camera.position}`}
                            key={camera.id}
                        >
                            <video
                                src={demoVideo}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                aria-label={`${camera.label} demo video feed`}
                            />
                            <div className="control-center-sub-camera-label">
                                <span className="control-center-status-dot" />
                                <span>{camera.id}</span>
                                <strong>{camera.label}</strong>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default ControlCenter;