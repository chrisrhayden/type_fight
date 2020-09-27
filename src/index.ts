/** the main app entry point */
import * as PIXI from "pixi.js";

import * as ROT from "rot-js";

import {move_up, move_down, move_left, move_right} from "./systems/movement";
import {FeatureGenerator} from "./feature_generator";
import {BasicMap} from "./level_gen/basic_map";
import {Scenes, Scene} from "./scenes";
import {GameMap} from "./game_map/game_map";
import {Entities} from "./entities";
import {add_key} from "./keyboard";
import {run_ai} from "./systems/ai";
// import {GameTile} from "./tiles";

/** main game options
 *
 * this may be split up if more runtime options are added
 */
export interface GameOpts {
  // the sprite_sheet url
  sprite_sheet: string;
  // the sprite_sheet w,h
  sprite_size: [number, number];
  // the current rng seed
  rng_seed: number,
  // this is a bit wrong as it adds 1, (i.e. d = (r * 2) + 1)
  radius: number,
}

/** this is mostly to not have to look up the data again */
interface AppOpts {
  // default: 800
  width?: number,
  // default: 600
  height?: number,
  // default: false
  antialias?: boolean,
  // default: false
  transparent?: boolean,
  // default: 1
  resolution?: number,
}

// get a new pixi app
export function init_pixi(options: AppOpts): PIXI.Application {
  const app = new PIXI.Application(options);

  return app;
}

// TODO: this really needs to be improved
function load_assets(sprite_sheet: string): Promise<PIXI.Spritesheet> {
  const loader = PIXI.Loader.shared;

  return new Promise<PIXI.Spritesheet>((resolve, reject) => {
    loader.add(sprite_sheet).load((_loader, resources) => {
      const sprites: PIXI.Spritesheet = resources[sprite_sheet].spritesheet;

      if (sprites && sprites["textures"]) {
        resolve(sprites);
      } else {
        reject("cant make sprites");
      }
    });
  });
}

/** run rot-js.fov.PreciseShadowcasting
 *
 * use rot-js's precise shadowcasting algorithm
 */
function compute_fov(radius: number, scene: Scene, ent: number): boolean {
  // light_passes is a predicate if light passes
  const light_passes = (x: number, y: number): boolean => {
    const indx = x + (scene.game_map.width * y);

    if (indx < 0 || indx >= scene.game_map.data.length) {
      return false;
    }

    return scene.game_map.data[indx].blocks === false;
  };

  // this what to do when once in entity's view
  const cell_logic = (x: number, y: number, r: number, visibility: number) => {
    const indx = x + (scene.game_map.width * y);

    if (indx < 0 || indx >= scene.game_map.data.length) {
      return false;
    }

    // visibility could be used to adjust tint at some point
    if (visibility > 0 && r <= radius) {
      scene.game_map.data[indx].visible = true;

      scene.game_map.data[indx].visited = true;
    }
  };

  const fov = new ROT.FOV.PreciseShadowcasting(light_passes);

  const indx = scene.components.position[ent];

  const p_x = indx % scene.game_map.width;
  const p_y = Math.floor(indx / scene.game_map.width);

  fov.compute(p_x, p_y, radius, cell_logic);

  return true;
}

enum GameState {
  PlayerTurn,
  AiTurn,
  Pause,
  MainMenu,
}

// NOTE: this class is so big at the moment as there is so much context that
// needs to be shared between functions like sprite_sheet and scene.components
export class Game {
  options: GameOpts;

  // display containers, sprites are add to a container and pixi will draw them
  // from there
  containers: Record<string, PIXI.Container>;

  // the current sprite_sheet that everything will be drawn from
  sprite_sheet: PIXI.Spritesheet;

  // the sprites for the map
  sprite_map: PIXI.Sprite[];

  // a cache for entity sprites
  entity_sprites: Record<number, PIXI.Sprite>;

  // a class containing the game scenes
  scenes: Scenes;

  // a class to make unique entities
  entities: Entities;

  feature_generator: FeatureGenerator;

  // the current scene being used
  current_scene: number;

  game_state: GameState;

  events: KeyboardEvent[];

