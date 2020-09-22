# type_fight

a basic roguelike in typescript

## how to build

```
# get the dependencys
yarn install

# run the typescript compiler
yarn run tsc

# run webpack to bundle everything together
yarn run webpack

# now run the dev server and click the link printed out
yarn run http-server
```

nodemon can also be used to rerun the compiler, webpack and the server when
source code is saved/changed

```
yarn run nodemon --exec ./utils/run_server.sh
```

## assets

all assets are from [Kenny 1-Bit Pack](https://kenney.nl/assets/bit-pack)


## architecture


we are using [pixi.js](https://www.pixijs.com/) for rendering and just adding it
to the html. we probably will use html to draw the ui as that seems strait
forward

I dont know the full extent of the library but the [basic usage is](https://pixijs.io/examples/#/demos-basic/container.js)

1) [load](http://pixijs.download/release/docs/PIXI.Loader.html) some resources
1) make a [Sprite](http://pixijs.download/release/docs/PIXI.Sprite.html)
from the loaded textures
1) add the Sprite to a
[Container](http://pixijs.download/release/docs/PIXI.Container.html)
1) [the add the container to the app](https://pixijs.io/examples/#/demos-basic/container.js)
1) now pixi will take over rendering

from here we need to adjust the sprite and pixi will render them on the next
update, this very much affects architecture in a negative way as we need to keep
track and maintain the "Sprites" along with the internal game state.
