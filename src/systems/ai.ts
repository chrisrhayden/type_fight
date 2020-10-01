import * as ROT from "rot-js";

// import {BaseEntity} from "../components";
import {Ai} from "../components";
import {Scene} from "../scenes";
import {move_to} from "./movement";
import {attack_ent} from "./attack";


// this is entirely so test can get context in to the astar callback so we can
// give it path data
export function astar_callback(): (x: number, y: number) => void {
  const points = [];

  return (x: number, y: number) => {
    points.push([x, y]);
  };
}

export function run_ai(scene: Scene): boolean {
  const entities = Object.keys(scene.components.active_entities);

  for (const ai_id of entities) {
    if ((ai_id in scene.components.ai) === false) {
      continue;
    }

    const ai_pos = scene.components.position[ai_id];

    if (scene.game_map.data[ai_pos].visible === true) {
      const passable = (x: number, y: number) => {
        const indx = x + (scene.game_map.width * y);

        if (scene.game_map.data[indx].blocks) {
          return false;
        }

        const inner_ents = Object.entries(scene.components.active_entities)
          .filter((value) => value[0] !== ai_id);

        for (const [key, ent] of inner_ents) {
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

      const callback = exports.astar_callback();

      astar.compute(e_x, e_y, callback);

      // TODO: i think this should always have the start path and the end pasth
      // node so i think a 0 is an error
      if (callback.prototype.points.length === 0) {
        console.error("astar did not return a path");

        return false;
      }

      const new_x = callback.prototype.points[1][0];
      const new_y = callback.prototype.points[1][1];

      const next_pos = new_x + (scene.game_map.width * new_y);

      if (move_to(scene, ai_id, next_pos) === false) {
        // TODO: where else cant a thing move
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
