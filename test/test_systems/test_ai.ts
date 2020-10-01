import * as assert from "assert";

import * as sinon from "sinon";

import {EntityPreFab, GameTile, Ai, make_ent, Scene, GameMap, TerrainData} from "../index";

import * as ROT from "rot-js";
import * as Move from "../../src/systems/movement";
import * as AiSys from "../../src/systems/ai";
import * as Attack from "../../src/systems/attack";

describe("test ai", () => {
  let scene: Scene;
  let run_ai: (scene: Scene) => boolean;

  let mock_astar_call: sinon.SinonStub;
  let mock_move_to: sinon.SinonStub;
  let mock_attack_ent: sinon.SinonStub;

  // let mock_astar: sinon.SinonStub;

  const player_id = 1;
  // let player_ent: EntityPreFab;

  const ent_one_id = 2;
  let ent_one: EntityPreFab;

  // let ai_call: (x: number, y: number) => void;
  let ai_call: AiSys.AstarCallback;

  before(() => {
    scene = new Scene();

    scene.game_map = new GameMap(20, 20);

    for (let i = 0; i < scene.game_map.data.length; ++i) {
      scene.game_map.data[i] = new TerrainData(GameTile.Nothing, false);
      scene.game_map.data[i].visible = true;
    }

    // player_ent = make_ent();

    scene.player = player_id;
    scene.components.position[player_id] = 200;

    ent_one = make_ent();

    scene.components.position[ent_one_id] = 202;
    scene.components.ai[ent_one_id] = Ai.Enemy;
    scene.components.active_entities[ent_one_id] = ent_one.base_entity;

    ai_call = new AiSys.AstarCallback();

    ai_call.points = [[2, 10], [1, 10], [0, 10]];

    mock_astar_call = sinon.stub(AiSys, "AstarCallback");

    mock_astar_call.returns(ai_call);

    run_ai = AiSys.run_ai;

    sinon.stub(ROT.Path.AStar.prototype, "compute");

    mock_move_to = sinon.stub(Move, "move_to");

    mock_attack_ent = sinon.stub(Attack, "attack_ent");
  });

  beforeEach(() => {
    mock_move_to.returns(false);

    scene.components.position[player_id] = 200;

    scene.components.position[ent_one_id] = 202;
  });

  describe("should move enemy entities around player correctly", () => {
    it("enemy moves towards the player", () => {
      mock_move_to.returns(true);

      run_ai(scene);

      assert.ok(mock_move_to.calledWith(scene, "2", 201),
        "did not make valid move");
    });

    it("does not attack the player if not moving in them", () => {
      run_ai(scene);

      assert.ok(mock_attack_ent.called === false,
        "entity did attack the player");
    });
  });

  describe("should attack player correctly", () => {
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

      scene.components.ai[ent_one_id] = Ai.Enemy;
    });

    it("returns false if no data added from compute callback", () => {
      ai_call.points = [];

      assert.ok(run_ai(scene) === false,
        "some how got data in compute callback");

      assert.ok(mock_attack_ent.calledOnce === true,
        "entity did attack the player");
    });
  });

  after(() => {
    // mock_astar_call.restore();
    // mock_move_to.restore();
    // mock_attack_ent.restore();
    sinon.restore();
  });
});
