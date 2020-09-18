/** GameTile corresponds to the placement in the sprite map */
export enum GameTile {
  Nothing = 0,
  GrassOne = 5,
  GrassTwo = 6,
  GrassThree = 7,
  WallOne = 826,
}

export class GameMap {
  width: number;
  height: number;

  tiles: GameTile[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.tiles = Array(this.width * this.height).fill(GameTile.WallOne);
  }
}
