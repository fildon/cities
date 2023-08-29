import { City } from "./city";
import { Road } from "./road";
import { Vector } from "./vector";

export class Simulation {
  cities: Array<City> = [];
  roads: Array<Road> = [];
  private static TIME_BETWEEN_CITIES = 500;
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
        const newCity = new City(candidateLocation);
        // Add new roads for this new city
        this.roads = [
          ...this.roads,
          ...this.cities
            .filter(
              (city) =>
                city.location.distanceBetween(candidateLocation) <
                City.ROAD_DISTANCE
            )
            .map((city) => new Road(newCity, city)),
        ];
        this.cities.push(newCity);
      }
    }

    // TODO city size increase?
  }

  paintSelf(canvas: CanvasRenderingContext2D) {
    this.roads.forEach((road) => road.paintSelf(canvas));
    this.cities.forEach((city) => city.paintSelf(canvas));
  }
}
