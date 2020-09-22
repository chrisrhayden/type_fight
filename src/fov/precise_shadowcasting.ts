// https://github.com/ondras/rot.js/blob/master/lib/fov/precise-shadowcasting.js

import {Scene} from "../scenes";

/**
 * i think 
 */
export function precise_shadowcasting(radius: number, scene: Scene, entity: number): void {
  const entity_pos = scene.components.position[entity];

  scene.game_map.tiles[entity_pos].visible = true;

  // TODO: this probably isn't doing what they want
  // standing in darkness
  if (!scene.game_map.tiles[entity_pos].visible) {
    return;
  }


  let shadows = [];

  for (let r = 1; r <= radius; ++r) {
  }

}
