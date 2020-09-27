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

import {GameTile, Rect, BasicMap, FeatureGenerator, Entities, Scene} from "../index";

describe("test basic_map", () => {
  /** unit testing */
  describe("should make rooms in to a map", () => {
    const seed = 3333;

    const width = 10;
    const height = 10;

    const feature = new FeatureGenerator(seed);


    it("makes a room correclty", () => {
      const basic_map = new BasicMap(feature, width, height);

      const made_tiles = Array(100).fill(GameTile.WallOne);

      // carve a 8,8 square in to the made_tiles
      for (let y = 2; y < 9; ++y) {
        for (let x = 2; x < 9; ++x) {
          const indx = x + (10 * y);

          made_tiles[indx] = GameTile.Nothing;
        }
      }


      const room = new Rect(1, 1, 8, 8);

      basic_map.create_room(room);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            basic_map.game_map.data[indx].tile === made_tiles[indx],
            "did make a room coreclty");
        }

      }
    });

    it("makes a horizontal hallway correclty", () => {
      const basic_map = new BasicMap(feature, width, height);

      const made_tiles = Array(100).fill(GameTile.WallOne);

      const y = 2;

      // make a hallway 8 across from 1,2 to 8,2
      for (let x = 1; x < 9; ++x) {
        const indx = x + (10 * y);

        made_tiles[indx] = GameTile.Nothing;
      }

      basic_map.create_h_tunnel(1, 8, 2);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            basic_map.game_map.data[indx].tile === made_tiles[indx],
            "did make a horizontal hallway coreclty");
        }
      }
    });

    it("makes a vertical hallway correclty", () => {
      const basic_map = new BasicMap(feature, width, height);

      const made_tiles = Array(100).fill(GameTile.WallOne);

      const x = 2;

      // make a hallway 8 down from 2,1 to 2,8
      for (let y = 1; y < 9; ++y) {
        const indx = x + (10 * y);

        made_tiles[indx] = GameTile.Nothing;
      }

      basic_map.create_v_tunnel(1, 8, 2);

      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const indx = x + (10 * y);

          assert.ok(
            basic_map.game_map.data[indx].tile === made_tiles[indx],
            "did make a vertical hallway coreclty");
        }
      }
    });
  });


  /** integration testing */
  describe("should make a full level correctly", () => {
    const seed = 3333;
    const width = 50;
    const height = 36;

    const feature = new FeatureGenerator(seed);
    const entitys = new Entities();
    const scene = new Scene();

    const basic_map = new BasicMap(feature, width, height);

    const made_map = basic_map.make_map(entitys, scene);

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
            made_map.data[indx].tile
            === test_map_data.data[indx].tile,
            "did not make map correctly with a given seed");
        }
      }
    });
  });
});
