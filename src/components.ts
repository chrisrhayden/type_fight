import {GameTile} from "./tiles";

enum Ai {
  Peaceful,
  Enemy,
}

class ActiveEntity {
  ai: Ai;
  tile: GameTile;
}

export class Components {
  position: Record<number, number>;
  active_entities: Record<number, ActiveEntity>;

  constructor() {
    this.position = {};
    this.active_entities = {};
  }
}
