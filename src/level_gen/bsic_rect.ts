// https://github.com/TStand90/roguelike_tutorial_revised/
// blob/part3/map_objects/game_map.py

import * as utils from "../utils";
import * as gen_utils from "./gen_utils";
import {GameMap, GameTile} from "../game_map";

const get_random_int = utils.get_random_int;

const Rect = gen_utils.Rect;

export class BasicMap {
  // number tiles across
  map_width: number;
  // number tiles high
  map_height: number

  game_map: GameMap;

  max_rooms: number;

  min_room_size: number;
  max_room_size: number;


  constructor(map_width: number, map_height: number) {
    this.map_width = map_width;
    this.map_height = map_height;

    this.max_rooms = 100;

    this.min_room_size = 5;
    this.max_room_size = 10;

    this.game_map = new GameMap(this.map_width, this.map_height);
  }


  make_basic_map(): GameMap {
    const made_rooms: gen_utils.Rect[] = [];

    let num_rooms = 0;

    for (let r = 0; r < this.max_rooms; ++r) {

      const w = get_random_int(this.min_room_size, this.max_room_size);
      const h = get_random_int(this.min_room_size, this.max_room_size);

      const x = get_random_int(0, this.map_width - w - 1);
      const y = get_random_int(0, this.map_height - h - 1);

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

        if (num_rooms != 0) {
          const [new_x, new_y] = new_room.center();

          const [prev_x, prev_y] = made_rooms[made_rooms.length - 1].center();

          if (Math.random() > 0.5) {
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


  create_room(room: gen_utils.Rect): void {
    // go through the tiles in the rectangle and make them passable

    for (let x = room.x1 + 1; x < room.x2; ++x) {
      for (let y = room.y1 + 1; y < room.y2; ++y) {
        const indx = (x + (this.map_width * y));

        this.game_map.tiles[indx] = GameTile.Nothing;
      }
    }
  }

  create_h_tunnel(x1: number, x2: number, y: number): void {
    const x_min = Math.min(x1, x2);
    const x_max = Math.max(x1, x2);

    for (let x = x_min; x < x_max + 1; ++x) {
      const indx = (x + (this.map_width * y));

      this.game_map.tiles[indx] = GameTile.Nothing;
    }
  }

  create_v_tunnel(y1: number, y2: number, x: number): void {
    const y_min = Math.min(y1, y2);
    const y_max = Math.max(y1, y2);

    for (let y = y_min; y < y_max + 1; ++y) {
      const indx = (x + (this.map_width * y));

      this.game_map.tiles[indx] = GameTile.Nothing;
    }
  }
}
