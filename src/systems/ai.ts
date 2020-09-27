import {default as Astar} from "rot-js/lib/path/astar";

// import {BaseEntity} from "../components";
import {Ai} from "../components";
import {Scene} from "../scenes";
import {move_to} from "./movement";
import {attack_ent} from "./attack";

export function run_ai(scene: Scene): boolean {
  // const entities = Object.entries(scene.components.active_entities);
  // for (const [id, _ent] of entities) {

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

      const ai_path: [number, number][] = [];

      const player_pos = scene.components.position[scene.player];

      const p_x = player_pos % scene.game_map.width;
      const p_y = Math.floor(player_pos / scene.game_map.width);

      const e_x = ai_pos % scene.game_map.width;
      const e_y = Math.floor(ai_pos / scene.game_map.width);

      const astar = new Astar(p_x, p_y, passable);

      astar.compute(e_x, e_y, (x: number, y: number) => {
        ai_path.push([x, y]);
      });

      // TODO: i dont think this is exactly an error
      if (ai_path.length === 0) {
        console.error("astart did not reurn a path");

        return false;
      }

      const next_pos = ai_path[1][0] + (scene.game_map.width * ai_path[1][1]);

      if (!move_to(scene, ai_id, next_pos)) {
        // TODO: why else cant a thing move
        if (next_pos !== player_pos) {
          return true;
        }

        if (scene.components.ai[ai_id] !== Ai.Enemy) {
          return true;
        }

        if (!attack_ent(scene, ai_id, scene.player)) {
          return false;
        }
      }
    }
  }

  return true;
}
