import {GameTile} from "../tiles";

export class MapTile {
  visible: boolean;
  blocks: boolean;
  tile: GameTile;
}

export class GameMap {
  // the size of the map in tiles
  width: number;
  height: number;

  tiles: MapTile[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // dont fill with anything and let the map generators do that
    this.tiles = Array(this.width * this.height);
  }
}
