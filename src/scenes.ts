/** a scene store
 *
 * this should be improved to be more dynamic allowing things like pause menus
 * to be expressed with a `Scene`
 */
import {Components} from "./components";
import {GameMap} from "./gameMap/gameMap";

export class Scene {
  gameMap: GameMap;

  player: number;

  components: Components;

  constructor() {
    this.player = 0;

    this.components = new Components();
  }
}

export class Scenes {
  scenes: Record<number, Scene>;

  newId: number;

  currentId: number;

  constructor() {
    this.scenes = {};
    this.newId = 0;
    this.currentId = 0;
  }

  newScene(): number {
    this.newId += 1;

    this.scenes[this.newId] = new Scene();

    return this.newId;
  }

  getScene(sceneId: number): Scene {
    return this.scenes[sceneId];
  }
}
