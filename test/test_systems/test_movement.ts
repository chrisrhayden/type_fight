import * as assert from "assert";

import {
  move_by,
  move_up,
  move_down,
  move_left,
  move_right,
  Scene,
  GameMap,
  TerrainData,
  GameTile,
} from "../index";


describe("test movement system", () => {
  const game_map = new GameMap(20, 20);

  const nothing = new TerrainData(GameTile.Nothing, false);

  game_map.data.fill(nothing);

  const scene = new Scene();

  scene.game_map = game_map;

  scene.player = 1;


  describe("should move directions correctly", () => {
    it("moves by positive", () => {
      // middle or something idk
      scene.components.position[1] = 200;

      move_by(scene, 1, 10);

      assert.ok(scene.components.position[1] === 210,
        "did not move up the game board");
    });

    it("moves by negative", () => {
      // middle or something idk
      scene.components.position[1] = 200;

      move_by(scene, 1, -10);

      assert.ok(scene.components.position[1] === 190,
        "did not move up the game board");
    });

    it("moves up", () => {
      // middle or something idk
      scene.components.position[1] = 200;

      move_up(scene, 1);

      assert.ok(scene.components.position[1] === 180,
        "did not move up the game board");
    });

    it("moves down", () => {
      scene.components.position[1] = 200;

      move_down(scene, 1);

      assert.ok(scene.components.position[1] === 220,
        "did not move up the game board");
    });

    it("moves left", () => {
      scene.components.position[1] = 200;

      move_left(scene, 1);

      assert.ok(scene.components.position[1] === 199,
        "did not move up the game board");
    });

    it("moves right", () => {
      scene.components.position[1] = 200;

      move_right(scene, 1);

      assert.ok(scene.components.position[1] === 201,
        "did not move up the game board");
    });
  });

  describe("should not move in to blocking things", () => {
    it("stops at a blocking wall", () => {
      scene.components.position[1] = 200;

      scene.game_map.data[201] = {
        id: 0,
        blocks: true,
        visible: true,
        visited: false,
        tile: GameTile.WallOne,
      };

      const did_move = move_by(scene, 1, 1);

      assert.ok(did_move === false, "the player move in to a blocking entity");
    });
    it("stops at a blocking entity", () => {
      scene.components.position[1] = 200;

      scene.components.active_entities[2] = {
        blocks: true,
        blocks_light: true,
        renders: true,
        tile: GameTile.GrassThree,

      };
      scene.components.position[2] = 201;

      const did_move = move_by(scene, 1, 1);

      assert.ok(did_move === false, "the player move in to a blocking entity");
    });
  });
});
