import * as ROT from "rot-js";
import * as RNG from "rot-js/lib/rng";

export class FeatureGenerator {
  rng: typeof RNG.default;

  constructor(seed: number) {
    this.rng = ROT.RNG;

    this.rng.setSeed(seed);
  }
}
