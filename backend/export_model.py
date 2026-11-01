from ultralytics import YOLO

# Load pretrained YOLO11 Nano
model = YOLO("yolo11n.pt")

# Export to ONNX
model.export(
    format="onnx",
    imgsz=640,
    simplify=True,
    opset=17
)

print("YOLO model exported successfully!")