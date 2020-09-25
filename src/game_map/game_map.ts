/** a basic map class
 *
 * this just contains the map tiles and the basic data t work with the map
 */
import {GameTile} from "../tiles";
import {GameOpts} from "../main";

class FovData {
  // if the tile is currently visible
  visible: boolean;
  // if the tile has been visited before
  visited: boolean;
}


/** a given peace of terrain
 *
 * this setup will allow us to no bother carrying a lot of terrain data around
 * and just make a new entity when we need to
 */
class TerrainData {
  id: number;
  tile: GameTile;
}

/** the map tile data
 *
 * we are grouping fov data with map data as the map will always fill the screen
 * making it convent to use one data structure for everything

 * set all terrain id's to 0 as we dont need to associate them with other data
 * until the player changes the terrain, this will make if convent to use the
 * flyweight pattern https://gameprogrammingpatterns.com/flyweight.html
 *
 * if a map tile changes to the point the data layout does not work then it
 * should be replaced with a "Nothing" tile and a new entity should be made to
 * take its place
 */
export class MapTile {
  fov_data: FovData;
  terrain_data: TerrainData;

  constructor(tile: GameTile, visible: boolean) {
    this.fov_data = {
      visible,
      visited: false,
    };

    this.terrain_data = {
      id: 0,
      tile,
    };
  }
}

/** a basic container for map data */
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
