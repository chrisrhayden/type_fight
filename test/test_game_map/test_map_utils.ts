import * as assert from "assert";

import {Rect} from "../index";


describe("test map_utils", () => {
  const rect = new Rect(1, 1, 9, 9);

  describe("should create rectangle correctly", () => {
    it("sets x & y correctly", () => {
      assert.ok(rect.x1 === 1, "sets x1 to 1");
      assert.ok(rect.x2 === 10, "sets x1 to 1");

      assert.ok(rect.y1 === 1, "sets y1 to 1");
      assert.ok(rect.y2 === 10, "sets y1 to 1");
    });

    it("set the width to 9", () => {
      const delta = rect.x2 - rect.x1;

      assert.ok(delta === 9, "did not make a room 9 accros");
    });

    it("set the height to 9", () => {
      const delta = rect.y2 - rect.y1;

      assert.ok(delta === 9, "did not make a room 9 accros");
    });
  });
});
