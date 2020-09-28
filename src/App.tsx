/** App.tsx
 *
 * this tsx file is the main context for loading and running the rest of the
 * app, though ./src/index.ts is the main game logic and at some pint a ui
 * context will be added here but will follow a similar pattern as index.ts
 *
 * NOTE: at some point there will be a way to load PIXI and React from their cdn
 * based off whether it is a dev build or not
 */

import React from "react";
import ReactDOM from "react-dom";

import * as PIXI from "pixi.js";

import "./App.css";

import {start_game} from "./index";

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

/* the main app options
 *
 * these are the global options that will largely be static for the rest of the
 * game
 */
interface AppProps {
  pixi_context: PIXI.Application,
}

/** the html context for the app
 *
 * this is more or less the main context that will allow the game state and the
 * react state to interact at some point
 */
function App(props: AppProps) {
  // start game and it just run
  start_game(props.pixi_context);

  return (
    <div id="App"></div>
  );
}

/** main
 *
 * this is basically a wrapper around the pixi context, react and the game
 */
function main() {
  // make the pixi options
  const pixi_opts: PixiApp = {
    width: 800,
    height: 600,
  };

  // make the pixi context, it is just easier to make this global
  const pixi_app = new PIXI.Application(pixi_opts);

  // make the props to send to the game context
  const app_props: AppProps = {
    pixi_context: pixi_app,
  };

  // TODO: find out if this is synchronous, i think so
  // add then render <App /> to the given html element
  ReactDOM.render(<App {...app_props} />, document.getElementById("root-app"));

  // add pixi to the given html element
  document.getElementById("App").appendChild(app_props.pixi_context.view);
}

// run the whole project
main();
