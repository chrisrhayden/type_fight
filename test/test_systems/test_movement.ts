import * as assert from "assert";

import {
  Scene,
  GameMap,
  TerrainData,
  GameTile,
  move_to,
} from "../index";


describe("test movement system", () => {
  const game_map = new GameMap(20, 20);

  const nothing = new TerrainData(GameTile.Nothing, false);

  game_map.data.fill(nothing);


  describe("should move directions correctly", () => {
    const scene = new Scene();
    scene.game_map = game_map;
    scene.player = 1;

    it("moves to the right location within the map", () => {
      const to_move = 100;

      assert.ok(move_to(scene, scene.player, to_move), "did not move to space");

      assert.ok(scene.components.position[scene.player] === to_move,
        "did not set to the right place");
    });

    it("dose not move out side the map", () => {
      assert.ok(move_to(scene, scene.player, -1) === false, "moved past zero");

      assert.ok(move_to(scene, scene.player, 400) === false,
        "moved past map length");
    });
  });

  describe("should not move in to blocking things", () => {
    const scene = new Scene();
    scene.game_map = game_map;
    scene.player = 1;

    it("stops at a blocking wall", () => {
      scene.components.position[1] = 200;

      scene.game_map.data[201] = {
        id: 0,
        can_see: true,
        blocks: true,
        visible: true,
        visited: false,
        tile: GameTile.WallOne,
      };

      const did_move = move_to(scene, 1, 201);

      assert.ok(did_move === false, "the player moved in to a blocking wall");
    });

    it("stops at a blocking entity", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: true,
        blocks_light: true,
        renders: true,
        tile: GameTile.GrassThree,

      };

      scene.components.position[2] = 199;

      const did_move = move_to(scene, 1, 199);

      assert.ok(did_move === false, "the player moved in to a blocking entity");
    });

    it("stops at the player", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: true,
        blocks_light: true,
        renders: true,
        tile: GameTile.GrassThree,

      };

      scene.components.position[2] = 199;

      assert.ok(move_to(scene, 2, 200) === false,
        "an entity moved in to the player");

      assert.ok(move_to(scene, 1, 200) === false,
        "the player moved in to the player");
    });
  });
});
