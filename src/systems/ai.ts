/** the main ai logic
 *
 * run_ai will iterate over all active_entities and run the logic based on what
 * the entity is
 */
import * as ROT from "rot-js";

import {Ai} from "../components";
import {Scene} from "../scenes";
import {move_to} from "./movement";
import {attack_ent} from "./attack";


// this is entirely so test can get context in to the astar callback so we can
// give it path data
export class AstarCallback {
  points: [number, number][];

  constructor() {
    this.points = [];

    // bind this to the method so we can use it as the fov.compute callback
    this.callback = this.callback.bind(this);
  }

  callback(x: number, y: number): void {
    this.points.push([x, y]);
  }
}

export function run_ai(scene: Scene): boolean {
  const entities = Object.keys(scene.components.active_entities);

  // run through all the active entities
  for (const ai_id of entities) {
    // if the entity does not have an ai we do nothing
    if ((ai_id in scene.components.ai) === false) {
      continue;
    }

    // the only systems in place need a position
    if ((ai_id in scene.components.position) === false) {
      continue;
    }

    const ai_pos = scene.components.position[ai_id];

    if (scene.game_map.data[ai_pos].visible === true) {
      // a callback to check if tile is passable
      const passable = (x: number, y: number) => {
        const indx = x + (scene.game_map.width * y);

        if (indx < 0 || indx >= scene.game_map.data.length) {
          return false;
        }

        if (scene.game_map.data[indx].blocks) {
          return false;
        }

        const inner_ents = Object.entries(scene.components.active_entities)
          .filter((value) => value[0] !== ai_id);

        for (const [key, ent] of inner_ents) {
          if ((key in scene.components.position) === false) {
            continue;
          }

          const ent_pos = scene.components.position[key];

          if (indx === ent_pos && ent.blocks === true) {
            return false;
          }
        }

        return true;
      };

      const player_pos = scene.components.position[scene.player];

      const p_x = player_pos % scene.game_map.width;
      const p_y = Math.floor(player_pos / scene.game_map.width);

      const e_x = ai_pos % scene.game_map.width;
      const e_y = Math.floor(ai_pos / scene.game_map.width);

      const astar = new ROT.Path.AStar(p_x, p_y, passable);

      // NOTE: exports.* is to stub while testing
      const astar_data = new exports.AstarCallback();

      // compute star for current entity
      astar.compute(e_x, e_y, astar_data.callback);

      // TODO: i think this should always have the start path and the end pasth
      // node so i think a 0 is an error
      if (astar_data.points.length === 0) {
        console.error("astar did not return a path");

        return false;
      }

      // get the first new tile in path
      const new_x = astar_data.points[1][0];
      const new_y = astar_data.points[1][1];

      const next_pos = new_x + (scene.game_map.width * new_y);

      if (move_to(scene, ai_id, next_pos) === false) {
        // if the next_pos does not equal the player_pos then there is nothing
        // to do foe the ai
        if (next_pos !== player_pos) {
          return true;
        }

        if (scene.components.ai[ai_id] !== Ai.Enemy) {
          return true;
        }

        return attack_ent(scene, ai_id, scene.player);
      }
    }
  }

  return true;
}
