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
    this.new_id = 1;
    this.current_id = 0;
  }

  new_scene(): number {
    const old_id = this.new_id;

    this.scenes[old_id] = new Scene();

    this.new_id += 1;

    return old_id;
  }

  get_scene(scene_id: number): Scene {
    return this.scenes[scene_id];
  }
}
