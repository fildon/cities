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
    // Note that this deliberately excludes the cities about to be created during this step.
    // Newly created cities will get advanced on the next frame.
    this.cities.forEach((city) => city.advanceByTime(time));

    this.timeToNextCity -= time;

    let qtyToCreate = 0;
    while (this.timeToNextCity < 0) {
      this.timeToNextCity += Simulation.TIME_BETWEEN_CITIES;
      qtyToCreate += 1;
    }

    this.createNewCities(qtyToCreate);

    this.evolveCities();
  }

  private roadsForCity(city: City) {
    return this.roads.filter((road) => road.isMember(city));
  }

  private evolveCities() {
    const citiesToEvolve = this.cities.filter((city) =>
      city.isReadyToEvolve(this.roadsForCity(city))
    );

    citiesToEvolve.forEach((city) => city.evolve());

    // Remove outgrown roads
    this.roads = this.roads.filter((road) => !road.isOutgrown());
  }

  private createNewCities(qtyToCreate: number) {
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

        const citiesToConnectTo = this.cities.filter(
          (city) =>
            city.location.distanceBetween(candidateLocation) <
            City.ROAD_DISTANCE
        );

        const newRoads = citiesToConnectTo.map(
          (city) => new Road(newCity, city)
        );

        if (newRoads.length > 0) {
          this.roads = [...this.roads, ...newRoads];
        }

        this.cities.push(newCity);
      }
    }
  }

  paintSelf(canvas: CanvasRenderingContext2D) {
    this.roads.forEach((road) => road.paintSelf(canvas));
    this.cities.forEach((city) => city.paintSelf(canvas));
  }
}
