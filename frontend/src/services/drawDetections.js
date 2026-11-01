const MODEL_SIZE = 640;

/**
 * Draw detection boxes and labels onto the overlay canvas.
 *
 * Detections come back in the model's 640x640 coordinate space, but the
 * canvas is sized to match the displayed video. We scale each coordinate
 * so the boxes line up with what the user actually sees.
 *
 * @param {HTMLCanvasElement} canvas  overlay canvas (sized to the video)
 * @param {Array} detections          decoded detections in 640x640 space
 * @param {object} [options]
 * @param {boolean} [options.mirror]  mirror horizontally (front camera)
 */
export function drawDetections(canvas, detections, options = {}) {
  if (!canvas) return;

  const { mirror = false } = options;
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!detections || detections.length === 0) return;

  const scaleX = w / MODEL_SIZE;
  const scaleY = h / MODEL_SIZE;

  detections.forEach((detection) => {
    const { x1, y1, x2, y2, label, confidence } = detection;

    // Scale model-space coordinates to the display canvas.
    let dx1 = x1 * scaleX;
    let dx2 = x2 * scaleX;
    const dy1 = y1 * scaleY;
    const dy2 = y2 * scaleY;

    // When the video is mirrored (front camera), flip x so the box
    // tracks the subject instead of appearing on the wrong side.
    if (mirror) {
      const mx1 = w - dx2;
      const mx2 = w - dx1;
      dx1 = mx1;
      dx2 = mx2;
    }

    const boxW = dx2 - dx1;
    const boxH = dy2 - dy1;

    // Bounding box
    ctx.strokeStyle = "#00FF88";
    ctx.lineWidth = 3;
    ctx.strokeRect(dx1, dy1, boxW, boxH);

    // Label background
    const text = `${label} ${(confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 16px Arial";
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = "#00AA66";
    ctx.fillRect(dx1, Math.max(0, dy1 - 25), textWidth + 12, 25);

    // Label text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, dx1 + 6, Math.max(17, dy1 - 7));
  });
}
