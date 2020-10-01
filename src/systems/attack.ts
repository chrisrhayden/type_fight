import {Scene} from "../scenes";

// keys are more or less always strings so iterators tend to return keys as
// strings rather then the actual number
type Id = number | string;

export function damage_resolve(scene: Scene, from_id: Id, to_id: Id): number {
  const from_ent = scene.components.base_stats[from_id];
  const to_ent = scene.components.base_stats[to_id];

  if (from_ent.dexterity >= to_ent.dexterity) {
    return from_ent.strength;
  }

  return 0;
}

/** have an entity attack another one
 *
 * this should allow any entity attack a valid target
 */
export function attack_ent(scene: Scene, from_id: Id, to_id: Id): boolean {
  if ((from_id in scene.components.base_stats) === false
    || (to_id in scene.components.health) === false
    || (to_id in scene.components.base_stats) === false
  ) {
    return false;
  }

  // run the damage calculation
  const hit_power = damage_resolve(scene, from_id, to_id);

  // adjust health
  const to_health = scene.components.health[to_id];
  scene.components.health[to_id] = to_health - hit_power;

  return true;
}
