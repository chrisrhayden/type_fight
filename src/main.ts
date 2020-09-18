import * as PIXI from "pixi.js";
import {GameTile, GameMap} from "./game_map";
import {BasicMap} from "./level_gen/bsic_rect";

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
      const sprites: PIXI.Spritesheet = resources[sprite_sheet].spritesheet;

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

  container: PIXI.Container;

  constructor(game_opts: GameOpts) {
    this.options = game_opts;
  }

  async init_game(): Promise<PIXI.Container> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet);

    const basic_map = new BasicMap(50, 36);

    this.game_map = basic_map.make_basic_map();

    this.sprite_map = Array(this.game_map.tiles.length);


    this.container = new PIXI.Container();

    this.container.x = 0;
    this.container.y = 0;

    this.render_map();

    return this.container;
  }

  run_game(): boolean {
    return true;
  }

  render_map(): boolean {
    this.container.x = 0;
    this.container.y = 0;

    const tile_w = 16;
    const tile_h = 16;

    const start = 0;

    let x = start;
    let y = start;

    let row_count = 0;


    for (let i = 0; i < this.game_map.tiles.length; ++i) {
      if (row_count === 50) {
        row_count = 0;
        x = start;

        y += tile_h;
      }

      const tile = this.game_map.tiles[i];

      this.sprite_map[i] = new PIXI.Sprite(
        this.sprite_sheet["textures"][tile.toString()]
      );

      this.sprite_map[i].x = x;
      this.sprite_map[i].y = y;

      this.container.addChild(this.sprite_map[i]);

      x += tile_w;
      row_count += 1;
    }

    return true;
  }
}

async function main(): Promise<void> {
  const sprite_sheet = "assets/pngs/colored_packed.json";

  const opts: GameOpts = {sprite_sheet};

  const game = new Game(opts);

  const container = await game.init_game();

  const app_opts: AppOpts = {
    width: 800,
    height: 600,
  };

  const app = init_pixi(app_opts);

  app.stage.addChild(container);

  app.ticker.add(() => game.run_game());
}

main();
