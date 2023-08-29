import { Vector } from "./vector";

export class City {
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
