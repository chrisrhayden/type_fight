/** a generator and rng store
 *
 * this will wrap a seeded rng to got the game to use
 *
 * this has a few convenience functions to help make entities
 */
import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

import {Ai} from "./components";
import {GameTile} from "./tiles";
import {Scene} from "./scenes";
import {Entities} from "./entities";

interface FeatureGeneratorOpts {
  monsters: Record<number, GameTile[]>,
  chance: Record<number, number>,
}

const default_monsters = {
  1: [GameTile.Ogre, GameTile.Skeleton],
};

const default_chance = {
  1: 60,
};

export class FeatureGenerator {
  options: FeatureGeneratorOpts;
  rng: typeof RNG.default;

  constructor(seed: number) {
    // this can be loaded from a file a some point
    this.options = {
      monsters: default_monsters,
      chance: default_chance,
    };

    this.rng = ROT.RNG;
    this.rng.setSeed(seed);
  }

  make_player(
    scene: Scene,
    entities: Entities,
    indx: number
  ): boolean {
    const player_id = entities.new_id();

    scene.player = player_id;

    scene.components.position[player_id] = indx;

    scene.components.health[player_id] = {
      max_value: 10,
      value: 10,
    };

    scene.components.base_stats[player_id] = {
      strength: 1,
      dexterity: 1,
    };

    return true;
  }

  // if a level generator should make a monster
  monster_by_difficulty(difficulty: number): boolean {
    return this.rng.getPercentage() >= this.options.chance[difficulty];
  }

  make_enemy(
    scene: Scene,
    entities: Entities,
    indx: number,
    difficulty: number
  ): boolean {
    const ent_id = entities.new_id();

    scene.components.position[ent_id] = indx;

    scene.components.ai[ent_id] = Ai.Enemy;

    const tile = this.rng.getItem(this.options.monsters[difficulty]);

    scene.components.active_entities[ent_id] = {
      blocks: true,
      blocks_light: true,
      renders: true,
      tile,
    };

    return true;
  }
}
