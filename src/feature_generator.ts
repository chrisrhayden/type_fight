import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

import {BaseEntity} from "./components";
import {GameTile} from "./tiles";

const default_monsters = {
  1: [GameTile.Ogre, GameTile.Skeleton],
};

const default_chance = {
  1: 60,
};

export class FeatureGenerator {
  monsters: Record<number, GameTile[]>;
  chance: Record<number, number>;

  rng: typeof RNG.default;

  constructor(seed: number) {
    this.monsters = default_monsters;
    this.chance = default_chance;

    this.rng = ROT.RNG;

    this.rng.setSeed(seed);
  }

  monster_by_difficulty(difficulty: number): boolean {
    if (this.rng.getPercentage() >= this.chance[difficulty]) {
      return true;
    } else {
      return false;
    }
  }

  make_enemy(difficulty: number): BaseEntity {
    const monster = this.rng.getItem(this.monsters[difficulty]);

    return {
      blocks: true,
      blocks_light: true,
      renders: true,
      tile: monster,
    };
  }
}
