import * as assert from "assert";

import {FeatureGenerator} from "./index";

describe("test feature_generator", () => {
  const feature_generator = new FeatureGenerator(3333);

  describe("should init correclty", () => {
    // TODO: idk why this changes, like its different on the cli, W.T.F.
    it("sets seed correctly", () => {
      const one = feature_generator.rng.getUniform();

      assert.ok(one === 0.5761220559943467,
        "did not set seed"
      );

      const two = feature_generator.rng.getUniform();

      assert.ok(two === 0.7063745318446308, "did not set seed");
    });
  });
});
