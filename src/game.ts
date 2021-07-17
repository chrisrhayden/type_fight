/** the main app entry point */
import * as PIXI from "pixi.js";

import * as ROT from "rot-js";

import { makeDefaultKeys } from "./keyboard";
import { runAi } from "./systems/ai";
import { handleInput } from "./systems/input";
import { Entities } from "./entities";
import { Scenes, Scene } from "./scenes";
import { GameMap } from "./gameMap/gameMap";
import { BasicMap } from "./levelGen/basicMap";
import { FeatureGenerator } from "./featureGenerator";

/** pixi options
 *
 * this is mostly to not have to look up the data again
 */
export type PixiOpts = {
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
};

/** main game options */
export interface GameOpts {
  // the spriteSheet url
  spriteSheetDataPath: string;
  // the spriteSheet w,h
  spriteSize: [number, number];
  // the current rng seed
  rngSeed: number;
  // this is a bit wrong as it adds 1, (i.e. d = (r * 2) + 1)
  radius: number;
}

// this is just flow control for the main game loop
enum LoopState {
  PlayerTurn,
  AiTurn,
  Pause,
  MainMenu,
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
  featureGenerator: FeatureGenerator;

  constructor(seed: number) {
    this.entities = new Entities();

    this.scenes = new Scenes();

    this.featureGenerator = new FeatureGenerator(seed);
  }
}

/** the game
 *
 * this makes up the basic structure of the game and the main flow control
 */
export class Game {
  options: GameOpts;
  gameData: GameData;

  // the current spriteSheet that everything will be drawn from
  spriteSheet: PIXI.Spritesheet;

  // display containers, sprites are added to a container and pixi will draw
  // them from there
  containers: Record<string, PIXI.Container>;

  // the sprites for the map
  spriteMap: PIXI.Sprite[];
  // a cache for entity sprites
  entitySprites: Record<number, PIXI.Sprite>;

  // the input events from the user
  events: KeyboardEvent[];

  // the registered keys
  keys: Record<string, () => void>;

  // the current scene being used
  currentScene: number;

  // the game loop state
  gameState: LoopState;

