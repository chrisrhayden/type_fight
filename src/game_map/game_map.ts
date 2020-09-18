/** GameTile corresponds to the placement in the sprite map */
export enum GameTile {
  Nothing = 0,
  GrassOne = 5,
  GrassTwo = 6,
  GrassThree = 7,
  WallOne = 826,
}

export class GameMap {
  // the size of the map in tiles
  width: number;
  height: number;

  tiles: GameTile[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // dont fill with anything and let the map generators do that
    this.tiles = Array(this.width * this.height);
  }
}
