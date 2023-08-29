const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

const canvasElement = document.querySelector("canvas")!;
const canvasContext = canvasElement.getContext("2d")!;

class Vector {
  constructor(public x: number, public y: number) {}

  distanceBetween(other: Vector) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }
}

class City {
  /**
   * Radius of clear space required around a city
   */
  public static REQUIRED_SPACE = 100;
  /**
   * The size of the city as used by system logic.
   * Can increase only in discrete integer values.
   */
  size = 1;
  /**
   * The age of this city as measured in milliseconds
   */
  age = 0;
  constructor(readonly location: Vector) {}

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
    canvasRef.arc(
      this.location.x,
      this.location.y,
      City.REQUIRED_SPACE,
      0,
      2 * Math.PI
    );
    canvasRef.fillStyle = `rgba(0, 255, 0, ${animatedSize / 10})`;
    canvasRef.fill();

    canvasRef.beginPath();
    canvasRef.arc(
      this.location.x,
      this.location.y,
      animatedSize * 10,
      0,
      2 * Math.PI
    );
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

      /**
       * Avoid building where it is too crowded.
       * Note this this silently drops candidates which are too crowded.
       */
      const candidateLocation = new Vector(
        this.width * Math.random(),
        this.height * Math.random()
      );
      if (
        this.cities.every(
          (city) =>
            candidateLocation.distanceBetween(city.location) >
            City.REQUIRED_SPACE
        )
      ) {
        this.cities.push(new City(candidateLocation));
      }
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

  simulation.advanceByTime(elapsed);

  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  simulation.paintSelf(canvasContext);

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
