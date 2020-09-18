import * as PIXI from "pixi.js";
import {GameTile, GameMap} from "./game_map";
import {BasicMap} from "./map_gen/bsic_rect";

interface GameOpts {
  sprite_sheet: string;
}

interface AppOpts {
  width?: number,         // default: 800
  height?: number,        // default: 600
  antialias?: boolean,    // default: false
  transparent?: boolean, // default: false
  resolution?: number,       // default: 1
}

function init_pixi(options: AppOpts): PIXI.Application {
  const app = new PIXI.Application(options);

  document.body.appendChild(app.view);

  return app;
}

function load_assets(sprite_sheet: string): Promise<PIXI.Spritesheet> {
  const loader = PIXI.Loader.shared;

  const prom = new Promise<PIXI.Spritesheet>((resolve, reject) => {
    loader.add(sprite_sheet).load((_loader, resources) => {
      let sprites: PIXI.Spritesheet = resources[sprite_sheet].spritesheet;

      if (sprites) {
        resolve(sprites);
      } else {
        reject("cant make sprites");
      }
    });
  });

  return prom;
}

class Game {
  options: GameOpts;

  sprite_sheet: PIXI.Spritesheet;

  game_map: GameMap;
  sprite_map: PIXI.Sprite[];

  sprite_cache: Record<GameTile, PIXI.Sprite>;

  constructor(game_opts: GameOpts) {
    this.options = game_opts;
  }

  async init_game(): Promise<boolean> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet);

    this.game_map = new BasicMap(50, 36).make_basic_map();

    return true;
  }

  run_game(): boolean {
    this.render_map();
  }

  maintain() {
    for (let i in this.game_map.tiles) {
      let tile = this.game_map.tiles[i];

      let sp: PIXI.Sprite;

      if (!this.sprite_cache[tile]) {
        sp = new PIXI.Sprite(this.sprite_sheet[i]);

        this.sprite_cache[tile] = sp;
      } else {
        sp = this.sprite_cache[tile];
      }

      this.sprite_map[i] = sp;
    }
  }

  render(): boolean {
    if (!this.render_map()) {
      return false;
    }

    return true;
  }

  render_map(): boolean {
    const tile_w = 16;
    const tile_h = 16;

    const start = 0;

    let x = start;
    let y = start;

    let row_count = 0;

    for (const i in this.game_map.tiles) {

      if (row_count == 50) {
        x = start;

        y += tile_h;
      }

      let sprite;

      let map_sp = this.game_map.tiles[i];

      if (this.sprite_cache[map_sp]) {

      }


      x += tile_w;
    }

    return true;
  }

}

function main(): void {

  const sprite_sheet = "assets/pngs/colored_packed.json";

  const opts: GameOpts = {sprite_sheet};

  const game = new Game(opts);

  game.init_game()
    .catch(err => {
      console.error("Error:", err);
    });

  const app_opts: AppOpts = {
    width: 800,
    height: 600,
  };

  const app = init_pixi(app_opts);
}

main();
