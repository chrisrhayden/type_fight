// https://github.com/TStand90/roguelike_tutorial_revised/
// blob/part3/map_objects/game_map.py

import * as utils from "../utils";
import * as gen_utils from "./gen_utils";
import {GameMap, GameTile} from "../game_map";

const get_random_int = utils.get_random_int;

const Rect = gen_utils.Rect;

export class BasicMap {
  width: number;
  height: number

  game_map: GameMap;

  max_rooms: number;

  min_room_size: number;
  max_room_size: number;


  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.max_rooms = 100;

    this.game_map = new GameMap(this.width, this.height);
  }


  make_basic_map(): GameMap {

    const made_rooms: gen_utils.Rect[] = [];

    let num_rooms = 0;

    for (let r = 0; r < this.max_rooms; ++r) {

      const w = get_random_int(this.min_room_size, this.max_room_size);
      const h = get_random_int(this.min_room_size, this.max_room_size);

      const x = get_random_int(0, this.width - w - 1);
      const y = get_random_int(0, this.height - h - 1);

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

        num_rooms += 1;
      }
    }

    return new GameMap(0, 0);
  }


  create_room(room: gen_utils.Rect): void {
    // go through the tiles in the rectangle and make them passable

    for (let x = room.x1 + 1; x < room.x2; ++x) {
      for (let y = room.y1 + 1; y < room.y2; ++y) {
        const indx = (x * (this.width + y));

        this.game_map.tiles[indx] = GameTile.WallOne;
      }
    }
  }

  create_h_tunnel(x1: number, x2: number, y: number): void {
    for (let x = x1; x < x2; ++x) {
      const indx = (x * (this.width + y));

      this.game_map.tiles[indx] = GameTile.WallOne;
    }
  }

  create_v_tunnel(y1: number, y2: number, x: number): void {
    for (let y = y1; y < y2; ++y) {
      const indx = (x * (this.width + y));

      this.game_map.tiles[indx] = GameTile.WallOne;
    }
  }
}
