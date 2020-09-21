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
