import * as assert from "assert";

import {
  Scene,
  GameMap,
  TerrainData,
  GameTile,
  move_to,
} from "../index";


describe("test movement system", () => {
  describe("should move entity correctly", () => {
    let nothing: TerrainData;
    let scene: Scene;

    before(() => {
      nothing = new TerrainData(GameTile.Nothing, false);
      scene = new Scene();

      scene.game_map = new GameMap(20, 20);
      scene.game_map.data.fill(nothing);
      scene.player = 1;
    });

    it("moves to the right location within the map", () => {
      const to_move = 100;

      assert.ok(move_to(scene, 1, to_move), "did not move to space");

      assert.ok(scene.components.position[1] === to_move,
        "did not set to the right place");
    });

    it("dose not move out side the map", () => {
      assert.ok(move_to(scene, 1, -1) === false, "moved past zero");

      assert.ok(move_to(scene, 1, 400) === false,
        "moved past map length");
    });
  });

  describe("should move entitys around correctly", () => {
    let nothing: TerrainData;
    let scene: Scene;

    before(() => {
      nothing = new TerrainData(GameTile.Nothing, false);
      scene = new Scene();

      scene.game_map = new GameMap(20, 20);
      scene.game_map.data.fill(nothing);
      scene.player = 5;
    });

    it("entity stops at a blocking tile", () => {
      scene.components.position[1] = 200;

      scene.game_map.data[201] = {
        id: 0,
        blocks: true,
        visible: true,
        visited: false,
        tile: GameTile.WallOne,
      };

      const did_move = move_to(scene, 1, 201);

      assert.ok(did_move === false, "the entity moved in to a blocking wall");
    });

    it("entity move in to non-blocking tile", () => {
      scene.components.position[1] = 200;

      scene.game_map.data[201] = {
        id: 0,
        blocks: false,
        visible: true,
        visited: false,
        tile: GameTile.WallOne,
      };

      const did_move = move_to(scene, 1, 201);

      assert.ok(did_move === true,
        "the entity did not moved in to a non-blocking wall");
    });

    it("entity moves in to a non-blocking entity", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: false,
        blocks_light: false,
        renders: true,
        tile: GameTile.GrassThree,
      };

      scene.components.position[2] = 180;

      const did_move = move_to(scene, 1, 180);

      assert.ok(did_move === true,
        "the entity did not moved in to a non blocking entity");
    });

    it("entity stops at a blocking entity", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: true,
        blocks_light: true,
        renders: true,
        tile: GameTile.Ogre,
      };

      scene.components.position[2] = 199;

      const did_move = move_to(scene, 1, 199);

      assert.ok(did_move === false, "the entity moved in to a blocking entity");
    });

    // NOTE: this is mostly to hit all conditions for the entity check loop in
    // the .src/system/movement.ts
    it("entity moves by at a blocking entity", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: true,
        blocks_light: true,
        renders: true,
        tile: GameTile.Ogre,
      };

      scene.components.position[2] = 199;

      const did_move = move_to(scene, 1, 179);

      assert.ok(did_move === true,
        "the entity moved in to a blocking entity");
    });

    it("entity dose not not move in to player", () => {
      scene.components.position[2] = 200;

      scene.components.position[5] = 199;

      assert.ok(move_to(scene, 2, 199) === false,
        "an entity moved in to the player");
    });

    it("player dose not not move in to player", () => {
      scene.components.position[5] = 200;

      assert.ok(move_to(scene, 5, 200) === false,
        "the player moved in to the player");
    });
  });
});
