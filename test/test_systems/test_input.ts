import * as assert from "assert";

import * as sinon from "sinon";

import {TestKey, Scene, GameMap, Ai} from "../index";

import * as Input from "../../src/systems/input";
import * as Attack from "../../src/systems/attack";
import * as Move from "../../src/systems/movement";

describe("test handle_input", () => {
  describe("should call the right system based on input", () => {
    const ent_one_id = 1;
    const scene = new Scene();

    scene.game_map = new GameMap(20, 20);

    scene.player = ent_one_id;

    let handle_input: (scene: Scene, evt: TestKey) => boolean;

    let mock_move_or_attack: sinon.SinonStub;


    before(() => {
      mock_move_or_attack = sinon.stub(Input, "move_or_attack");

      mock_move_or_attack.returns(true);

      handle_input = Input.handle_input;
    });

    beforeEach(() => {
      scene.components.position[ent_one_id] = 200;
    });

    it("moves the player right", () => {
      const w = {type: "keydown", "key": "w"};

      handle_input(scene, w);

      assert.ok(mock_move_or_attack.calledWith(scene, 180),
        "did no call move_or_attack with 180");
    });

    it("moves the player down-left", () => {
      const z = {type: "keydown", "key": "z"};

      handle_input(scene, z);

      assert.ok(mock_move_or_attack.calledWith(scene, 219),
        "did no call move_or_attack with 180");
    });

    after(() => {
      mock_move_or_attack.restore();
    });
  });

  describe("should move or attack when 'moving' around an entity", () => {
    const ent_one_id = 1;
    const ent_two_id = 2;
    const ent_three_id = 3;

    const scene = new Scene();

    scene.game_map = new GameMap(20, 20);

    scene.player = ent_one_id;
    scene.components.position[ent_one_id] = 200;

    scene.components.position[ent_two_id] = 201;
    scene.components.ai[ent_two_id] = Ai.Enemy;

    let mock_move_to: sinon.SinonStub;
    let mock_attack_ent: sinon.SinonStub;
    let move_or_attack: (scene: Scene, indx: number) => boolean;

    before(() => {
      mock_move_to = sinon.stub(Move, "move_to");
      mock_move_to.returns(false);

      mock_attack_ent = sinon.stub(Attack, "attack_ent");
      mock_attack_ent.returns([false, true]);

      move_or_attack = Input.move_or_attack;
    });

    beforeEach(() => {
      scene.components.position[ent_one_id] = 200;
    });

    it("attacks entity when moves in to an enemy", () => {
      move_or_attack(scene, 201);

      assert.ok(mock_move_to.calledWith(scene, ent_one_id, 201),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledWith(scene, ent_one_id, ent_two_id.toString()),
        "did not call attack_ent correctly"
      );
    });

    it("does not attacks entity when moves next to an enemy", () => {
      mock_move_to.returns(true);

      move_or_attack(scene, 181);

      assert.ok(mock_move_to.calledWith(scene, ent_one_id, 181),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledOnce,
        "called attack_ent when is shouldn't"
      );

      mock_move_to.returns(false);
    });

    it("does not attacks entity when it does not have an ai", () => {
      scene.components.position[ent_three_id] = 221;

      move_or_attack(scene, 221);

      assert.ok(mock_move_to.calledWith(scene, ent_one_id, 221),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledOnce,
        "called attack_ent when is shouldn't"
      );
    });

    it("does not attacks entity when it is not an enemy", () => {
      move_or_attack(scene, 221);

      scene.components.position[ent_three_id] = 221;
      scene.components.ai[ent_three_id] = Ai.Peaceful;

      assert.ok(mock_move_to.calledWith(scene, ent_one_id, 221),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledOnce,
        "called attack_ent when is shouldn't"
      );
    });

    after(() => {
      mock_attack_ent.restore();
      mock_move_to.restore();

      sinon.reset();
    });
  });
});
