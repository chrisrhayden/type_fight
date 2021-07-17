import {Scene} from "../scenes";

/** move an entity
 *
 * this should work for all entities
 */
export function moveTo(
  scene: Scene,
  ent: number | string,
  pos: number,
): boolean {
  // if not in the map
  if (pos < 0 || pos >= scene.gameMap.data.length) {
    return false;
  }

  // if map tile already blocks
  if (scene.gameMap.data[pos].blocks) {
    return false;
  }

  // if the player is there
  if (pos === scene.components.position[scene.playerEnt]) {
    return false;
  }

  // look and see of any other entity is at the location
  const entities = Object.entries(scene.components.activeEntities);
  for (const [key, ent] of entities) {
    if ((key in scene.components.position) === false) {
      continue;
    }

    if (pos === scene.components.position[key]) {
      if (ent.blocks) {
        return false;
      }
    }
  }

  // set the new location
  scene.components.position[ent] = pos;

  return true;
}
