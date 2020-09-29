/** this will make test data like levels */

// import {GameMap} from "../src/game_map/game_map";
import * as fs from "fs";
import {BasicMap} from "../src/level_gen/basic_map";
import {FeatureGenerator} from "../src/feature_generator";
import {Entities} from "../src/entities";
import {Scene} from "../src/scenes";

function main(): void {
  const seed = 3333;
  const feature = new FeatureGenerator(seed);
  const width = 50;
  const height = 36;

  const entitys = new Entities();

  const scene = new Scene();

  const basic_map = new BasicMap(feature, 1, width, height);

  const made_map = basic_map.make_map(entitys, scene);


  fs.writeFileSync("./test_data_basic_map.json",
    JSON.stringify(made_map));

  return;
}

main();
