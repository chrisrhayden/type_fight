/** a scene store
 *
 * this should be improved to be more dynamic allowing things like pause menus
 * to be expressed with a `Scene`
 */
import {Components} from "./components";
import {GameMap} from "./game_map/game_map";

export class Scene {
  game_map: GameMap;

  player: number;

  components: Components;

  constructor() {
    this.player = 0;

    this.components = new Components();
  }
}

export class Scenes {
  scenes: Record<number, Scene>;

  new_id: number;

  current_id: number;

  constructor() {
    this.scenes = {};
    this.new_id = 0;
    this.current_id = 0;
  }

  new_scene(): number {
    this.new_id += 1;

    this.scenes[this.new_id] = new Scene();

    return this.new_id;
  }

  get_scene(scene_id: number): Scene {
    return this.scenes[scene_id];
  }
}
