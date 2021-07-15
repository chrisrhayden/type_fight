/** App.tsx
 *
 * this tsx file is the main context for loading and running the rest of the
 * app, though ./src/index.ts is the main game logic and at some pint a ui
 * context will be added here but will follow a similar pattern as index.ts
 *
 * NOTE: at some point there will be a way to load PIXI and React from their cdn
 * based off whether it is a dev build or not
 */

import React, {useRef, useEffect} from "react";
import ReactDOM from "react-dom";

import * as PIXI from "pixi.js";

import "./App.css";

import {startGame, GameData, GameOpts} from "./game";

/** this is mostly to not have to look up the data again */
type PixiApp = {
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

/** the html context for the app
 *
 * this is more or less the main context that will allow the game state and the
 * react state to interact at some point
 */
function App() {
  const pixiRef = useRef(null);

  useEffect(() => {
    // make the pixi options
    const pixiOpts: PixiApp = {
      width: 800,
      height: 600,
    };

    const gameOpts: GameOpts = {
      spriteSheetDataPath: "assets/pngs/coloredPacked.json",
      spriteSize: [16, 16],
      rngSeed: 3333,
      // 4 will allow the player at least two tiles before seeing a monster
      radius: 4,
    };

    const gameData = new GameData(gameOpts.rngSeed);

    // make the pixi context, it is just easier to make this global
    const pixiContext = new PIXI.Application(pixiOpts);

    // start game and it just run
    startGame(pixiContext, gameOpts, gameData);
  }, []);

  return (
    <div id="App" ref={pixiRef}></div>
  );
}

/** main
 *
 * this is basically a wrapper around the pixi context, react and the game
 */
function main() {


  // TODO: find out if this is synchronous, i think so
  // add then render <App /> to the given html element
  ReactDOM.render(
    <App />,
    document.getElementById("root-app")
  );
}

// run the whole project
main();
