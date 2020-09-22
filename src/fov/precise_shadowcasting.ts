import {Scene} from "../scenes";

/** offsets to move around a point
 *
 * i think is goes
 *  1,  1 = upper right
 *  1, -1 = upper left
 * -1,  1 = lower right
 * -1, -1 = lower left
 */
const DIRECTIONS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

class PreciseAngleShadowcasting {
  radius: number;
  entity: number;
  scene: Scene;
  map_width: number;
  map_height: number;

  entity_x: number;
  entity_y: number;

  constructor(radius: number, scene: Scene, entity: number) {
    this.radius = radius;
    this.scene = scene;
    this.entity = entity;

    const entity_index = this.scene.components.position[entity];

    this.map_width = this.scene.game_map.width;
    this.map_height = this.scene.game_map.width;


    this.entity_x = entity_index % this.map_width;
    this.entity_y = Math.floor(entity_index / this.map_width);
  }

  compute_shadow_quadrant(x_offset: number, y_offset: number) {

    let done = false;
    let min_angle = 0.0;

    let y = this.entity_y + y_offset;

    if (y < 0 || y >= this.map_height) {
      done = true;
    }

    for (let iteration = 1; done === false; ++iteration) {
      const angle_range = 1.0 / iteration;

      const half_angle_range = angle_range * 0.5;

      // i think i need to floor this, i think this is getting the actual cell
      // this can also be negative
      let processed_cell = ((min_angle + half_angle_range) / angle_range);

      const min_x = Math.max((this.entity_x - iteration), 0);
      const max_x = Math.min((this.entity_x + iteration), this.map_width - 1);

      done = true;

      let x = this.entity_x + processed_cell * x_offset;

      while (x >= min_x || x <= max_x) {
        // i think this is an index
        const c = x + (this.map_width * y);
      }
    }

  }
}

export function precise_angle_shadowcasting(
  radius: number,
  scene: Scene,
  entity: number
): void {

  const strategy = new PreciseAngleShadowcasting(radius, scene, entity);

  for (const d of DIRECTIONS) {
    strategy.compute_shadow_quadrant(d[0], d[1]);
  }

  return;
}
