import * as assert from "assert";

import {Scenes} from "./index";


describe("test Scenes", () => {
  const scenes = new Scenes();

  describe("should make new scenes correctly", () => {
    // TODO: this is kinda useless as javascript doesn't have class level
    // variable definitions i think
    it("starts the id's at zero", () => {
      assert.ok(scenes.new_id === 0, "does not start id at zero");
    });

    it("make first scene at 1", () => {
      const n_id = scenes.new_scene();

      assert.ok(n_id === 1, "did not return the right id");
    });

    it("get first scene at 1", () => {
      const cur_scene = scenes.get_scene(1);

      assert.ok(cur_scene !== undefined,
        "did not get first scene from the scene store");
    });

    it("make second scene at 2", () => {
      const n_id = scenes.new_scene();

      assert.ok(n_id === 2, "did not return the right id");
    });

    it("get second scene at 2", () => {
      const cur_scene = scenes.get_scene(2);

      assert.ok(cur_scene !== undefined,
        "did not get second scene from the scene store");
    });
  });
});

describe("test Scene", () => {
  const scenes = new Scenes();
  scenes.new_scene();

  it("makes player start at zero", () => {
    assert.ok(scenes.get_scene(1).player === 0,
      "makes player at something other then zero");
  });

  it("makes with a component store", () => {
    assert.ok(scenes.get_scene(1).components !== undefined,
      "components ar undefined"
    );
  });
});

