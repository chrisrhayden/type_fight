import * as assert from "assert";

import {FeatureGenerator} from "./index";


describe("test feature_generator", () => {
  const feature_generator = new FeatureGenerator(3333);

  describe("should init correclty", () => {
    it("sets seed correctly", () => {
      const one = feature_generator.rng.getUniform();

      assert.ok(one === 0.5532654351554811,
        "did not set seed"
      );

      const two = feature_generator.rng.getUniform();

      assert.ok(two === 0.7395488086622208,
        "did not set seed"
      );
    });
  });
});
