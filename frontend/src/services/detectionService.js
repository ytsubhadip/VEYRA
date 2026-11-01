import * as ort from "onnxruntime-web";

let session = null;

export const loadYOLOModel = async () => {
    try {
        console.log("Loading Veyra AI model...");

        session = await ort.InferenceSession.create(
            "/models/yolo11n.onnx",
            {
                executionProviders: ["wasm"],
            }
        );

        console.log("YOLO model loaded successfully!");

        console.log("Input names:", session.inputNames);
        console.log("Output names:", session.outputNames);

        console.log(
            "Input shape:",
            session.inputMetadata
        );

        return session;

    } catch (error) {
        console.error("YOLO model loading failed:", error);
        throw error;
    }
};

export const getYOLOSession = () => session;