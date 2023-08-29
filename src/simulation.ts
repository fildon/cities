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

    this.collapseCities();

    this.cleanDeadCities();
  }

  /**
   * A city is dead when it should be fully removed from the simulation
   */
  private cleanDeadCities() {
    const citiesToRemove = new Set(
      this.cities.filter((city) => city.shouldBeRemoved())
    );
    if (citiesToRemove.size === 0) return;

    this.cities = this.cities.filter((city) => !citiesToRemove.has(city));
    // Remove associated roads
    this.roads = this.roads.filter(
      (road) => !citiesToRemove.has(road.start) && !citiesToRemove.has(road.end)
    );
  }

  private neighboursForCity(city: City) {
    return this.roads.flatMap((road) =>
      // If the city we want is at the start, the neighbour is at the end
      // or vice versa
      road.start === city ? road.end : road.end === city ? road.start : []
    );
  }

  /**
   * Cities collapse when they are no longer supported
   */
  private collapseCities() {
    this.cities
      .filter((city) => !city.isSupported(this.neighboursForCity(city)))
      .forEach((city) => city.collapse());
  }

  private evolveCities() {
    const citiesToEvolve = this.cities.filter((city) =>
      city.isReadyToEvolve(this.neighboursForCity(city))
    );

    citiesToEvolve.forEach((city) => city.evolve());

    // TODO create new roads based on new city range

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
