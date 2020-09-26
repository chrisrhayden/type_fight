import * as assert from "assert";

import {Components} from "./index";


describe("test Components", () => {
  const components = new Components();

  it("makes a blank objext in all values", () => {
    const entries = Object.values(components);

    for (const value of entries) {
      assert.ok(typeof value === "object", "type of value is not an objext");

      assert.ok(Object.keys(value).length === 0,
        "value is something other then an empty object");
    }
  });
});
