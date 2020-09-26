/** the main app entry point */
import * as PIXI from "pixi.js";

import {FeatureGenerator} from "./feature_generator";
import {BasicMap} from "./level_gen/basic_map";
import {Scenes} from "./scenes";
import {GameMap} from "./game_map/game_map";
import {Entities} from "./entities";
import {add_key} from "./keyboard";
import {GameTile} from "./tiles";

export interface GameOpts {
  sprite_sheet: string;
  sprite_size: [number, number];
  rng_seed: number,
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
  document.getElementById("game-div").appendChild(app.view);

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

// NOTE: this class is so big at the moment as there is so much context that
// needs to be shared between functions like sprite_sheet and scene.components
class Game {
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

  // just set the options and the init_game function will load the data
  constructor(game_opts: GameOpts) {
    this.options = game_opts;
  }

  // this is the real constructor so we can load things asynchronously
  async init_game(): Promise<Record<string, PIXI.Container> | null> {
    this.sprite_sheet = await load_assets(this.options.sprite_sheet);

    this.entities = new Entities();

    this.scenes = new Scenes();

    // get a new scene and make it the current_scene
    this.current_scene = this.scenes.new_scene();

    const cur_scene = this.scenes.get_scene(this.current_scene);

    this.feature_generator = new FeatureGenerator(this.options.rng_seed);

    // get a basic dungeon map
    const game_map = new BasicMap(this.feature_generator, 50, 36)
      .make_map(this.entities, cur_scene);

    cur_scene.game_map = game_map;

    // get a containers for the sprites
    this.containers = {
      map: new PIXI.Container(),
      entities: new PIXI.Container(),
    };

    // make the sprite_map array
    this.sprite_map = Array(game_map.data.length);

    // add the given sprites to the container and the sprite_map
    this.make_sprite_map(game_map);

    // add the active entities to the screen
    //
    // this will be used in the game loop so we also instantiate the
    // entity_sprites in this function rather then that one
    this.entity_sprites = {};

    this.render_entities();

    this.add_keys();

    // a sanity check
    if (this.current_scene === 0
      || this.containers["map"].children.length === 0
      || this.containers["entities"].children.length === 0) {

      console.error("did no make the game data correctly");

      return null;
    }

    // return the containers to be added by the app
    return this.containers;
  }

  // make the sprite_map from the game_map
  make_sprite_map(game_map: GameMap): boolean {
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

      // get the corresponding map tile
      const map_tile = game_map.data[i];

      // set the sprite_map to the given Sprite
      this.sprite_map[i] = new PIXI.Sprite(
        this.sprite_sheet["textures"][map_tile.terrain_data.tile.toString()]
      );

      // set the sprite to right place in the screen
      this.sprite_map[i].x = x;
      this.sprite_map[i].y = y;

      // add the sprite to the map_container so it will get added to the app
      this.containers["map"].addChild(this.sprite_map[i]);

      x += tile_w;
      row_count += 1;
    }

    return true;
  }

  location_unblocked(index: number): boolean {
    const cur_scene = this.scenes.get_scene(this.current_scene);

    if (cur_scene.game_map.data[index].terrain_data.tile !== GameTile.Nothing) {
      return false;
    }

    const entities = Object.keys(cur_scene.components.active_entities);

    for (const id of entities) {
      const ent_indx = cur_scene.components.position[id];

      if (index === ent_indx) {
        return false;
      }
    }

    return true;
  }

  add_keys(): boolean {
    const w_key = add_key("w");

    w_key.press = () => {
      const cur_scene = this.scenes.get_scene(this.current_scene);

      const new_indx =
        cur_scene.components.position[cur_scene.player] - cur_scene.game_map.width;

      if (this.location_unblocked(new_indx)) {
        cur_scene.components.position[cur_scene.player] = new_indx;
      }
    };

    const d_key = add_key("d");

    d_key.press = () => {
      const cur_scene = this.scenes.get_scene(this.current_scene);

      const new_indx =
        cur_scene.components.position[cur_scene.player] + 1;

      if (this.location_unblocked(new_indx)) {
        cur_scene.components.position[cur_scene.player] = new_indx;
      }
    };

    const a_key = add_key("a");

    a_key.press = () => {
      const cur_scene = this.scenes.get_scene(this.current_scene);

      const new_indx =
        cur_scene.components.position[cur_scene.player] - 1;

      if (this.location_unblocked(new_indx)) {
        cur_scene.components.position[cur_scene.player] = new_indx;
      }
    };

    const s_key = add_key("s");

    s_key.press = () => {
      const cur_scene = this.scenes.get_scene(this.current_scene);

      const new_indx =
        cur_scene.components.position[cur_scene.player] + cur_scene.game_map.width;

      if (this.location_unblocked(new_indx)) {
        cur_scene.components.position[cur_scene.player] = new_indx;
      }
    };

    return true;
  }

  // update all active entities to there current position
  render_entities(): boolean {
    // idk if we should pass this in
    const cur_scene = this.scenes.get_scene(this.current_scene);

    // get an iterator over the keys and values for the active entities
    const entries = Object.entries(cur_scene.components.active_entities);

    for (const [id, entity] of entries) {
      const pos = cur_scene.components.position[id];

      const x = pos % cur_scene.game_map.width;
      const y = Math.floor(pos / cur_scene.game_map.width);

      if (id in this.entity_sprites) {
        // multiply by the sprite size to place on screen correctly
        this.entity_sprites[id].x = x * this.options.sprite_size[0];
        this.entity_sprites[id].y = y * this.options.sprite_size[0];

      } else {
        this.entity_sprites[id] = new PIXI.Sprite(
          this.sprite_sheet["textures"][entity.tile.toString()]
        );

        this.entity_sprites[id].x = x * this.options.sprite_size[0];
        this.entity_sprites[id].y = y * this.options.sprite_size[0];

        this.containers["entities"].addChild(this.entity_sprites[id]);
      }
    }

    // now for the player
    const pos = cur_scene.components.position[cur_scene.player];

    const x = pos % cur_scene.game_map.width;
    const y = Math.floor(pos / cur_scene.game_map.width);

    if (cur_scene.player in this.entity_sprites) {
      this.entity_sprites[cur_scene.player].x = x * this.options.sprite_size[0];
      this.entity_sprites[cur_scene.player].y = y * this.options.sprite_size[0];
    } else {
      this.entity_sprites[cur_scene.player] = new PIXI.Sprite(
        this.sprite_sheet["textures"]["27"]
      );

      this.entity_sprites[cur_scene.player].x = x * this.options.sprite_size[0];
      this.entity_sprites[cur_scene.player].y = y * this.options.sprite_size[0];

      this.containers["entities"].addChild(this.entity_sprites[cur_scene.player]);
    }

    return true;
  }

  // TODO: make game
  run_game(): boolean {
    if (!this.render_entities()) {
      console.error("could not render entities");

      return false;
    }

    return true;
  }
}

async function main(): Promise<void> {
  // pixi options
  const app_opts: AppOpts = {
    width: 800,
    height: 600,
  };

  // get a new pixi.js context
  const app = init_pixi(app_opts);

  const opts: GameOpts = {
    rng_seed: 3333,
    sprite_sheet: "assets/pngs/colored_packed.json",
    sprite_size: [16, 16],
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
    if (!game.run_game()) {
      // hmm, idk how i feel about this
      app.ticker.stop();
    }
  });
}

main().catch(console.error);