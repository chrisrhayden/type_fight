import * as assert from "assert";

import {Components} from "./index";


describe("test Components", () => {
  const components = new Components();

  describe("gets created correctly", () => {
    // TODO: this is kinda useless as javascript doesn't have class level
    // variable definitions i think
    it("makes a blank objext in all values", () => {
      const entries = Object.values(components);

      for (const value of entries) {
        assert.ok(typeof value === "object", "type of value is not an objext");

        assert.ok(Object.keys(value).length === 0,
          "value is something other then an empty object");
      }
    });
  });
});
