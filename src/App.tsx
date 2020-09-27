import React from "react";
import ReactDOM from "react-dom";

import "./App.css";

import {start_game, init_pixi} from "./index";

// pixi options
const app_opts = {
  width: 800,
  height: 600,
};

const app = init_pixi(app_opts);

function App() {

  start_game(app);

  document.body.appendChild(app.view);

  return (
    <div id="App"></div>
  );
}

ReactDOM.render(<App />, document.getElementById("root-app"));

document.getElementById("App").appendChild(app.view);
