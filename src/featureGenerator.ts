import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

import {Ai, BaseStats, Health, BaseEntity} from "./components";
import {GameTile} from "./tiles";
import {Scene} from "./scenes";
import {Entities} from "./entities";

interface PlayerPreFab {
  health: Health,
  baseStats: BaseStats,
  tile: GameTile,
}

interface EntityPreFab {
  health: Health,
  baseStats: BaseStats,
  baseEntity: BaseEntity,
}

interface FeatureOpts {
  player: PlayerPreFab,
  chance: Record<number, number>,
  monsters: Record<number, Record<number, EntityPreFab>>,
}

const defaultPlayer = {
  health: {
    maxValue: 10,
    value: 10,
  },
  baseStats: {
    strength: 2,
    dexterity: 2,
  },
  tile: GameTile.PersonOne,
};

const skeleton: EntityPreFab = {
  health: {
    maxValue: 10,
    value: 10,
  },
  baseStats: {
    strength: 1,
    dexterity: 1,
  },
  baseEntity: {
    blocks: true,
    blocksLight: true,
    renders: true,
    tile: GameTile.Skeleton,
  }
};

const ogre: EntityPreFab = {
  health: {
    maxValue: 10,
    value: 10,
  },
  baseStats: {
    strength: 1,
    dexterity: 1,
  },
  baseEntity: {
    blocks: true,
    blocksLight: true,
    renders: true,
    tile: GameTile.Ogre,
  }
};

const defaultMonsters = {
  1: {
    60: ogre,
    40: skeleton,
    20: skeleton,
    0: skeleton,
  },
};

const defaultChance = {
  1: 30,
};

export class FeatureGenerator {
  options: FeatureOpts;
  rng: typeof RNG.default;
  seed: number;

  constructor(seed: number) {
    this.seed = seed;

    // TODO: this is not good
    this.options = {
      player: defaultPlayer,
      monsters: defaultMonsters,
      chance: defaultChance,
    };

    this.rng = ROT.RNG;
    this.rng.setSeed(seed);
  }

  makePlayer(
    scene: Scene,
    entities: Entities,
    indx: number
  ): boolean {
    const playerId = entities.newId();

    scene.playerEnt = playerId;

    scene.components.position[playerId] = indx;

    scene.components.baseStats[playerId] = this.options.player.baseStats;

    scene.components.health[playerId] = this.options.player.health;

    scene.components.player[playerId] = this.options.player.tile;

    return true;
  }

  // if a level generator should make a monster
  enemyByDifficulty(difficulty: number): boolean {
    return this.rng.getPercentage() <= this.options.chance[difficulty];
  }

  getEntByDifficulty(difficulty: number): EntityPreFab {
    const percent = this.rng.getPercentage();

    if (percent <= 20) {
      return this.options.monsters[difficulty]["20"];
    } else if (percent <= 40) {
      return this.options.monsters[difficulty]["40"];
    } else if (percent <= 60) {
      return this.options.monsters[difficulty]["60"];
    } else {
      return this.options.monsters[difficulty]["0"];
    }
  }


  makeEnemy(
    scene: Scene,
    entities: Entities,
    indx: number,
    difficulty: number
  ): boolean {
    const entId = entities.newId();

    const ent = this.getEntByDifficulty(difficulty);

    scene.components.position[entId] = indx;

    scene.components.ai[entId] = Ai.Enemy;

    scene.components.activeEntities[entId] = Object.assign(ent.baseEntity);

    scene.components.baseStats[entId] = Object.assign(ent.baseStats);

    scene.components.health[entId] = Object.assign(ent.health);

    return true;
  }
}
