import { useEffect, useState } from "react";
import { loadYOLOModel } from "../services/detectionService";

function ModelLoader() {
    const [status, setStatus] = useState("Loading model...");

    useEffect(() => {
        const initializeModel = async () => {
            try {
                await loadYOLOModel();
                setStatus("YOLO model loaded successfully!");
            } catch (error) {
                setStatus("Failed to load YOLO model");
            }
        };

        initializeModel();
    }, []);

    return (
        <div>
            <h3>Veyra AI Engine</h3>
            <p>{status}</p>
        </div>
    );
}

export default ModelLoader;