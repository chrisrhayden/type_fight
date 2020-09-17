import * as PIXI from "pixi.js";

interface AppOpts {
  width?: number,         // default: 800
  height?: number,        // default: 600
  antialias?: boolean,    // default: false
  transparent?: boolean, // default: false
  resolution?: number,       // default: 1
}

interface TFSprite {
  cat: PIXI.Container,
}


function initPixi(options: AppOpts): PIXI.Application {
  const app = new PIXI.Application(options);

  document.body.appendChild(app.view);

  return app;
}



function run(): boolean {
  let sprites = new PIXI.Container();


  const appOpts = {width: 256, height: 256};

  const app = initPixi(appOpts);

  app.stage.addChild(sprites);


  let texture = PIXI.Texture.from("assets/cat.png");

  let cat = new PIXI.Sprite(texture);

  sprites.addChild(cat);

  sprites.x = 96;
  sprites.y = 96;

  return true;
}

export default function main(): void {
  run();
}

main();
