import { Simulation } from "./simulation";

const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

const canvasElement = document.querySelector("canvas")!;
const canvasContext = canvasElement.getContext("2d")!;

const simulation = new Simulation(1000, 1000);

let lastFrame: number | undefined;
const step = (now: number) => {
  if (!lastFrame) lastFrame = now;
  const elapsed = now - lastFrame;
  lastFrame = now;

  simulation.advanceByTime(elapsed);

  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  simulation.paintSelf(canvasContext);

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
