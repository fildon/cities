const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

const canvasElement = document.querySelector("canvas")!;
const canvasContext = canvasElement.getContext("2d")!;

class City {
  /**
   * The size of the city as used by system logic.
   * Can increase only in discrete integer values.
   */
  size = 1;
  /**
   * The age of this city as measured in milliseconds
   */
  age = 0;
  constructor(readonly x: number, readonly y: number) {}

  advanceByTime(time: number) {
    this.age += time;
  }

  paintSelf(canvasRef: CanvasRenderingContext2D) {
    /**
     * We do some maths here to get the appearance of the city growing up to its logical size.
     * The aim is to have a smooth monotonic function that approaches the logical size over time.
     *
     * TODO animation will jump when size does
     */
    const animatedSize =
      (this.size * Math.atan(this.age / 1000)) / (Math.PI / 2);

    canvasRef.beginPath();
    canvasRef.arc(this.x, this.y, animatedSize * 10, 0, 2 * Math.PI);
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

    // TODO something smarter to clean up over time
    while (this.cities.length > 100) {
      this.cities = this.cities.slice(1);
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
