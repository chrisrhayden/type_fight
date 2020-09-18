import * as PIXI from "pixi.js";

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

function load_assets(sprite_sheet: string): Promise<unknown> {
  const loader = PIXI.Loader.shared;

  const prom = new Promise((resolve, reject) => {
    let sprites = {};

    loader.add(sprite_sheet).load((_loader, resources) => {
      sprites = resources[sprite_sheet].spritesheet;

      if (sprites) {
        resolve(sprites);
      } else {
        reject("cant make sprites");
      }
    });
  });

  return prom;
}

async function run_game(app_opts: AppOpts, game_opts: GameOpts): Promise<boolean> {
  const app = init_pixi(app_opts);

  const sheet = await load_assets(game_opts.sprite_sheet);

  const sp = new PIXI.Sprite(sheet["textures"]["1"]);

  const cont = new PIXI.Container();
  cont.addChild(sp);

  app.stage.addChild(cont);

  return true;
}

export default function main(): void {
  const sprite_sheet = "assets/pngs/colored_packed.json";

  const app_opts: AppOpts = {};

  const game_opts: GameOpts = {sprite_sheet};

  run_game(app_opts, game_opts)
    .then(() => {
      console.log("good bye");
    })
    .catch(err => {
      console.error("Error:", err);
    });
}

main();
