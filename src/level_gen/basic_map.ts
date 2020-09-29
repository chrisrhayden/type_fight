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

  max_rooms: number;

  min_room_size: number;
  max_room_size: number;

  difficulty: number;

  // rely on feature_generator for rng and to make entity's
  feature_generator: FeatureGenerator;
  rng: FeatureGenerator["rng"];

  constructor(
    feature: FeatureGenerator,
    difficulty: number,
    map_width: number,
    map_height: number
  ) {
    this.difficulty = difficulty;
    this.feature_generator = feature;
    this.rng = this.feature_generator.rng;

    this.map_width = map_width;
    this.map_height = map_height;

    this.max_rooms = 100;

    this.min_room_size = 5;
    this.max_room_size = 10;
  }


  make_map(entities: Entities, scene: Scene): GameMap {
    const game_map = new GameMap(this.map_width, this.map_height);

    game_map.data = Array(game_map.width * game_map.height);

    for (let i = 0; i < game_map.data.length; ++i) {
      game_map.data[i] = new TerrainData(GameTile.WallOne, true);
    }

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
        this.create_room(game_map, new_room);

        const [new_x, new_y] = new_room.center();

        const center_indx = new_x + (this.map_width * new_y);

        if (num_rooms == 0) {
          this.feature_generator.make_player(scene, entities, center_indx);

        } else {
          if (this.feature_generator.monster_by_difficulty(1)) {
            this.feature_generator
              .make_enemy(scene, entities, center_indx, this.difficulty);
          }

          const [prev_x, prev_y] = made_rooms[made_rooms.length - 1].center();

          if (this.rng.getUniform() > 0.5) {
            this.create_h_tunnel(game_map, prev_x, new_x, prev_y);
            this.create_v_tunnel(game_map, prev_y, new_y, new_x);

          } else {
            this.create_v_tunnel(game_map, prev_y, new_y, prev_x);
            this.create_h_tunnel(game_map, prev_x, new_x, new_y);
          }
        }

        made_rooms.push(new_room);

        num_rooms += 1;
      }
    }

    return game_map;
  }


  create_room(game_map: GameMap, room: Rect): void {
    for (let x = room.x1 + 1; x < room.x2; ++x) {
      for (let y = room.y1 + 1; y < room.y2; ++y) {
        const indx = (x + (this.map_width * y));

        game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
      }
    }
  }


  create_h_tunnel(game_map: GameMap, x1: number, x2: number, y: number): void {
    const x_min = Math.min(x1, x2);
    const x_max = Math.max(x1, x2);

    for (let x = x_min; x < x_max + 1; ++x) {
      const indx = (x + (this.map_width * y));

      game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }

  create_v_tunnel(game_map: GameMap, y1: number, y2: number, x: number): void {
    const y_min = Math.min(y1, y2);
    const y_max = Math.max(y1, y2);

    for (let y = y_min; y < y_max + 1; ++y) {
      const indx = (x + (this.map_width * y));

      game_map.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }
}
