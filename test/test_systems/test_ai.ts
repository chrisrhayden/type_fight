import * as assert from "assert";

import * as sinon from "sinon";

import {GameTile, Ai, make_ent, Scene, GameMap, TerrainData} from "../index";

import * as ROT from "rot-js";
import * as Move from "../../src/systems/movement";
import * as AiSys from "../../src/systems/ai";
import * as Attack from "../../src/systems/attack";

describe("test ai", () => {
  const scene = new Scene();
  scene.game_map = new GameMap(20, 20);

  for (let i = 0; i < scene.game_map.data.length; ++i) {
    scene.game_map.data[i] = new TerrainData(GameTile.Nothing, false);
    scene.game_map.data[i].visible = true;
  }

  const player_id = 1;
  // const player_ent = make_ent();

  scene.player = player_id;
  scene.components.position[player_id] = 200;

  const ent_one_id = 2;
  const ent_one = make_ent();

  scene.components.position[ent_one_id] = 202;
  scene.components.ai[ent_one_id] = Ai.Enemy;
  scene.components.active_entities[ent_one_id] = ent_one.base_entity;

  describe("should move enemy entities around player correctly", () => {
    let mock_move_to: sinon.SinonStub;
    let mock_astar: sinon.SinonStub;
    let mock_attack_ent: sinon.SinonStub;

    // let run_ai: (scene: Scene) => boolean;
    // let mock_ai_sys: sinon.SinonMock;
    // let mock_astar_call: sinon.SinonStub;

    const mock_ai_sys = sinon.mock(AiSys);

    const run_ai = AiSys.run_ai;

    const ai_call = AiSys.astar_callback();

    ai_call.prototype.points = [[2, 10], [1, 10], [0, 10]];

    before(() => {
      mock_astar = sinon.stub(ROT.Path.AStar.prototype, "compute");

      mock_move_to = sinon.stub(Move, "move_to");

      mock_move_to.returns(false);

      mock_attack_ent = sinon.stub(Attack, "attack_ent");
    });

    beforeEach(() => {
      // NOTE: idk why but this needs to be called every time
      const mock_astar_call = mock_ai_sys.expects("astar_callback");

      mock_astar_call.callsFake(() => {
        return ai_call;
      });

      scene.components.position[player_id] = 200;

      scene.components.position[ent_one_id] = 202;
    });

    it("enemy moves towards the player", () => {
      mock_move_to.returns(true);

      run_ai(scene);

      console.log(mock_move_to.args);

      assert.ok(mock_move_to.calledWith(scene, "2", 201),
        "did not make valid move");
    });

    it("does not attack the player if not moving in them", () => {
      run_ai(scene);

      assert.ok(mock_attack_ent.calledOnce === true,
        "entity did attack the player");
    });

    it("enemy attacks thet player instead of moving in to them", () => {
      scene.components.position[player_id] = 201;

      run_ai(scene);

      assert.ok(mock_attack_ent.calledWith(scene, "2", 1),
        "did not attack the player");
    });

    it("non enemy entity does not attack the player", () => {
      scene.components.position[player_id] = 201;

      scene.components.ai[ent_one_id] = Ai.Peaceful;

      run_ai(scene);

      assert.ok(mock_attack_ent.calledOnce === true,
        "entity did attack the player");
    });

    it("returns false if no data added from compute callback", () => {
      ai_call.prototype.points = [];

      assert.ok(run_ai(scene) === false,
        "some how got data in compute callback");

      assert.ok(mock_attack_ent.calledOnce === true,
        "entity did attack the player");
    });

    after(() => {
      mock_astar.restore();
      mock_move_to.restore();
      mock_attack_ent.restore();
      mock_ai_sys.restore();
    });
  });
});
