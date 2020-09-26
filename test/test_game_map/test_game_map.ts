import * as assert from "assert";
import {describe, it} from "mocha";

import {GameMap} from "../index";

describe("testing game map", () => {
  const width = 10;
  const height = 10;

  const made_game_map = new GameMap(width, height);

  it("set the width & height correctly", () => {
    assert.ok(made_game_map.width === width, "did not set width correctly");
    assert.ok(made_game_map.height === height, "did not set height correctly");
  });

  it("makes the right amount of map objects", () => {
    assert.ok(made_game_map.data.length === 100,
      "did not make enugh map objest for the given width and height");
  });
});
