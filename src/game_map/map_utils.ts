// https://github.com/TStand90/roguelike_tutorial_revised/
// blob/part3/map_objects/rectangle.py

// a basic rectangle with convenience functions
//
// this will represent a rectangle in a map
export class Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  // make a new rectangle in with the given coordinates and dimensions
  constructor(x: number, y: number, w: number, h: number) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
  }

  center(): [number, number] {
    const center_x = Math.floor((this.x1 + this.x2) / 2);
    const center_y = Math.floor((this.y1 + this.y2) / 2);

    return [center_x, center_y];
  }

  intersects(other: Rect): boolean {
    return this.x1 <= other.x2 && this.x2 >= other.x1 &&
      this.y1 <= other.y2 && this.y2 >= other.y1;
  }
}
