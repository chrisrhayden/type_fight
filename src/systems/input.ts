import {Scene} from "../scenes";
import {
  move_up,
  move_down,
  move_left,
  move_right
} from "./movement";

export function handle_input(scene: Scene, evt: KeyboardEvent): boolean {
  if (evt.type === "keydown") {
    // case fall though as the default is so fucking stupid
    switch (evt.key) {
      case "w":
        return move_up(scene, scene.player);
      case "a":
        return move_left(scene, scene.player);
      case "s":
        return move_down(scene, scene.player);
      case "d":
        return move_right(scene, scene.player);
    }
  }
}
