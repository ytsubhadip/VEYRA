
const COCO_CLASSES = [
  "person", "bicycle", "car", "motorcycle", "airplane",
  "bus", "train", "truck", "boat", "traffic light",
  "fire hydrant", "stop sign", "parking meter", "bench",
  "bird", "cat", "dog", "horse", "sheep", "cow",
  "elephant", "bear", "zebra", "giraffe", "backpack",
  "umbrella", "handbag", "tie", "suitcase", "frisbee",
  "skis", "snowboard", "sports ball", "kite",
  "baseball bat", "baseball glove", "skateboard",
  "surfboard", "tennis racket", "bottle", "wine glass",
  "cup", "fork", "knife", "spoon", "bowl", "banana",
  "apple", "sandwich", "orange", "broccoli", "carrot",
  "hot dog", "pizza", "donut", "cake", "chair", "couch",
  "potted plant", "bed", "dining table", "toilet", "tv",
  "laptop", "mouse", "remote", "keyboard", "cell phone",
  "microwave", "oven", "toaster", "sink", "refrigerator",
  "book", "clock", "vase", "scissors", "teddy bear",
  "hair drier", "toothbrush"
];

const CONFIDENCE_THRESHOLD = 0.35;
const IOU_THRESHOLD = 0.45;

function calculateIoU(a, b) {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);

  const intersection =
    Math.max(0, x2 - x1) * Math.max(0, y2 - y1);

  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);

  return intersection / (areaA + areaB - intersection + 1e-6);
}

function applyNMS(boxes) {
  const selected = [];

  // Suppress overlapping boxes of the same class.
  const classes = [...new Set(boxes.map(b => b.classId))];

  for (const classId of classes) {
    const candidates = boxes
      .filter(b => b.classId === classId)
      .sort((a, b) => b.confidence - a.confidence);

    while (candidates.length) {
      const best = candidates.shift();
      selected.push(best);

      for (let i = candidates.length - 1; i >= 0; i--) {
        if (calculateIoU(best, candidates[i]) > IOU_THRESHOLD) {
          candidates.splice(i, 1);
        }
      }
    }
  }

  return selected;
}

export function decodeYOLO(output) {
  const data = output.data ?? output.cpuData;
  const [batch, channels, candidates] = output.dims;

  if (batch !== 1 || channels !== 84) {
    throw new Error(
      `Unexpected YOLO output shape: ${output.dims}`
    );
  }

  const boxes = [];

  for (let i = 0; i < candidates; i++) {
    let maxScore = 0;
    let classId = -1;

    // First 4 channels are box coordinates.
    // Remaining 80 channels are class scores.
    for (let c = 4; c < channels; c++) {
      const score = data[c * candidates + i];

      if (score > maxScore) {
        maxScore = score;
        classId = c - 4;
      }
    }

    if (maxScore < CONFIDENCE_THRESHOLD) continue;

    const cx = data[i];
    const cy = data[candidates + i];
    const width = data[2 * candidates + i];
    const height = data[3 * candidates + i];

    boxes.push({
      x1: Math.max(0, cx - width / 2),
      y1: Math.max(0, cy - height / 2),
      x2: Math.min(640, cx + width / 2),
      y2: Math.min(640, cy + height / 2),
      confidence: maxScore,
      classId,
      label: COCO_CLASSES[classId]
    });
  }

  return applyNMS(boxes);
}
