/** a basic map class
 *
 * this just contains the map tiles and the basic data t work with the map
 */
import {GameTile} from "../tiles";

/** a given peace of terrain
 *
 * this setup will allow us to no bother carrying a lot of terrain data around
 * and just make a new entity when we need to
 */
export class TerrainData {
  id: number;
  tile: GameTile;
  blocks: boolean;
  // if the tile has been visited before
  visited: boolean;
  // if the tile is in view
  visible: boolean;

  constructor(tile: GameTile, canSee: boolean) {
    this.id = 0;
    this.tile = tile;
    this.blocks = canSee;
    this.visible = false;
    this.visited = false;
  }
}

/** a basic container for map data */
export class GameMap {
  // the size of the map in tiles
  width: number;
  height: number;

  data: TerrainData[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // dont fill with anything and let the map generators do that
    this.data = Array(this.width * this.height);
  }
}
