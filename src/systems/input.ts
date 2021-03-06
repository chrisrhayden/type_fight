import {Scene} from "../scenes";
import {move_to} from "./movement";
import {Ai} from "../components";
import {attack_ent} from "./attack";

/** move the player or try and attack
 *
 * this is the logic whether the player will move or attack an entity
 */
export function move_or_attack(scene: Scene, indx: number): boolean {
  // if we take a move then we are done
  if (move_to(scene, scene.player, indx)) {
    return true;
  }

  let other_ent = "0";

  const pos_iter = Object.entries(scene.components.position);

  for (const [other_id, other_pos] of pos_iter) {
    if (indx === other_pos) {
      other_ent = other_id;
    }
  }

  // if the other entity does not have an ai then it cant be a target
  if ((other_ent in scene.components.ai) === false) {
    return false;
  }

  // if the entity is an Enemy then we can attack
  if (scene.components.ai[other_ent] === Ai.Enemy) {
    return attack_ent(scene, scene.player, other_ent);
  }

  // player moved
  return true;
}

/* this is so we dont have to instantiate an enter key object when testing this
 * function and can just use the required keys
 */
export interface TestKey {
  type: string,
  key: string,
}

/** handle user input
 *
 * this is where we will handle input events like keys or mouse clicks
 */
export function handle_input(
  scene: Scene,
  evt: KeyboardEvent | TestKey
): boolean {
  if (evt.type === "keydown") {
    let new_pos = -1;

    switch (evt.key) {
      // up
      case "ArrowUp":
      case "w":
        new_pos =
          scene.components.position[scene.player] - scene.game_map.width;
        break;
      // left
      case "ArrowLeft":
      case "a":
        new_pos = scene.components.position[scene.player] - 1;
        break;
      case "ArrowDown":
      case "s":
        new_pos =
          scene.components.position[scene.player] + scene.game_map.width;
        break;
      // right
      case "ArrowRight":
      case "d":
        new_pos = scene.components.position[scene.player] + 1;
        break;
      // up-right
      case "e":
        new_pos =
          (scene.components.position[scene.player] - scene.game_map.width) + 1;
        break;
      // up-left
      case "q":
        new_pos =
          (scene.components.position[scene.player] - scene.game_map.width) - 1;
        break;
      // down-right
      case "x":
        new_pos =
          (scene.components.position[scene.player] + scene.game_map.width) + 1;
        break;
      // down-left
      case "z":
        new_pos =
          (scene.components.position[scene.player] + scene.game_map.width) - 1;
        break;
    }

    if (new_pos !== -1) {
      // NOTE: using exports.* so we can stub the function when testing
      return exports.move_or_attack(scene, new_pos);
    }
  }

  return false;
}
