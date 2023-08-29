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
  /**
   * Whether this city is undergoing collapse
   */
  isCollapsing = false;
  constructor(readonly location: Vector) {}

  advanceByTime(time: number) {
    this.age += time;
    this.last_evolved += time;

    if (this.isCollapsing) {
      // It should take a while for a collapsing city to fully disappear
      this.animatedSize -= time / 10000;
      return;
    }

    if (time > 1000) {
      this.animatedSize = this.logicalSize;
    } else {
      // Interpolate the animated size towards the logical size
      this.animatedSize =
        this.animatedSize +
        (this.logicalSize - this.animatedSize) * (time / 1000);
    }
  }

  /**
   * A city should be removed when it has been collapsing,
   * and has completely withered away to nothing
   */
  shouldBeRemoved() {
    return this.isCollapsing && this.animatedSize <= 0;
  }

  isReadyToEvolve(neighbours: Array<City>) {
    if (this.isCollapsing) return false;

    // Must not have evolved recently
    if (this.last_evolved < 1000) return false;

    // Must have at least 3 connections cities larger or equal to this one
    if (
      neighbours.filter(
        (neighbour) => neighbour.logicalSize >= this.logicalSize
      ).length < 3
    )
      return false;

    // TODO this is "business logic" being influenced by framerate.
    // A purist would vomit
    return Math.random() < 0.05;
  }

  evolve() {
    this.logicalSize += 1;
    this.last_evolved = 0;
  }

  /**
   * A city is supported if it is either size 1
   * or it is connected to at least one city exactly one size lower
   */
  isSupported(neighbours: Array<City>) {
    if (this.logicalSize === 1) return true;
    return neighbours.some(
      (neighbour) =>
        !neighbour.isCollapsing &&
        neighbour.logicalSize === this.logicalSize - 1
    );
  }

  /**
   * Mark this city for collapse
   */
  collapse() {
    this.isCollapsing = true;
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
    canvas.fillStyle = this.isCollapsing
      ? // A collapsing city is grey
        "grey"
      : // Otherwise colour the city based on its size
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