  // just set the options and the initGame function will actually load the data
  constructor(gameOpts: GameOpts, gameData: GameData) {
    this.options = gameOpts;

    this.gameData = gameData;
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
  async initGame(): Promise<Record<string, PIXI.Container> | null> {
    this.spriteSheet = await loadAssets(this.options.spriteSheetDataPath);

    this.currentScene = this.gameData.scenes.newScene();

    const curScene = this.gameData.scenes.getScene(this.currentScene);

    const basicMap = new BasicMap(this.gameData.featureGenerator, 1, 50, 36);

    curScene.gameMap = basicMap.makeMap(this.gameData.entities, curScene);

    if (curScene.gameMap.data.length === 0) {
      return null;
    }

    this.containers = {
      map: new PIXI.Container(),
      entities: new PIXI.Container(),
    };

    this.makeSpriteMap(curScene.gameMap);

    this.entitySprites = {};

    this.renderEntities(curScene);

    this.gameState = LoopState.PlayerTurn;

    this.events = [];

    this.keys = {};

    if (!makeDefaultKeys(this.keys, this.events)) {
      console.error("could not make default keys");

      return null;
    }

    if (!computeFov(this.options.radius, curScene, curScene.playerEnt)) {
      console.error("could not compute fov");

      return null;
    }

    if (!this.renderMap(curScene)) {
      console.error("could not render the map");

      return null;
    }

    if (!this.renderEntities(curScene)) {
      console.error("could not render the entities");

      return null;
    }

    // return the containers to be added by the app
    return this.containers;
  }

  /** make the spriteMap from the gameMap
   *
   * this will make the sprite map array
   */
  makeSpriteMap(gameMap: GameMap): boolean {
    if (gameMap.data === undefined || gameMap.data.length === 0) {
      return false;
    }

    this.spriteMap = Array(gameMap.data.length);

    // so we can offset the map
    const start = 0;

    let x = start;
    // we can add a startY if needed
    let y = start;

    // so we can break at the right row
    let rowCount = 0;

    // we count the map tiles and do the math to place it on the screen
    for (let i = 0; i < gameMap.data.length; ++i) {
      // because we start at 0 if we are on the map width we have gone over the
      // end of the row and need to start x at the `start` position and
      // increment the y to start the net row
      if (rowCount === gameMap.width) {
        // this should be zero as we are counting the map row
        rowCount = 0;

        x = start;

        y += this.options.spriteSize[1];
      }

      // set the spriteMap to the given Sprite
      this.spriteMap[i] = new PIXI.Sprite(
        this.spriteSheet["textures"][gameMap.data[i].tile.toString()]
      );

      // set the sprite to right place in the screen
      this.spriteMap[i].x = x;
      this.spriteMap[i].y = y;

      // set the sprite's visible to false allowing fov to work
      this.spriteMap[i].visible = false;

      // add the sprite to the mapContainer so it will get added to the app
      this.containers["map"].addChild(this.spriteMap[i]);

      x += this.options.spriteSize[0];
      rowCount += 1;
    }

    return true;
  }

  /** update the map tiles */
  renderMap(scene: Scene): boolean {
    for (let i = 0; i < scene.gameMap.data.length; ++i) {
      // if currently visible
      if (scene.gameMap.data[i].visible === true) {
        this.spriteMap[i].visible = true;

        // this resets tint's
        this.spriteMap[i].tint = 0xFFFFFF;

        // if the tile has been visited before
      } else if (scene.gameMap.data[i].visited === true) {
        this.spriteMap[i].visible = true;

        // tint grey
        this.spriteMap[i].tint = 0x808080;

      } else {
        // dont display at all
        this.spriteMap[i].visible = false;
      }
    }

    return true;
  }

  /** update all active entities */
  renderEntities(scene: Scene): boolean {
    // get an iterator over the keys and values for the active entities
    const entities = Object.entries(scene.components.activeEntities);

    for (const [id, entity] of entities) {
      // dont bother if it doesn't have a position
      if ((id in scene.components.position) === false) {
        continue;
      }

      // add the entity if it does not exists
      if ((id in this.entitySprites) === false) {
        this.entitySprites[id] = new PIXI.Sprite(
          this.spriteSheet["textures"][entity.tile.toString()]
        );

        this.containers["entities"].addChild(this.entitySprites[id]);
      }

      const indx = scene.components.position[id];

      // if entity is in the player's view
      if (scene.gameMap.data[indx].visible === true) {
        const tileX = indx % scene.gameMap.width;
        const tileY = Math.floor(indx / scene.gameMap.width);

        // multiply by the sprite size to place on screen correctly
        this.entitySprites[id].x = tileX * this.options.spriteSize[0];
        this.entitySprites[id].y = tileY * this.options.spriteSize[1];

        this.entitySprites[id].visible = true;

      } else {
        this.entitySprites[id].visible = false;
      }
    }

    // now for the player
    const pos = scene.components.position[scene.playerEnt];

    const x = pos % scene.gameMap.width;
    const y = Math.floor(pos / scene.gameMap.width);

    if (scene.playerEnt in this.entitySprites) {
      this.entitySprites[scene.playerEnt].x = x * this.options.spriteSize[0];
      this.entitySprites[scene.playerEnt].y = y * this.options.spriteSize[0];
    } else {
      this.entitySprites[scene.playerEnt] = new PIXI.Sprite(
        this.spriteSheet["textures"][scene.components.player[scene.playerEnt]]
      );

      this.entitySprites[scene.playerEnt].x = x * this.options.spriteSize[0];
      this.entitySprites[scene.playerEnt].y = y * this.options.spriteSize[0];

      this.containers["entities"].addChild(this.entitySprites[scene.playerEnt]);
    }

    return true;
  }

  /** a game tick
   *
   * this functions will be called 60 * sec or as much as possible
   */
  gameTick(): boolean {
    // grab the current scene
    const curScene = this.gameData.scenes.getScene(this.currentScene);

    // if its the players turn
    if (this.gameState === LoopState.PlayerTurn) {
      let taken = false;

      let evt = this.events.shift();

      // consume all evt's for this frame, this could be changed to only allow
      // for one thing to happen as its possible i think to get more the one
      // key press a frame
      while (evt !== undefined) {
        taken = handleInput(curScene, evt);

        evt = this.events.shift();
      }

      // if the player has taken a turn then let ai take a turn
      if (taken) {
        this.gameState = LoopState.AiTurn;
      }
    }

    // if its the ai's turn
    if (this.gameState === LoopState.AiTurn) {
      // reset visibility
      for (let i = 0; i < curScene.gameMap.data.length; ++i) {
        curScene.gameMap.data[i].visible = false;
      }

      // computeFov needs to be run first
      if (!computeFov(this.options.radius, curScene, curScene.playerEnt)) {
        console.error("could not compute fov");

        return false;
      }

      // ai should be run before rendering
      if (!runAi(curScene)) {
        console.error("could not run ai");

        return false;
      }

      if (!this.renderMap(curScene)) {
        console.error("could not render the map");

        return false;
      }

      if (!this.renderEntities(curScene)) {
        console.error("could not render entities");

        return false;
      }

      // make sure to let the player take a turn next frame
      this.gameState = LoopState.PlayerTurn;
    }

    return true;
  }
}

// TODO: this really needs to be improved
function loadAssets(spriteSheet: string): Promise<PIXI.Spritesheet> {
  const loader = PIXI.Loader.shared;

  return new Promise<PIXI.Spritesheet>((resolve, reject) => {
    loader.add(spriteSheet).load((_loader, resources) => {
      const sprites: PIXI.Spritesheet = resources[spriteSheet].spritesheet;

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
function computeFov(radius: number, scene: Scene, ent: number): boolean {
  if ((ent in scene.components.position) === false) {
    console.error("entity does not have a position");

    return false;
  }

  // if lightPasses the cell
  const lightPasses = (x: number, y: number): boolean => {
    const indx = x + (scene.gameMap.width * y);

    if (indx < 0 || indx >= scene.gameMap.data.length) {
      return false;
    }

    if (scene.gameMap.data[indx].blocks === true) {
      return false;
    }

    const entities = Object.entries(scene.components.activeEntities);
    for (const [id, ent] of entities) {
      if ((id in scene.components.position) === false) {
        continue;
      }

      if (scene.components.position[id] === indx) {
        return ent.blocksLight === false;
      }
    }

    return true;
  };

  // this what to do when once a tile is in the players view and light passes
  const cellLogic = (x: number, y: number, r: number, visibility: number) => {
    const indx = x + (scene.gameMap.width * y);

    if (indx < 0 || indx >= scene.gameMap.data.length) {
      return false;
    }

    // visibility could be used to adjust tint at some point
    if (visibility > 0 && r <= radius) {
      // index will always be in map data if passes the first if, hopefully
      scene.gameMap.data[indx].visible = true;

      scene.gameMap.data[indx].visited = true;
    }
  };

  const fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

  const indx = scene.components.position[ent];

  const pX = indx % scene.gameMap.width;
  const pY = Math.floor(indx / scene.gameMap.width);

  fov.compute(pX, pY, radius, cellLogic);

  return true;
}

/** start the game */
export async function startGame(
  app: PIXI.Application,
  gameOpts: GameOpts,
  gameData: GameData
): Promise<void> {
  // get a new game
  const game = new Game(gameOpts, gameData);

  // wait for the game to load the assets
  const containers = await game.initGame();

  // test if the game was created correctly
  if (!containers) {
    return;
  }

  // add the game containers to the app
  app.stage.addChild(containers["map"]);
  app.stage.addChild(containers["entities"]);

  // add the game logic to the app loop
  app.ticker.add(() => {
    if (!game.gameTick()) {
      // hmm, idk how i feel about this
      app.ticker.stop();
    }
  });
}
