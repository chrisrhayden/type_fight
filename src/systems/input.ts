import {Scene} from "../scenes";
import {move_or_attack} from "./player";

export function handle_input(scene: Scene, evt: KeyboardEvent): boolean {
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
      return move_or_attack(scene, new_pos);
    }
  }

  return false;
}
