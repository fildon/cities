import { City } from "./city";
import { Vector } from "./vector";

export class Simulation {
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
