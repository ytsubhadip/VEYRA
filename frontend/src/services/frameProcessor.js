const SIZE = 640;

export const preprocessFrame = (video) => {

    const canvas = document.createElement('canvas');

    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext('2d');

    // Resize video frame
    ctx.drawImage(video, 0, 0, SIZE, SIZE);

    const imageData = ctx.getImageData(
        0,
        0,
        SIZE,
        SIZE
    );

    const { data } = imageData;

    const input = new Float32Array(
        1 * 3 * SIZE * SIZE
    );

    for (let i = 0; i < SIZE * SIZE; i++) {

        input[i] = data[i * 4] / 255;

        input[i + SIZE * SIZE] =
            data[i * 4 + 1] / 255;

        input[i + 2 * SIZE * SIZE] =
            data[i * 4 + 2] / 255;
    }

    return input;
};