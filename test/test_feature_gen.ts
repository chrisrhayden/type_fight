import * as assert from "assert";

import {GameTile, FeatureGenerator, Scene, Entities} from "./index";

function assert_basic_entity(scene: Scene, id: number | string): boolean {
  assert.ok((id in scene.components.base_stats), `did not set ${id} base_stats`);
  assert.ok((id in scene.components.position), `did not set ${id} pos`);
  assert.ok((id in scene.components.health), `did not set ${id} health`);

  return true;
}

describe("test feature_generator", () => {
  describe("should make entities correctly", () => {
    it("makes a player correctly", () => {
      const feature_generator = new FeatureGenerator(3333);

      const entities = new Entities();
      const scene = new Scene();

      feature_generator.make_player(scene, entities, 1);

      assert_basic_entity(scene, 1);

      assert.ok((1 in scene.components.player), "did not set player tile");
    });

    it("makes a monsters correctly", () => {
      const feature_generator = new FeatureGenerator(3333);

      const entities = new Entities();
      const scene = new Scene();

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert_basic_entity(scene, 1);

      assert.ok((1 in scene.components.ai), "did not set ents ai");

      assert.ok((1 in scene.components.active_entities),
        "did not set ent in active_entities");

      assert.ok(scene.components.active_entities[1].tile === GameTile.Skeleton,
        "set 1st ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[2].tile === GameTile.Skeleton,
        "set 2nd ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[3].tile === GameTile.Ogre,
        "set 3rd ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[4].tile === GameTile.Ogre,
        "set 4th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[5].tile === GameTile.Ogre,
        "set 5th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[6].tile === GameTile.Skeleton,
        "set 6th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[7].tile === GameTile.Skeleton,
        "set 7th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[8].tile === GameTile.Skeleton,
        "set 8th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[9].tile === GameTile.Skeleton,
        "set 9th ent to wrong tile");

      feature_generator.make_enemy(scene, entities, 1, 1);

      assert.ok(scene.components.active_entities[10].tile === GameTile.Ogre,
        "set 10th ent to wrong tile");
    });
  });

  // TODO: idk why this changes, like its different on the cli, W.T.F.
  // describe("should init correclty", () => {
  //   it("sets seed correctly", () => {
  //     const one = feature_generator.rng.getUniform();
  //
  //     assert.ok(one === 0.6231631832197309,
  //       "did not set seed"
  //     );
  //
  //     const two = feature_generator.rng.getUniform();
  //
  //     assert.ok(two === 0.25837272009812295, "did not set seed");
  //   });
  // });
});
