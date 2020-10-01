import {Scene} from "../scenes";
import {move_to} from "./movement";
import {Ai} from "../components";
import {attack_ent} from "./attack";

export function move_or_attack(scene: Scene, indx: number): boolean {
  if (move_to(scene, scene.player, indx) === false) {
    const pos_iter = Object.entries(scene.components.position);

    let other_ent = "0";

    for (const [other_id, other_pos] of pos_iter) {
      if (indx === other_pos) {
        other_ent = other_id;
      }
    }

    if ((other_ent in scene.components.ai) === false) {
      return false;
    }

    if (scene.components.ai[other_ent] === Ai.Enemy) {
      return attack_ent(scene, scene.player, other_ent);
    }
  }

  // player moved
  return true;
}

export interface TestKey {
  type: string,
  key: string,
}

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
