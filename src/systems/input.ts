import {Scene} from "../scenes";
import {moveTo} from "./movement";
import {Ai} from "../components";
import {attackEnt} from "./attack";

/** move the player or try and attack
 *
 * this is the logic whether the player will move or attack an entity
 */
export function moveOrAttack(scene: Scene, indx: number): boolean {
  // if we take a move then we are done
  if (moveTo(scene, scene.playerEnt, indx)) {
    return true;
  }

  let otherEnt = "0";

  const posIter = Object.entries(scene.components.position);

  for (const [otherId, otherPos] of posIter) {
    if (indx === otherPos) {
      otherEnt = otherId;
    }
  }

  // if the other entity does not have an ai then it cant be a target
  if ((otherEnt in scene.components.ai) === false) {
    return false;
  }

  // if the entity is an Enemy then we can attack
  if (scene.components.ai[otherEnt] === Ai.Enemy) {
    return attackEnt(scene, scene.playerEnt, otherEnt);
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
export function handleInput(
  scene: Scene,
  evt: KeyboardEvent | TestKey
): boolean {
  if (evt.type === "keydown") {
    let newPos = -1;

    switch (evt.key) {
      // up
      case "ArrowUp":
      case "w":
        newPos =
          scene.components.position[scene.playerEnt] - scene.gameMap.width;
        break;
      // left
      case "ArrowLeft":
      case "a":
        newPos = scene.components.position[scene.playerEnt] - 1;
        break;
      case "ArrowDown":
      case "s":
        newPos =
          scene.components.position[scene.playerEnt] + scene.gameMap.width;
        break;
      // right
      case "ArrowRight":
      case "d":
        newPos = scene.components.position[scene.playerEnt] + 1;
        break;
      // up-right
      case "e":
        newPos =
          (scene.components.position[scene.playerEnt] - scene.gameMap.width) + 1;
        break;
      // up-left
      case "q":
        newPos =
          (scene.components.position[scene.playerEnt] - scene.gameMap.width) - 1;
        break;
      // down-right
      case "x":
        newPos =
          (scene.components.position[scene.playerEnt] + scene.gameMap.width) + 1;
        break;
      // down-left
      case "z":
        newPos =
          (scene.components.position[scene.playerEnt] + scene.gameMap.width) - 1;
        break;
    }

    if (newPos !== -1) {
      // NOTE: using exports.* so we can stub the function when testing
      return exports.moveOrAttack(scene, newPos);
    }
  }

  return false;
}
