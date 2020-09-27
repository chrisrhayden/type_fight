/** ~~stolen~~ inspired by the python roguelike_tutorial_revised
 * https://github.com/TStand90/roguelike_tutorial_revised/
 * blob/part3/map_objects/game_map.py
 *
 * this is basically as close as I could make it
 * tunnel h and v
 *
 * while create_room is check before it gets run the tunnel functions are not,
 * this is kinda nice as it is what makes levels look misshapen
 */

import {FeatureGenerator} from "../feature_generator";
import {Rect} from "../game_map/map_utils";
import {GameMap, TerrainData} from "../game_map/game_map";
import {GameTile} from "../tiles";
import {Scene} from "../scenes";
import {Entities} from "../entities";

export class BasicMap {
  // number tiles across
  map_width: number;
  // number tiles high
  map_height: number

  game_map: GameMap;

  max_rooms: number;

  min_room_size: number;
  max_room_size: number;

  // rely on feature_generator for rng and to make entity's
  feature_generator: FeatureGenerator;
  rng: FeatureGenerator["rng"];

  constructor(feature: FeatureGenerator, map_width: number, map_height: number) {
    this.feature_generator = feature;
    this.rng = this.feature_generator.rng;

    this.map_width = map_width;
    this.map_height = map_height;

    this.max_rooms = 100;

    this.min_room_size = 5;
    this.max_room_size = 10;

    this.game_map = new GameMap(this.map_width, this.map_height);

    for (let i = 0; i < this.game_map.data.length; ++i) {
      this.game_map.data[i] = new TerrainData(GameTile.WallOne, true);
    }
  }


  make_map(entities: Entities, scene: Scene): GameMap {
    const made_rooms: Rect[] = [];

    let num_rooms = 0;

    for (let r = 0; r < this.max_rooms; ++r) {
      const w = this.rng.getUniformInt(this.min_room_size, this.max_room_size);

      const h = this.rng.getUniformInt(this.min_room_size, this.max_room_size);

      const x = this.rng.getUniformInt(0, this.map_width - w - 1);

      const y = this.rng.getUniformInt(0, this.map_height - h - 1);

      const new_room = new Rect(x, y, w, h);

      let intersects = false;

      for (const r of made_rooms) {
        if (r.intersects(new_room)) {
          intersects = true;

          break;
        }
      }

      if (!intersects) {
        this.create_room(new_room);

        const [new_x, new_y] = new_room.center();

        if (num_rooms == 0) {
          const indx = new_x + (this.map_width * new_y);

          scene.player = entities.new_id();

          scene.components.position[scene.player] = indx;

        } else {
          const [prev_x, prev_y] = made_rooms[made_rooms.length - 1].center();

          if (this.rng.getUniform() > 0.5) {
            this.create_h_tunnel(prev_x, new_x, prev_y);
            this.create_v_tunnel(prev_y, new_y, new_x);

          } else {
            this.create_v_tunnel(prev_y, new_y, prev_x);
            this.create_h_tunnel(prev_x, new_x, new_y);
          }
        }

        made_rooms.push(new_room);

        num_rooms += 1;
      }
    }

    return this.game_map;
  }


  create_room(room: Rect): void {
    for (let x = room.x1 + 1; x < room.x2; ++x) {
      for (let y = room.y1 + 1; y < room.y2; ++y) {
        const indx = (x + (this.map_width * y));

        this.game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
      }
    }
  }


  create_h_tunnel(x1: number, x2: number, y: number): void {
    const x_min = Math.min(x1, x2);
    const x_max = Math.max(x1, x2);

    for (let x = x_min; x < x_max + 1; ++x) {
      const indx = (x + (this.map_width * y));

      this.game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }

  create_v_tunnel(y1: number, y2: number, x: number): void {
    const y_min = Math.min(y1, y2);
    const y_max = Math.max(y1, y2);

    for (let y = y_min; y < y_max + 1; ++y) {
      const indx = (x + (this.map_width * y));

      this.game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }
}
