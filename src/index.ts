const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

const canvasElement = document.querySelector("canvas")!;
const canvasContext = canvasElement.getContext("2d")!;

const paintRedOrb = (nowTimestamp: number) => {
  const timeParam = nowTimestamp / 10;
  canvasContext.beginPath();
  canvasContext.arc(
    timeParam % CANVAS_WIDTH,
    timeParam % CANVAS_HEIGHT,
    10,
    0,
    2 * Math.PI
  );
  canvasContext.fillStyle = "red";
  canvasContext.fill();
};

let lastFrame: number | undefined;
const step = (now: number) => {
  if (!lastFrame) lastFrame = now;
  const elapsed = now - lastFrame;
  lastFrame = now;

  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  paintRedOrb(now);

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
