/** the main app entry point */
import * as PIXI from "pixi.js";

import * as ROT from "rot-js";

import {make_default_keys} from "./keyboard";
import {run_ai} from "./systems/ai";
import {handle_input} from "./systems/input";
import {Entities} from "./entities";
import {Scenes, Scene} from "./scenes";
import {GameMap} from "./game_map/game_map";
import {BasicMap} from "./level_gen/basic_map";
import {FeatureGenerator} from "./feature_generator";

/** main game options */
export interface GameOpts {
  // the sprite_sheet url
  sprite_sheet_data_path: string;
  // the sprite_sheet w,h
  sprite_size: [number, number];
  // the current rng seed
  rng_seed: number,
  // this is a bit wrong as it adds 1, (i.e. d = (r * 2) + 1)
  radius: number,
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

/** compute fov
 *
 * use rot-js's precise shadowcasting algorithm
 */
function compute_fov(radius: number, scene: Scene, ent: number): boolean {
  if ((ent in scene.components.position) === false) {
    console.error("entity does not have a position");

    return false;
  }

  // if light_passes the cell
  const light_passes = (x: number, y: number): boolean => {
    const indx = x + (scene.game_map.width * y);

    if (indx < 0 || indx >= scene.game_map.data.length) {
      return false;
    }

    if (scene.game_map.data[indx].blocks === true) {
      return false;
    }

    const entities = Object.entries(scene.components.active_entities);
    for (const [id, ent] of entities) {
      if ((id in scene.components.position) === false) {
        continue;
      }

      if (scene.components.position[id] === indx) {
        return ent.blocks_light === false;
      }
    }

    return true;
  };

  // this what to do when once a tile is in the players view and light passes
  const cell_logic = (x: number, y: number, r: number, visibility: number) => {
    const indx = x + (scene.game_map.width * y);

    if (indx < 0 || indx >= scene.game_map.data.length) {
      return false;
    }

    // visibility could be used to adjust tint at some point
    if (visibility > 0 && r <= radius) {
      // index will always be in map data if passes the first if, hopefully
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

/** the main data class
 *
 * this class is just a wrapper around the data being used by the game
 */
export class GameData {
  // a class containing the game scenes
  scenes: Scenes;
  // a class to make unique entities
  entities: Entities;
  // a class to abstract the making of game features like monsters and items
  feature_generator: FeatureGenerator;

  constructor(seed: number) {
    this.entities = new Entities();

    this.scenes = new Scenes();

    this.feature_generator = new FeatureGenerator(seed);
  }
}

// this is just flow control for the main game loop
enum LoopState {
  PlayerTurn,
  AiTurn,
  Pause,
  MainMenu,
}

/** the game
 *
 * this makes up the basic structure of the game and the main flow control
 */
export class Game {
  options: GameOpts;
  game_data: GameData;

  // the current sprite_sheet that everything will be drawn from
  sprite_sheet: PIXI.Spritesheet;

  // display containers, sprites are add to a container and pixi will draw them
  // from there
  containers: Record<string, PIXI.Container>;

  // the sprites for the map
  sprite_map: PIXI.Sprite[];
  // a cache for entity sprites
  entity_sprites: Record<number, PIXI.Sprite>;

  // the input events from the user
  events: KeyboardEvent[];

  // the registered keys
  keys: Record<string, () => void>;

  // the current scene being used
  current_scene: number;

  // the game loop state
  game_state: LoopState;

  // just set the options and the init_game function will actually load the data
  constructor(game_opts: GameOpts, game_data: GameData) {
    this.options = game_opts;

    this.game_data = game_data;
  }

  /** the real constructor
   *
   * so we can load things asynchronously
   *
   * all class variables must be initialized in this function before continuing
   *
   * this needs to also run all setup functions, it will change to loading a
   * main menu at some point
   */
  async init_game(): Promise<Record<string, PIXI.Container> | null> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet_data_path);

    this.current_scene = this.game_data.scenes.new_scene();

    const cur_scene = this.game_data.scenes.get_scene(this.current_scene);

    const basic_map = new BasicMap(this.game_data.feature_generator, 1, 50, 36);

    cur_scene.game_map = basic_map.make_map(this.game_data.entities, cur_scene);

    if (cur_scene.game_map.data.length === 0) {
      return null;
    }

    this.containers = {
      map: new PIXI.Container(),
      entities: new PIXI.Container(),
    };

    this.make_sprite_map(cur_scene.game_map);

    this.entity_sprites = {};

    this.render_entities(cur_scene);

    this.game_state = LoopState.PlayerTurn;

    this.events = [];

    this.keys = {};

    if (!make_default_keys(this.keys, this.events)) {
      console.error("could not make default keys");

      return null;
    }

    if (!compute_fov(this.options.radius, cur_scene, cur_scene.player)) {
      console.error("could not compute fov");

      return null;
    }

    if (!this.render_map(cur_scene)) {
      console.error("could not render the map");

      return null;
    }

    if (!this.render_entities(cur_scene)) {
      console.error("could not render the entities");

      return null;
    }

    // return the containers to be added by the app
    return this.containers;
  }

  /** make the sprite_map from the game_map
   *
   * this will make the sprite map array
   */
  make_sprite_map(game_map: GameMap): boolean {
    if (game_map.data === undefined || game_map.data.length === 0) {
      return false;
    }

    this.sprite_map = Array(game_map.data.length);

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

        y += this.options.sprite_size[1];
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

      x += this.options.sprite_size[0];
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
    const entities = Object.entries(scene.components.active_entities);

    for (const [id, entity] of entities) {
      // dont bother if it doesn't have a position
      if ((id in scene.components.position) === false) {
        continue;
      }

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
        this.sprite_sheet["textures"][scene.components.player[scene.player]]
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
    const cur_scene = this.game_data.scenes.get_scene(this.current_scene);

    // if its the players turn
    if (this.game_state === LoopState.PlayerTurn) {
      let taken = false;

      let evt = this.events.shift();

      // consume all evt's for this frame, this could be changed to only allow
      // for one thing to happen as its possible i think to get more the one
      // key press a frame
      while (evt !== undefined) {
        taken = handle_input(cur_scene, evt);

        evt = this.events.shift();
      }

      // if the player has taken a turn then let ai take a turn
      if (taken) {
        this.game_state = LoopState.AiTurn;
      }
    }

    // if its the ai's turn
    if (this.game_state === LoopState.AiTurn) {
      // reset visibility
      for (let i = 0; i < cur_scene.game_map.data.length; ++i) {
        cur_scene.game_map.data[i].visible = false;
      }

      // compute_fov needs to be run first
      if (!compute_fov(this.options.radius, cur_scene, cur_scene.player)) {
        console.error("could not compute fov");

        return false;
      }

      // ai should be run before rendering
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

      // make sure to let the player take a turn next frame
      this.game_state = LoopState.PlayerTurn;
    }

    return true;
  }
}

/** start the game
 *
 *.then this give async context allowing for many other thighs like making levels or
 * loading assets to run asynchronously as well not having to use
 * callbacks like `.then()`
 */
export async function start_game(
  app: PIXI.Application,
  game_opts: GameOpts,
  game_data: GameData
): Promise<void> {
  // get a new game
  const game = new Game(game_opts, game_data);

  // wait for the game to load the assets
  const containers = await game.init_game();

  // test if the game was created correctly
  if (!containers) {
    return;
  }

  // add the game containers to the app
  app.stage.addChild(containers["map"]);
  app.stage.addChild(containers["entities"]);

  // add the game logic to the app loop
  app.ticker.add(() => {
    if (!game.game_tick()) {
      // hmm, idk how i feel about this
      app.ticker.stop();
    }
  });
}
