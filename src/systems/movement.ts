import {Scene} from "../scenes";

export function move_by(scene: Scene, ent: number, offset: number): boolean {
  const ent_pos = scene.components.position[ent];

  const new_pos = ent_pos + offset;

  if (scene.game_map.data[new_pos].blocks) {
    return false;
  }

  const entities = Object.entries(scene.components.active_entities);

  for (const [key, ent] of entities) {
    if (new_pos === scene.components.position[key]) {
      if (ent.blocks) {
        return false;
      }
    }
  }

  scene.components.position[ent] = new_pos;

  return true;
}

export const move_up = (scene: Scene, ent: number): boolean =>
  move_by(scene, ent, -scene.game_map.width);

export const move_right = (scene: Scene, ent: number): boolean =>
  move_by(scene, ent, 1);

export const move_left = (scene: Scene, ent: number): boolean =>
  move_by(scene, ent, -1);

export const move_down = (scene: Scene, ent: number): boolean =>
  move_by(scene, ent, scene.game_map.width);
