const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

const canvasElement = document.querySelector("canvas")!;
const canvasContext = canvasElement.getContext("2d")!;

class City {
  /**
   * The size of the city as used by system logic.
   * Can increase in discrete integer values.
   */
  logicalSize = 1;
  /**
   * The size of the city for the purposes of animation.
   * Starts at zero, but rises smoothly over time to meet the logical size.
   */
  animatedSize = 0;
  constructor(readonly x: number, readonly y: number) {}

  advanceByTime(time: number) {
    this.animatedSize = Math.min(
      this.logicalSize,
      // Takes one second to increase animatedSize by 1
      this.animatedSize + time / 1000
    );
  }

  paintSelf(canvasRef: CanvasRenderingContext2D) {
    canvasRef.beginPath();
    canvasRef.arc(this.x, this.y, this.animatedSize * 10, 0, 2 * Math.PI);
    canvasRef.fillStyle = "blue";
    canvasRef.fill();
  }
}

class Simulation {
  cities: Array<City> = [];
  private static TIME_BETWEEN_CITIES = 1000;
  /**
   * Milliseconds until the next city spawn
   */
  timeToNextCity = 1000;
  constructor(private width: number, private height: number) {}

  advanceByTime(time: number) {
    // Advance all existing cities by time.
    // Note that this deliberately excludes the cities about to be created from time passing for this step.
    // Newly created cities will get advanced on the next frame.
    this.cities.forEach((city) => city.advanceByTime(time));

    this.timeToNextCity -= time;

    let qtyToCreate = 0;
    while (this.timeToNextCity < 0) {
      this.timeToNextCity += Simulation.TIME_BETWEEN_CITIES;
      qtyToCreate += 1;
    }

    while (qtyToCreate > 0) {
      qtyToCreate -= 1;
      // TODO avoid building where it is too crowded
      this.cities.push(
        new City(this.width * Math.random(), this.height * Math.random())
      );
    }
  }

  paintSelf(canvasRef: CanvasRenderingContext2D) {
    this.cities.forEach((city) => city.paintSelf(canvasRef));
  }
}

const simulation = new Simulation(1000, 1000);
let lastFrame: number | undefined;
const step = (now: number) => {
  if (!lastFrame) lastFrame = now;
  const elapsed = now - lastFrame;
  lastFrame = now;

  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  simulation.advanceByTime(elapsed);
  simulation.paintSelf(canvasContext);

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
