import {Scene} from "../scenes";

// keys are more or less always strings so iterators tend to return keys as
// strings rather then the actual number
type Id = number | string;

export function damageResolve(scene: Scene, fromId: Id, toId: Id): number {
  const fromEnt = scene.components.baseStats[fromId];
  const toEnt = scene.components.baseStats[toId];

  if (fromEnt.dexterity >= toEnt.dexterity) {
    return fromEnt.strength;
  }

  return 0;
}

/** have an entity attack another one
 *
 * this should allow any entity attack a valid target
 */
export function attackEnt(scene: Scene, fromId: Id, toId: Id): boolean {
  if ((fromId in scene.components.baseStats) === false
    || (toId in scene.components.health) === false
    || (toId in scene.components.baseStats) === false
  ) {
    return false;
  }

  // run the damage calculation
  const hitPower = damageResolve(scene, fromId, toId);

  // adjust health
  const toHealth = scene.components.health[toId];
  scene.components.health[toId] = toHealth - hitPower;

  return true;
}
