import * as assert from "assert";

import {Entities} from "./index";


describe("test Entities", () => {
  const entries = new Entities();

  describe("should create uniq ids", () => {
    it("inits ar zero", () => {
      assert.ok(entries.id === 0, "entities id does not start at zero");
    });

    it("makes first id at one", () => {
      const new_id = entries.new_id();

      assert.ok(new_id === 1, "did not start entities id at one");
    });
  });
});
