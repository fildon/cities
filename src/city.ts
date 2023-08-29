import { Road } from "./road";
import { Vector } from "./vector";

export class City {
  /**
   * Radius of clear space required around a city
   */
  public static REQUIRED_SPACE = 50;
  /**
   * The maximum distance over which a city will connect by road to another city
   */
  public static ROAD_DISTANCE = 100;
  /**
   * The size of the city as used by system logic.
   * Can increase only in discrete integer values.
   */
  logicalSize = 1;
  /**
   * The size as used by animation.
   * Tends to the logical size over time, but can only increase smoothly.
   */
  animatedSize = 0;
  /**
   * The age of this city as measured in milliseconds
   */
  age = 0;
  /**
   * How long since the city last evolved in milliseconds
   */
  last_evolved = 0;
  constructor(readonly location: Vector) {}

  advanceByTime(time: number) {
    this.age += time;
    this.last_evolved += time;

    if (time > 1000) {
      this.animatedSize = this.logicalSize;
    } else {
      // Interpolate the animated size towards the logical size
      this.animatedSize =
        this.animatedSize +
        (this.logicalSize - this.animatedSize) * (time / 1000);
    }
  }

  isReadyToEvolve(connectedRoads: Array<Road>) {
    // Must not have evolved recently
    if (this.last_evolved < 1000) return false;

    // Must have at least 3 connections with equal sized cities
    if (connectedRoads.filter((road) => road.isMutual()).length < 3)
      return false;

    // TODO this is "business logic" being influenced by framerate.
    // A purist would vomit
    return Math.random() < 0.05;
  }

  evolve() {
    this.logicalSize += 1;
    this.last_evolved = 0;
  }

  paintSelf(canvas: CanvasRenderingContext2D) {
    canvas.beginPath();
    canvas.arc(
      this.location.x,
      this.location.y,
      this.animatedSize * 5,
      0,
      2 * Math.PI
    );
    // Colour the city based on its size
    canvas.fillStyle =
      ["green", "yellow", "orange", "red"][this.logicalSize - 1] ?? "red";
    canvas.fill();

    canvas.beginPath();
    canvas.arc(
      this.location.x,
      this.location.y,
      this.animatedSize * 5,
      0,
      2 * Math.PI
    );
    canvas.strokeStyle = "black";
    canvas.lineWidth = 1;
    canvas.stroke();
  }
}
