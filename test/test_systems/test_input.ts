import * as assert from "assert";

import * as sinon from "sinon";

import {TestKey, Scene, GameMap, Ai} from "../index";

import * as Input from "../../src/systems/input";
import * as Attack from "../../src/systems/attack";
import * as Move from "../../src/systems/movement";

describe("test handle_input", () => {
  const player = 1;
  const ent_two_id = 2;
  const ent_three_id = 3;

  let scene: Scene;

  before(() => {
    scene = new Scene();
    scene.game_map = new GameMap(20, 20);
    scene.player = player;
  });

  describe("should call the right system based on input", () => {
    let mock_move_or_attack: sinon.SinonStub;

    let handle_input: (scene: Scene, evt: TestKey) => boolean;

    before(() => {
      mock_move_or_attack = sinon.stub(Input, "move_or_attack");

      mock_move_or_attack.returns(true);

      handle_input = Input.handle_input;
    });

    beforeEach(() => {
      scene.components.position[player] = 200;
      scene.components.position[ent_two_id] = 201;
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
    let mock_move_to: sinon.SinonStub;
    let mock_attack_ent: sinon.SinonStub;

    let move_or_attack: (scene: Scene, indx: number) => boolean;

    before(() => {
      scene.components.position[ent_two_id] = 201;

      scene.components.ai[ent_two_id] = Ai.Enemy;

      mock_move_to = sinon.stub(Move, "move_to");
      mock_move_to.returns(false);

      mock_attack_ent = sinon.stub(Attack, "attack_ent");
      mock_attack_ent.returns([false, true]);

      move_or_attack = Input.move_or_attack;
    });

    beforeEach(() => {
      mock_move_to.returns(false);

      scene.components.position[player] = 200;

      scene.components.position[ent_two_id] = 201;
    });

    it("attacks entity when moves in to an enemy", () => {
      move_or_attack(scene, 201);

      console.log(">>>>>>>>", mock_move_to.args);

      assert.ok(mock_move_to.calledWith(scene, player, 201),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledWith(scene, player, ent_two_id.toString()),
        "did not call attack_ent correctly"
      );
    });

    it("does not attacks entity when moves next to an enemy", () => {
      mock_move_to.returns(true);

      move_or_attack(scene, 181);

      assert.ok(mock_move_to.calledWith(scene, player, 181),
        "did not try and move to index");

      assert.ok(mock_attack_ent.called === true,
        "called attack_ent when is shouldn't"
      );
    });

    it("does not attacks entity when it does not have an ai", () => {
      scene.components.position[ent_three_id] = 221;

      move_or_attack(scene, 221);

      assert.ok(mock_move_to.calledWith(scene, player, 221),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledOnce,
        "called attack_ent when is shouldn't"
      );
    });

    it("does not attacks entity when it is not an enemy", () => {
      move_or_attack(scene, 221);

      scene.components.position[ent_three_id] = 221;
      scene.components.ai[ent_three_id] = Ai.Peaceful;

      assert.ok(mock_move_to.calledWith(scene, player, 221),
        "did not try and move to index");

      assert.ok(mock_attack_ent.calledOnce,
        "called attack_ent when is shouldn't"
      );
    });
  });

  after(() => {
    sinon.restore();
  });
});
