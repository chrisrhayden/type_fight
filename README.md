# type_fight

a basic roguelike in typescript

## tldr

get [yarn](https://classic.yarnpkg.com/en/) or [npm](https://www.npmjs.com/)

get the dependency's

`yarn install`

run the [typescript](https://www.typescriptlang.org/) compiler

`yarn run tsc`

run [webpack](https://webpack.js.org/) to bundle everything together

`yarn run webpack-cli`

now run [http-server](https://github.com/http-party/http-server#readme)
to start the dev server and click the link printed out

`yarn run http-server`

[nodemon](https://nodemon.io/) can also be used to rerun the compiler, webpack
and the server when source code is saved/changed

`yarn run nodemon --exec ./utils/run_server.sh`

to run the test suite

`yarn run moca --require ts-node/register ./test/**/*.ts`

## assets

all assets are from [Kenny's 1-Bit Pack](https://kenney.nl/assets/bit-pack).

## architecture

### toc
[rendering](#rendering)
[systems](#systems)
[building](#building and serving)
[testing](#testing)
[project layout](#project layout)

the basic architecture more or less follows this
[roguelike tutorial](http://rogueliketutorials.com/),
the game systems and component system are adapted to my tastes but should be
similar in principal. the rendering and input handling is very different as we
need to adapt to [pixi.js](https://www.pixijs.com/) and web technology in
general.

a lot of other logic and patterns are taken from
[roguebasin](http://www.roguebasin.com/index.php?title=Main_Page)
articles, in particular the various algorithms like and
[shadow casting](http://www.roguebasin.com/index.php?title=Category:FOV).

### rendering

#### pixi

we are using [pixi.js](https://www.pixijs.com/) for rendering and just add the
pixi context to the html. we probably will use html and or a javascript
framework to draw the ui as that seems straight forward.

I dont know the full extent of the pixi library but the
[basic usage](https://pixijs.io/examples/#/demos-basic/container.js) looks like

1) [load](http://pixijs.download/release/docs/PIXI.Loader.html) some resources
in to a texture cache
1) make a [Sprite](http://pixijs.download/release/docs/PIXI.Sprite.html)
from the loaded textures
1) add the Sprite to a
[Container](http://pixijs.download/release/docs/PIXI.Container.html)
1) [the add the container to the app](https://pixijs.io/examples/#/demos-basic/container.js)
1) now pixi will take over rendering

from here we will adjust the created "Sprites" and pixi will render them
correctly on the next update/tick, this very much affects architecture in a
negative way as we need to maintain the individual `Sprite` data along with the
internal game state.

at the moment we are trying to keep the pixi data out side the game sate to keep
the game logic clean and easily modifiable, if it gets out of hand we may need
to bring the `Sprite` data in to the game state in some way.

#### game map

each tile's `Sprite` will have to be adjusted each time the tile changes what it
is displaying, hopefully there is an easy way to do this like with the entities.

#### entities

at the moment we are just updating each entity's `Sprite` position every loop,
this should be fine.

### systems

#### input

input is handled by the web browser at the moment via event listeners

#### fake ecs

the fake [ecs](https://en.wikipedia.org/wiki/Entity_component_system) is mostly
just a _component store_ rather then a true _ecs_ as the main use is to loop
over `components.active_entities` and run "systems" based on what each entity
wants to do. everything else like items or health will have a component entry
but will be accessed by the system using them when getting run by the
`for (entity of components.active_entities)` loop.

i think this is ok for a small game

### building and serving

#### building

the typescript compiler will build the js files in to the `./dist` directory.

webpack will pull from the `./dist` directory and create the bundle at
`./public/main.bundle.js`.

once running we then get debugging info from
[source-map-loader](https://webpack.js.org/loaders/source-map-loader/) but
it will link back to the built js files, I believe there is a way to set it up
to use the typescript files but I haven't spent the time so I dont know.

at the moment we are bundling `PIXI.js` along with everything else but at some
point this should change to using pixi's
[cdn](https://en.wikipedia.org/wiki/Content_delivery_network). maybe a way to
switch between for development and release (with the cdn).

#### server

the server entry point is `./public` making it the root for the html so at
runtime things are sourced from `./` or `./assets` rather then `./public` or
`./public/assets`.

nodemon is a tool to watch the file system and run or rerun a command when a
file changes. we then use a script so that nodemon will stop and wait if a build
step fails, then rerun the whole process once the source files change.

### testing

at the moment the only library for testing being used is
[mocha](https://mochajs.org/).
this is the library that runs the test and provides the `describe` and `it`
functions that make up the test structure/layout

to run

`yarn run moca --require ts-node/register ./test/**/*.ts`

see [here](https://mochajs.org/#-require-module-r-module) for more on mocha
require

and [here](https://github.com/mochajs/mocha-examples/tree/master/packages/typescript) for an example project

### project layout

the root file is the html file at `./public/index.html`, this is where the main
javascript script file and library's will be sourced from.

while we are tracking the current assets for convenience the `./public`
directory is ignored as we should only track `./public/index.html` and should
load assets dynamically at some point so not to track them in version control,
anything else in `./public` can be ignored like `./public/main.bundle.js`.

the source directory `./src` is the only place the project code is located,
other code that does not belong in the project but is useful for either
development or used to generate other files for the project are stored at
`./utils` (e.g. `./utils/run_server.sh`).

all source files and directories are hopefully named well, any more info should
be module level in the file itself or comments, god help us all.

the `test` directory is well, the test directory. `./test/index.ts` is to
basically for alias to the things that are getting tested, other stuff like test
utility's can be put there

the typescript compiler will create the built javascript files in to the
`./dist` directory to keep the `./src` and `./public` directories clean.

the `./docs` directory really is just for anything that isn't code. it contains
things like `./docs/todo.md` if there is one. other files are
`./docs/LICENSE.txt` and `./docs/Kenney_docs/Kenney.url`.
