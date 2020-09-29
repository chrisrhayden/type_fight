import {Scene} from "../scenes";

export function move_to(
  scene: Scene,
  ent: number | string,
  pos: number,
): boolean {
  if (pos < 0 || pos >= scene.game_map.data.length) {
    return false;
  }

  if (scene.game_map.data[pos].blocks) {
    return false;
  }

  if (pos === scene.components.position[scene.player]) {
    return false;
  }

  const entities = Object.entries(scene.components.active_entities);

  for (const [key, ent] of entities) {
    if (pos === scene.components.position[key]) {
      if (ent.blocks) {
        return false;
      }
    }
  }

  scene.components.position[ent] = pos;

  return true;
}
