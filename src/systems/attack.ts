import {Scene} from "../scenes";
// import {BaseStats} from "../components";

export function attack_resolve(scene: Scene, from_id: number | string, to_id: number | string): number {
  const from_ent = scene.components.base_stats[from_id];
  const to_ent = scene.components.base_stats[to_id];

  if (from_ent.dexterity >= to_ent.dexterity) {
    return from_ent.strength;
  }

  return 0;
}

export function attack_ent(
  scene: Scene,
  from_id: number | string,
  to_id: number | string
): boolean {
  if ((from_id in scene.components.health) === true
    && (from_id in scene.components.base_stats) === true
    && (to_id in scene.components.health) === true
    && (to_id in scene.components.base_stats) === true
  ) {
    const hit_power = attack_resolve(scene, from_id, to_id);

    const to_health = scene.components.health[to_id];

    scene.components.health[to_id] = to_health - hit_power;

    return true;
  }

  return false;
}