  keys: Record<string, () => void>;

  // just set the options and the init_game function will load the data
  constructor(game_opts: GameOpts) {
    this.options = game_opts;
  }

  /** the real constructor
   *
   * so we can load things asynchronously
   *
   * all class variables must be initialized in this function before continuing
   */
  async init_game(): Promise<Record<string, PIXI.Container> | null> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet);

    this.entities = new Entities();

    this.scenes = new Scenes();

    this.current_scene = this.scenes.new_scene();

    const cur_scene = this.scenes.get_scene(this.current_scene);

    this.feature_generator = new FeatureGenerator(this.options.rng_seed);

    const game_map = new BasicMap(this.feature_generator, 1, 50, 36)
      .make_map(this.entities, cur_scene);

    cur_scene.game_map = game_map;

    this.containers = {
      map: new PIXI.Container(),
      entities: new PIXI.Container(),
    };

    this.sprite_map = Array(game_map.data.length);

    this.make_sprite_map(game_map);

    this.entity_sprites = {};

    this.render_entities(cur_scene);

    this.game_state = GameState.PlayerTurn;

    if (!compute_fov(this.options.radius, cur_scene, cur_scene.player)) {
      console.error("could not compute fov");

      return null;
    }


    if (!this.render_map(cur_scene)) {
      console.error("could not render the map");

      return null;
    }

    this.events = [];
    this.keys = {};

    this.add_keys();

    // return the containers to be added by the app
    return this.containers;
  }

  /** add default keys */
  add_keys(): boolean {
    this.keys["w"] = add_key(this.events, "w");

    this.keys["d"] = add_key(this.events, "d");

    this.keys["a"] = add_key(this.events, "a");

    this.keys["s"] = add_key(this.events, "s");

    return true;
  }

  /** make the sprite_map from the game_map */
  make_sprite_map(game_map: GameMap): boolean {
    // get the sprite size to correctly increment the x,y axis
    const [tile_w, tile_h] = this.options.sprite_size;

    // so we can offset the map
    const start = 0;

    let x = start;
    // we can add a start_y if needed
    let y = start;

    // so we can break at the right row
    let row_count = 0;

    // we count the map tiles and do the math to place it on the screen
    for (let i = 0; i < game_map.data.length; ++i) {
      // because we start at 0 if we are on the map width we have gone over the
      // end of the row and need to start x at the `start` position and
      // increment the y to start the net row
      if (row_count === game_map.width) {
        // this should be zero as we are counting the map row
        row_count = 0;

        x = start;

        y += tile_h;
      }

      // set the sprite_map to the given Sprite
      this.sprite_map[i] = new PIXI.Sprite(
        this.sprite_sheet["textures"][game_map.data[i].tile.toString()]
      );

      // set the sprite to right place in the screen
      this.sprite_map[i].x = x;
      this.sprite_map[i].y = y;

      // set the sprite's visible to false allowing fov to work
      this.sprite_map[i].visible = false;

      // add the sprite to the map_container so it will get added to the app
      this.containers["map"].addChild(this.sprite_map[i]);

      x += tile_w;
      row_count += 1;
    }

    return true;
  }

  /** update the map tiles */
  render_map(scene: Scene): boolean {
    for (let i = 0; i < scene.game_map.data.length; ++i) {
      // if currently visible
      if (scene.game_map.data[i].visible === true) {
        this.sprite_map[i].visible = true;

        // this resets tint's
        this.sprite_map[i].tint = 0xFFFFFF;

        // if the tile has been visited before
      } else if (scene.game_map.data[i].visited === true) {
        this.sprite_map[i].visible = true;

        // tint grey
        this.sprite_map[i].tint = 0x808080;

      } else {
        // dont display at all
        this.sprite_map[i].visible = false;
      }
    }

    return true;
  }

  /** update all active entities */
  render_entities(scene: Scene): boolean {
    // get an iterator over the keys and values for the active entities
    const entries = Object.entries(scene.components.active_entities);

    for (const [id, entity] of entries) {
      // add the entity if it does not exists
      if ((id in this.entity_sprites) === false) {
        this.entity_sprites[id] = new PIXI.Sprite(
          this.sprite_sheet["textures"][entity.tile.toString()]
        );

        this.containers["entities"].addChild(this.entity_sprites[id]);
      }

      const indx = scene.components.position[id];

      // if entity is in the player's view
      if (scene.game_map.data[indx].visible === true) {
        const tile_x = indx % scene.game_map.width;
        const tile_y = Math.floor(indx / scene.game_map.width);

        // multiply by the sprite size to place on screen correctly
        this.entity_sprites[id].x = tile_x * this.options.sprite_size[0];
        this.entity_sprites[id].y = tile_y * this.options.sprite_size[1];

        this.entity_sprites[id].visible = true;

      } else {
        this.entity_sprites[id].visible = false;
      }
    }

    // now for the player
    const pos = scene.components.position[scene.player];

    const x = pos % scene.game_map.width;
    const y = Math.floor(pos / scene.game_map.width);

    if (scene.player in this.entity_sprites) {
      this.entity_sprites[scene.player].x = x * this.options.sprite_size[0];
      this.entity_sprites[scene.player].y = y * this.options.sprite_size[0];
    } else {
      this.entity_sprites[scene.player] = new PIXI.Sprite(
        this.sprite_sheet["textures"]["27"]
      );

      this.entity_sprites[scene.player].x = x * this.options.sprite_size[0];
      this.entity_sprites[scene.player].y = y * this.options.sprite_size[0];

      this.containers["entities"].addChild(this.entity_sprites[scene.player]);
    }

    return true;
  }

  /** a game tick
   *
   * this functions will be called 60 * sec or as much as possible
   */
  game_tick(): boolean {
    // grab the current scene
    const cur_scene = this.scenes.get_scene(this.current_scene);

    // if its the players turn
    if (this.game_state === GameState.PlayerTurn) {
      let taken = false;

      let evt = this.events.shift();

      // consume all evt's for this frame
      while (evt !== undefined) {
        if (evt.type === "keydown") {
          // case fall though as the default is so fucking stupid
          switch (evt.key) {
            case "w":
              taken = move_up(cur_scene, cur_scene.player);
              break;
            case "a":
              taken = move_left(cur_scene, cur_scene.player);
              break;
            case "s":
              taken = move_down(cur_scene, cur_scene.player);
              break;
            case "d":
              taken = move_right(cur_scene, cur_scene.player);
              break;
          }
        }

        evt = this.events.shift();
      }

      // if the player takes a turn then let ai take a turn
      if (taken) {
        this.game_state = GameState.AiTurn;
      }
    }

    // if its the ai's turn
    if (this.game_state === GameState.AiTurn) {
      // reset visibility
      for (let i = 0; i < cur_scene.game_map.data.length; ++i) {
        cur_scene.game_map.data[i].visible = false;
      }

      // compute_fov needs to be run first
      if (!compute_fov(this.options.radius, cur_scene, cur_scene.player)) {
        console.error("could not compute fov");

        return false;
      }

      if (!run_ai(cur_scene)) {
        console.error("could not run ai");

        return false;
      }

      if (!this.render_map(cur_scene)) {
        console.error("could not render the map");

        return false;
      }

      if (!this.render_entities(cur_scene)) {
        console.error("could not render entities");

        return false;
      }

      // let the player take a turn
      this.game_state = GameState.PlayerTurn;
    }

    return true;
  }
}

export async function start_game(app: PIXI.Application): Promise<void> {
  const opts: GameOpts = {
    rng_seed: 3333,
    sprite_sheet: "assets/pngs/colored_packed.json",
    sprite_size: [16, 16],
    radius: 3,
  };

  // get a new game
  const game = new Game(opts);

  // wait for the game to load the assets
  const container = await game.init_game();

  // test if the game was created correctly
  if (!container) {
    return;
  }

  // add the game containers to the app
  app.stage.addChild(container["map"]);
  app.stage.addChild(container["entities"]);

  // add the game logic to the app loop
  app.ticker.add(() => {
    if (!game.game_tick()) {
      // hmm, idk how i feel about this
      app.ticker.stop();
    }
  });
}
