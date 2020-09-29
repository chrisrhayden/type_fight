/** a basic component store
 *
 * all game object/entities will be stored in there own hashmap
 */
import {GameTile} from "./tiles";

/** ai "personality's"
 *
 * a way to decide on what actions to take when its the entity's turn
 */
export enum Ai {
  Peaceful,
  Enemy,
}

export class Health {
  max_value: number;
  value: number;
}

export class BaseStats {
  // for hitting
  strength: number;
  // for not getting hit
  dexterity: number;
}

/** a basic entity
 *
 * most entities in the game will have a BaseEntity
 *
 * a tree might look like
 * {
 *  blocks: true,
 *  blocks_light: true,
 *  renders: true,
 *  tile: Tree,
 * }
 *
 * or a ghost
 * {
 *  blocks: false,
 *  blocks_light: false,
 *  renders: true,
 *  tile: Ghost,
 * }
 *
 * or a glass wall
 *{
 *  blocks: true,
 *  blocks_light: false,
 *  renders: true,
 *  tile: GlassWall,
 * }
 */
export class BaseEntity {
  blocks: boolean;
  blocks_light: boolean;
  renders: boolean;
  tile: GameTile;
}


// NOTE: make sure to assign all component hashmap's in the constructor
export class Components {
  player: Record<number, GameTile>;

  ai: Record<number, Ai>;
  active_entities: Record<number, BaseEntity>;

  health: Record<number, Health>;
  base_stats: Record<number, BaseStats>;
  position: Record<number, number>;

  constructor() {
    this.player = {};

    this.ai = {};
    this.active_entities = {};

    this.health = {};
    this.base_stats = {};
    this.position = {};
  }
}
