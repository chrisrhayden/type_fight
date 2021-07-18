/** App.tsx
*
* the main context for loading and running the rest of the app
*/
import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";

import * as PIXI from "pixi.js";

import "./App.css";

import { startGame, GameData, GameOpts, PixiOpts } from "./game";

/** the main Component for the app
*
* this is more or less the main context that will allow the game state and the
* react state to interact at some point
*/
function App() {
  // a child ref that will be use in the closure passed to useEffect
  const pixiRef = useRef(null);

  useEffect(() => {
    // make the pixi options
    const newPixiOpts: PixiOpts = {
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

    // make the pixi context
    const pixiContext = new PIXI.Application(newPixiOpts);

    pixiRef.current.appendChild(pixiContext.view);

    // start game and it just run
    startGame(pixiContext, gameOpts, gameData);
  }, []);

  return (
    <div id="App">
      <div ref={pixiRef}></div>
    </div>
  );
}

/** start the App */
ReactDOM.render(
  <App />,
  document.getElementById("root-app")
);
