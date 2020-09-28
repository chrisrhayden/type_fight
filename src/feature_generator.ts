/** a generator and rng store
 *
 * this will wrap a seeded rng to got the game to use
 *
 * this has a few convenience functions to help make entities
 */
import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

import {BaseEntity} from "./components";
import {GameTile} from "./tiles";

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

  // if a level generator should make a monster
  monster_by_difficulty(difficulty: number): boolean {
    if (this.rng.getPercentage() >= this.options.chance[difficulty]) {
      return true;
    } else {
      return false;
    }
  }

  make_enemy(difficulty: number): BaseEntity {
    const monster = this.rng.getItem(this.options.monsters[difficulty]);

    return {
      blocks: true,
      blocks_light: true,
      renders: true,
      tile: monster,
    };
  }
}
