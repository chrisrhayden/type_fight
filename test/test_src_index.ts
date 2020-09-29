// import * as assert from "assert";
//
// import {Game, GameMap, FeatureGenerator, Scenes, Entities, GameOpts, GameData} from "./index";
//
// describe("test Game", () => {
//   const game_ops: GameOpts = {
//     sprite_sheet_data_path: "",
//     rng_seed: 3333,
//     sprite_size: [16, 16],
//     radius: 4,
//   };
//
//   const game_data: GameData = {
//     scenes: new Scenes(),
//     entities: new Entities(),
//     feature_generator: new FeatureGenerator(game_ops.rng_seed),
//   };
//
//   // NOTE: needs a mocking library
//   // describe("should render map sprites correctly", () => {
//   //   const game = new Game(game_ops, game_data);
//   //
//   //   it("dont render sprites that are not in view or visited", () => {
//   //     game.game_data.scenes.new_scene();
//   //
//   //     const scene = game.game_data.scenes.get_scene(1);
//   //
//   //     scene.game_map.data = Array(100);
//   //
//   //     scene.game_map.data.map(() => {
//   //       return {
//   //         visible: false,
//   //         visited: false,
//   //       };
//   //     });
//   //
//   //     game.sprite_map = Array(100);
//   //
//   //     game.sprite_map.map(() => {
//   //       return {
//   //         visible: false,
//   //         tint: 0,
//   //       };
//   //     });
//   //
//   //     console.log("<>>>>>>>>", game.sprite_map);
//   //   });
//   // });
//   // describe("should make a sprite map correctly", () => {
//   //   const game = new Game(game_ops, game_data);
//   //
//   //   it("makes a sprite map based on a made game map", () => {
//   //
//   //     assert.ok(game.make_sprite_map(scene.game_map), "did not make sprite map");
//   //   });
//   // });
//   // describe("should init right", () => {
//   //   const new_game = new Game(game_ops, game_data);
//   //
//   //   it("init's the game correctly", async () => {
//   //     const pix_cont = await new_game.init_game();
//   //   });
//   // });
// });
