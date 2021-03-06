/**  test BasicMap
 *
 * print out the map for debugging, this works well only using a 10,10 map
 * process.stdout.write("  0123456789\n");
 *
 * for (let y = 0; y < 10; ++y) {
 *   process.stdout.write(`${y} `);
 *
 *   for (let x = 0; x < 10; ++x) {
 *     const indx = x + (10 * y);
 *
 *     if (basic_map.game_map.data[indx].tile === 0) {
 *       process.stdout.write(" ");
 *     } else {
 *       process.stdout.write("#");
 *     }
 *
 *   }
 *
 *   process.stdout.write("\n");
 * }
 */

import * as assert from "assert";
import {describe, it} from "mocha";

import * as test_map_data from "../test_data_basic_map.json";

import {
  GameMap,
  GameTile,
  Rect,
  BasicMap,
  FeatureGenerator,
  Entities,
  Scene,
  TerrainData,
} from "../index";

describe("test basic_map", () => {
  /** unit testing */
  describe("should make rooms in to a map", () => {
    const seed = 3333;

    const width = 10;
    const height = 10;

    let feature: FeatureGenerator;

    before(() => {
      feature = new FeatureGenerator(seed);
    });

    it("makes a room correclty", () => {
      const basic_map = new BasicMap(feature, 1, width, height);

      const tile_array = Array(100);

      for (let i = 0; i < tile_array.length; ++i) {
        tile_array[i] = new TerrainData(GameTile.WallOne, true);
      }

      // carve a 8,8 square in to the made_tiles
      for (let y = 2; y < 9; ++y) {
        for (let x = 2; x < 9; ++x) {
          const indx = x + (10 * y);

          tile_array[indx] = new TerrainData(GameTile.Nothing, false);
        }
      }

      const test_map = new GameMap(10, 10);

      test_map.data = Array(10 * 10);

      for (let i = 0; i < test_map.data.length; ++i) {
        test_map.data[i] = new TerrainData(GameTile.WallOne, true);
      }

      const room = new Rect(1, 1, 8, 8);

      basic_map.create_room(test_map, room);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            test_map.data[indx].tile === tile_array[indx].tile,
            "did make a room coreclty"
          );
        }
      }
    });

    it("makes a horizontal hallway correclty", () => {
      const basic_map = new BasicMap(feature, 1, width, height);

      const tile_array = Array(100);

      for (let i = 0; i < tile_array.length; ++i) {
        tile_array[i] = new TerrainData(GameTile.WallOne, true);
      }

      const y = 2;

      // make a hallway 8 across from 1,2 to 8,2
      for (let x = 1; x < 9; ++x) {
        const indx = x + (10 * y);

        tile_array[indx] = new TerrainData(GameTile.Nothing, false);
      }

      const test_map = new GameMap(10, 10);

      for (let i = 0; i < test_map.data.length; ++i) {
        test_map.data[i] = new TerrainData(GameTile.WallOne, true);
      }

      basic_map.create_h_tunnel(test_map, 1, 8, 2);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            test_map.data[indx].tile === tile_array[indx].tile,
            "did not make a horizontal hallway coreclty"
          );
        }
      }
    });

    it("makes a vertical hallway correclty", () => {
      const basic_map = new BasicMap(feature, 1, width, height);

      const tile_array = Array(100);

      for (let i = 0; i < tile_array.length; ++i) {
        tile_array[i] = new TerrainData(GameTile.WallOne, true);
      }

      const x = 2;

      // make a hallway 8 down from 2,1 to 2,8
      for (let y = 1; y < 9; ++y) {
        const indx = x + (10 * y);

        tile_array[indx] = new TerrainData(GameTile.Nothing, false);
      }

      const test_map = new GameMap(10, 10);

      test_map.data = Array(10 * 10);

      for (let i = 0; i < test_map.data.length; ++i) {
        test_map.data[i] = new TerrainData(GameTile.WallOne, true);
      }

      basic_map.create_v_tunnel(test_map, 1, 8, 2);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            test_map.data[indx].tile === tile_array[indx].tile,
            "did not make a vertical hallway coreclty"
          );
        }
      }
    });
  });

  /** integration testing */
  describe("should make a full level correctly", () => {
    const seed = 3333;
    const width = 50;
    const height = 36;

    let feature: FeatureGenerator;
    let entitys: Entities;
    let scene: Scene;

    let basic_map: BasicMap;
    let made_map: GameMap;

    before(() => {
      feature = new FeatureGenerator(seed);
      entitys = new Entities();
      scene = new Scene();

      basic_map = new BasicMap(feature, 1, width, height);

      made_map = basic_map.make_map(entitys, scene);
    });

    it("sets width & height data correclty", () => {
      assert.ok(made_map.width === test_map_data.width,
        "did not set width data correctly");

      assert.ok(made_map.height === test_map_data.height,
        "did not set height data correctly");
    });

    // TODO: test for more data maybe
    it("makes the tile data correctly", () => {
      for (let y = 0; y < made_map.height; ++y) {
        for (let x = 0; x < made_map.width; ++x) {
          const indx = x + (10 * y);

          // assert that the basic_map generator makes the same map given the
          // the same seed
          assert.ok(
            made_map.data[indx].tile === test_map_data.data[indx].tile,
            "did not make map correctly with a given seed");
        }
      }
    });
  });
});
