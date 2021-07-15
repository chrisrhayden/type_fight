/** ~~stolen~~ inspired by the python roguelikeTutorialRevised
 * https://github.com/TStand90/roguelikeTutorialRevised/
 * blob/part3/mapObjects/gameMap.py
 *
 * this is basically as close as I could make it
 * tunnel h and v
 *
 * while createRoom is check before it gets run the tunnel functions are not,
 * this is kinda nice as it is what makes levels look misshapen
 */

import {FeatureGenerator} from "../featureGenerator";
import {Rect} from "../gameMap/mapUtils";
import {GameMap, TerrainData} from "../gameMap/gameMap";
import {GameTile} from "../tiles";
import {Scene} from "../scenes";
import {Entities} from "../entities";

export class BasicMap {
  // number tiles across
  mapWidth: number;
  // number tiles high
  mapHeight: number

  maxRooms: number;

  minRoomSize: number;
  maxRoomSize: number;

  difficulty: number;

  // rely on featureGenerator for rng and to make entity's
  featureGenerator: FeatureGenerator;
  rng: FeatureGenerator["rng"];

  constructor(
    feature: FeatureGenerator,
    difficulty: number,
    mapWidth: number,
    mapHeight: number
  ) {
    this.difficulty = difficulty;
    this.featureGenerator = feature;
    this.rng = this.featureGenerator.rng;

    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.maxRooms = 100;

    this.minRoomSize = 5;
    this.maxRoomSize = 10;
  }


  makeMap(entities: Entities, scene: Scene): GameMap {
    const gameMap = new GameMap(this.mapWidth, this.mapHeight);

    for (let i = 0; i < gameMap.data.length; ++i) {
      gameMap.data[i] = new TerrainData(GameTile.WallOne, true);
    }

    const madeRooms: Rect[] = [];

    let numRooms = 0;

    for (let r = 0; r < this.maxRooms; ++r) {
      const w = this.rng.getUniformInt(this.minRoomSize, this.maxRoomSize);

      const h = this.rng.getUniformInt(this.minRoomSize, this.maxRoomSize);

      const x = this.rng.getUniformInt(0, this.mapWidth - w - 1);

      const y = this.rng.getUniformInt(0, this.mapHeight - h - 1);

      const newRoom = new Rect(x, y, w, h);

      let intersects = false;

      for (const r of madeRooms) {
        if (r.intersects(newRoom)) {
          intersects = true;

          break;
        }
      }

      if (!intersects) {
        this.createRoom(gameMap, newRoom);

        const [newX, newY] = newRoom.center();

        const centerIndx = newX + (this.mapWidth * newY);

        if (numRooms == 0) {
          this.featureGenerator.makePlayer(scene, entities, centerIndx);

        } else {
          if (this.featureGenerator.enemyByDifficulty(1)) {
            this.featureGenerator
              .makeEnemy(scene, entities, centerIndx, this.difficulty);
          }

          const [prevX, prevY] = madeRooms[madeRooms.length - 1].center();

          if (this.rng.getUniform() > 0.5) {
            this.createHTunnel(gameMap, prevX, newX, prevY);
            this.createVTunnel(gameMap, prevY, newY, newX);

          } else {
            this.createVTunnel(gameMap, prevY, newY, prevX);
            this.createHTunnel(gameMap, prevX, newX, newY);
          }
        }

        madeRooms.push(newRoom);

        numRooms += 1;
      }
    }

    return gameMap;
  }


  createRoom(gameMap: GameMap, room: Rect): void {
    for (let x = room.x1 + 1; x < room.x2; ++x) {
      for (let y = room.y1 + 1; y < room.y2; ++y) {
        const indx = (x + (this.mapWidth * y));

        gameMap.data[indx] = new TerrainData(GameTile.Nothing, false);
      }
    }
  }


  createHTunnel(gameMap: GameMap, x1: number, x2: number, y: number): void {
    const xMin = Math.min(x1, x2);
    const xMax = Math.max(x1, x2);

    for (let x = xMin; x < xMax + 1; ++x) {
      const indx = (x + (this.mapWidth * y));

      gameMap.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }

  createVTunnel(gameMap: GameMap, y1: number, y2: number, x: number): void {
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);

    for (let y = yMin; y < yMax + 1; ++y) {
      const indx = (x + (this.mapWidth * y));

      gameMap.data[indx] = new TerrainData(GameTile.Nothing, false);
    }
  }
}
