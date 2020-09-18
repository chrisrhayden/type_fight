import * as PIXI from "pixi.js";
import {GameMap} from "./game_map/game_map";
import {BasicMap} from "./level_gen/bsic_rect";

interface GameOpts {
  sprite_sheet: string;
  sprite_size: [number, number];
}

interface AppOpts {
  width?: number,        // default: 800
  height?: number,       // default: 600
  antialias?: boolean,   // default: false
  transparent?: boolean, // default: false
  resolution?: number,   // default: 1
}

// get a new pixi app
function init_pixi(options: AppOpts): PIXI.Application {
  const app = new PIXI.Application(options);

  // add the new app to the current page
  document.body.appendChild(app.view);

  return app;
}

// TODO: this really needs to be improved
function load_assets(sprite_sheet: string): Promise<PIXI.Spritesheet> {
  const loader = PIXI.Loader.shared;

  return new Promise<PIXI.Spritesheet>((resolve, reject) => {
    loader.add(sprite_sheet).load((_loader, resources) => {
      const sprites: PIXI.Spritesheet = resources[sprite_sheet].spritesheet;

      console.log(sprites);

      if (sprites && sprites["textures"]) {
        resolve(sprites);
      } else {
        reject("cant make sprites");
      }
    });
  });
}

class Game {
  options: GameOpts;

  // idk if i should use only one container or many, sigh
  container: PIXI.Container;

  // the current sprite_sheet that everything will be drawn from
  sprite_sheet: PIXI.Spritesheet;

  // a struct to hold the game map
  game_map: GameMap;
  // the sprites for the part of map that is currently in window view
  sprite_map: PIXI.Sprite[];

  // just set the options and the init_game function will load the data
  constructor(game_opts: GameOpts) {
    this.options = game_opts;
  }

  // this is the real constructor so we can load things asynchronously
  async init_game(): Promise<PIXI.Container> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet);

    // get a basic dungeon map
    this.game_map = new BasicMap(50, 36).make_basic_map();

    // get a container for the map sprites
    this.container = new PIXI.Container();

    // make the sprite_map array
    this.sprite_map = Array(this.game_map.tiles.length);


    // add the given sprites to the container and the sprite_map
    this.make_sprite_map();

    // return the container to be added by th app
    return this.container;
  }

  // make the sprite_map from the game_map
  make_sprite_map(): boolean {
    // get the sprite size to correctly increment the x,y axis
    const tile_w = this.options.sprite_size[0];
    const tile_h = this.options.sprite_size[1];

    // so we can offset the map
    const start = 0;

    let x = start;
    // we can add a start_y if needed
    let y = start;

    // so we can break at the right row
    let row_count = 0;

    // we count the map tiles and do the math to place it on the screen
    for (let i = 0; i < this.game_map.tiles.length; ++i) {
      // because we start at 0 if we are on the map width we have gone over the
      // end of the row and need to start x at the `start` position and
      // increment the y to start the net row
      if (row_count === this.game_map.width) {
        // this should be zero as we are counting the map row
        row_count = 0;

        x = start;

        y += tile_h;
      }

      // get the corresponding map tile
      const tile = this.game_map.tiles[i];

      // set the sprite_map to the given Sprite
      this.sprite_map[i] = new PIXI.Sprite(
        this.sprite_sheet["textures"][tile.toString()]
      );

      // set the sprite to right place in the screen
      this.sprite_map[i].x = x;
      this.sprite_map[i].y = y;

      // add the sprite to the map_container so it will get added to the app
      this.container.addChild(this.sprite_map[i]);

      x += tile_w;
      row_count += 1;
    }

    return true;
  }

  // TODO: make game
  run_game(): boolean {
    return true;
  }
}

async function run(): Promise<void> {
  // pixi options
  const app_opts: AppOpts = {
    width: 800,
    height: 600,
  };

  // get a new pixi.js context
  const app = init_pixi(app_opts);

  const sprite_sheet = "assets/pngs/colored_packed.json";

  const opts: GameOpts = {
    sprite_sheet,
    sprite_size: [16, 16],
  };

  // get a new game
  const game = new Game(opts);

  // wait for the game to load the assets
  const container = await game.init_game();

  // add the game container to the app
  app.stage.addChild(container);

  // add the game logic to the app loop
  app.ticker.add(() => game.run_game());
}

function main() {
  // so we can evenly catch errors and do something about them
  run().catch(console.log);
}

main();
