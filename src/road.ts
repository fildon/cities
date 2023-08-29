import { City } from "./city";

export class Road {
  private created_at: number;
  constructor(public start: City, public end: City) {
    this.created_at = performance.now();
  }

  isMember(city: City) {
    return [this.start, this.end].includes(city);
  }

  isMutual() {
    return this.start.logicalSize === this.end.logicalSize;
  }

  /**
   * A road becomes outgrown when it connects cities which differ in size too greatly
   */
  isOutgrown() {
    return Math.abs(this.start.logicalSize - this.end.logicalSize) > 1;
  }

  /**
   * The size of the smallest city connected to this road
   */
  getSmallest() {
    return Math.min(this.start.logicalSize, this.end.logicalSize);
  }

  paintSelf(canvas: CanvasRenderingContext2D) {
    const age = performance.now() - this.created_at;
    const matured = age > 1000;
    /**
     * 0-1 of how complete this animation is
     */
    const animationParam = matured ? 1 : age / 1000;
    const lineWidth = 2 * animationParam;
    const opacity = animationParam / 2;

    canvas.beginPath();
    canvas.moveTo(this.start.location.x, this.start.location.y);
    canvas.lineWidth = lineWidth;
    canvas.lineCap = "round";
    canvas.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    canvas.lineTo(this.end.location.x, this.end.location.y);
    canvas.stroke();
  }
}
