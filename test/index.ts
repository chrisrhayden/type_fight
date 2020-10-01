// export {Game, GameOpts, GameData} from "../src/index";
export {Entities} from "../src/entities";
export {Ai, Components, BaseEntity, Health, BaseStats} from "../src/components";
export {GameMap, TerrainData} from "../src/game_map/game_map";
export {BasicMap} from "../src/level_gen/basic_map";
export {FeatureGenerator} from "../src/feature_generator";
export {Scenes, Scene} from "../src/scenes";
export {Rect} from "../src/game_map/map_utils";
export {GameTile} from "../src/tiles";
export {move_to} from "../src/systems/movement";
export {TestKey, handle_input, move_or_attack} from "../src/systems/input";
export {attack_ent, damage_resolve} from "../src/systems/attack";

import {BaseEntity, Health, BaseStats} from "../src/components";
import {GameTile} from "../src/tiles";

export interface EntityPreFab {
  health: Health,
  base_stats: BaseStats,
  base_entity: BaseEntity,
}

export function make_ent(): EntityPreFab {
  return {
    health: {
      max_value: 10,
      value: 10
    },
    base_stats: {
      strength: 1,
      dexterity: 1,
    },
    base_entity: {
      blocks: true,
      blocks_light: true,
      renders: true,
      tile: GameTile.Skeleton
    }
  };
}
