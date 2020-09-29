import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

import {Ai, BaseStats, Health, BaseEntity} from "./components";
import {GameTile} from "./tiles";
import {Scene} from "./scenes";
import {Entities} from "./entities";

interface PlayerPreFab {
  health: Health,
  base_stats: BaseStats,
  tile: GameTile,
}

interface EntityPreFab {
  health: Health,
  base_stats: BaseStats,
  base_entity: BaseEntity,
}

interface FeatureOpts {
  player: PlayerPreFab,
  chance: Record<number, number>,
  monsters: Record<number, Record<number, EntityPreFab>>,
}

const default_player = {
  health: {
    max_value: 10,
    value: 10,
  },
  base_stats: {
    strength: 1,
    dexterity: 1,
  },
  tile: GameTile.PersonOne,
};

const skeleton: EntityPreFab = {
  health: {
    max_value: 10,
    value: 10,
  },
  base_stats: {
    strength: 1,
    dexterity: 1,
  },
  base_entity: {
    blocks: true,
    blocks_light: true,
    renders: true,
    tile: GameTile.Skeleton,
  }
};

const ogre: EntityPreFab = {
  health: {
    max_value: 10,
    value: 10,
  },
  base_stats: {
    strength: 1,
    dexterity: 1,
  },
  base_entity: {
    blocks: true,
    blocks_light: true,
    renders: true,
    tile: GameTile.Ogre,
  }
};

const default_monsters = {
  1: {
    60: ogre,
    40: skeleton,
    20: skeleton,
    0: skeleton,
  },
};

const default_chance = {
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
      player: default_player,
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

    scene.components.base_stats[player_id] = this.options.player.base_stats;

    scene.components.health[player_id] = this.options.player.health;

    scene.components.player[player_id] = this.options.player.tile;

    return true;
  }

  // if a level generator should make a monster
  enemy_by_difficulty(difficulty: number): boolean {
    return this.rng.getPercentage() <= this.options.chance[difficulty];
  }

  get_ent_by_difficulty(difficulty: number): EntityPreFab {
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


  make_enemy(
    scene: Scene,
    entities: Entities,
    indx: number,
    difficulty: number
  ): boolean {
    const ent_id = entities.new_id();

    const ent = this.get_ent_by_difficulty(difficulty);

    scene.components.position[ent_id] = indx;

    scene.components.ai[ent_id] = Ai.Enemy;

    scene.components.active_entities[ent_id] = Object.assign(ent.base_entity);

    scene.components.base_stats[ent_id] = Object.assign(ent.base_stats);

    scene.components.health[ent_id] = Object.assign(ent.health);

    return true;
  }
}
