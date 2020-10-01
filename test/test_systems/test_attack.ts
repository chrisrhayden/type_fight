import * as assert from "assert";

import {
  attack_ent,
  damage_resolve,
  Scene,
  make_ent
} from "../index";

describe("test attack system", () => {
  describe("should attack entities correctly", () => {
    const scene = new Scene();

    const ent_one_id = 2;
    const ent_one = make_ent();

    scene.components.active_entities[ent_one_id] = ent_one.base_entity;
    scene.components.base_stats[ent_one_id] = ent_one.base_stats;
    scene.components.health[ent_one_id] = ent_one.health;
    scene.components.position[ent_one_id] = 200;

    const ent_two_id = 3;
    const ent_two = make_ent();

    scene.components.active_entities[ent_two_id] = ent_two.base_entity;
    scene.components.base_stats[ent_two_id] = ent_two.base_stats;
    scene.components.health[ent_two_id] = ent_two.health;
    scene.components.position[ent_two_id] = 201;

    it("attacks an entity that it should", () => {
      const attacked = attack_ent(scene, ent_one_id, ent_two_id);

      assert.ok(attacked, "did not attack entity");
    });

    it("attacks does not attack an entity without health", () => {
      delete scene.components.health[ent_two_id];

      const attacked = attack_ent(scene, ent_one_id, ent_two_id);

      assert.ok(attacked === false, "attack an entity without health");
    });

    it("attacks does not attack an entity without base stats", () => {
      scene.components.health[ent_two_id] = ent_two.health;
      delete scene.components.base_stats[ent_two_id];

      const attacked = attack_ent(scene, ent_one_id, ent_two_id);

      assert.ok(attacked === false, "attack an entity without base_stats");
    });
  });

  // NOTE: this will have to be changed when the "real" combat system in
  // implemented
  describe("should resolve damage correctly", () => {
    const scene = new Scene();

    const ent_one_id = 2;
    const ent_one = make_ent();

    scene.components.active_entities[ent_one_id] = ent_one.base_entity;
    scene.components.base_stats[ent_one_id] = ent_one.base_stats;
    scene.components.health[ent_one_id] = ent_one.health;
    scene.components.position[ent_one_id] = 200;

    const ent_two_id = 3;
    const ent_two = make_ent();

    scene.components.active_entities[ent_two_id] = ent_two.base_entity;
    scene.components.base_stats[ent_two_id] = ent_two.base_stats;
    scene.components.health[ent_two_id] = ent_two.health;
    scene.components.position[ent_two_id] = 201;

    it("returns the correct amount of damage when it should", () => {
      const damage = damage_resolve(scene, ent_one_id, ent_two_id);

      assert.ok(damage === 1, "did not return damage");
    });


    it("returns the zero amount of damage when an enemy more dex", () => {
      scene.components.base_stats[ent_two_id].dexterity = 10;

      const damage = damage_resolve(scene, ent_one_id, ent_two_id);

      assert.ok(damage === 0, "did not return zero damage");
    });
  });
});
