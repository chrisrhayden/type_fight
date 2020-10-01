import {Scene} from "../scenes";

/** move an entity
 *
 * this should work for all entities
 */
export function move_to(
  scene: Scene,
  ent: number | string,
  pos: number,
): boolean {
  // if not in the map
  if (pos < 0 || pos >= scene.game_map.data.length) {
    return false;
  }

  // if map tile already blocks
  if (scene.game_map.data[pos].blocks) {
    return false;
  }

  // if the player is there
  if (pos === scene.components.position[scene.player]) {
    return false;
  }

  // look and see of any other entity is at the location
  const entities = Object.entries(scene.components.active_entities);
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
