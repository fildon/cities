export class Vector {
  constructor(public x: number, public y: number) {}

  distanceBetween(other: Vector) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }
}
