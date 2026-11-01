import * as ort from "onnxruntime-web";
import { preprocessFrame } from "./frameProcessor";

const MODEL_SIZE = 640;

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

/**
 * Run the model on a single video frame.
 * Returns the raw ONNX output tensor to be decoded with decodeYOLO().
 */
export const detectObjects = async (video) => {
    if (!session) {
        throw new Error("YOLO model is not loaded yet.");
    }

    const input = preprocessFrame(video);

    const tensor = new ort.Tensor(
        "float32",
        input,
        [1, 3, MODEL_SIZE, MODEL_SIZE]
    );

    const feeds = { [session.inputNames[0]]: tensor };

    const results = await session.run(feeds);

    // Return the first (and only) output tensor.
    return results[session.outputNames[0]];
};