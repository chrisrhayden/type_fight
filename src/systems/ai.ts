/** the main ai logic
 *
 * runAi will iterate over all activeEntities and run the logic based on what
 * the entity is
 */
import * as ROT from "rot-js";

import {Ai} from "../components";
import {Scene} from "../scenes";
import {moveTo} from "./movement";
import {attackEnt} from "./attack";

export function runAi(scene: Scene): boolean {
  const entities = Object.keys(scene.components.activeEntities);

  // run through all the active entities
  for (const aiId of entities) {
    // if the entity does not have an ai we do nothing
    if ((aiId in scene.components.ai) === false) {
      continue;
    }

    // the only systems in place need a position
    if ((aiId in scene.components.position) === false) {
      continue;
    }

    const aiPos = scene.components.position[aiId];

    if (scene.gameMap.data[aiPos].visible === true) {
      // a callback to check if tile is passable
      const passable = (x: number, y: number) => {
        const indx = x + (scene.gameMap.width * y);

        if (indx < 0 || indx >= scene.gameMap.data.length) {
          return false;
        }

        if (scene.gameMap.data[indx].blocks) {
          return false;
        }

        const innerEnts = Object.entries(scene.components.activeEntities)
          .filter((value) => value[0] !== aiId);

        for (const [key, ent] of innerEnts) {
          if ((key in scene.components.position) === false) {
            continue;
          }

          const entPos = scene.components.position[key];

          if (indx === entPos && ent.blocks === true) {
            return false;
          }
        }

        return true;
      };

      const playerPos = scene.components.position[scene.playerEnt];

      const pX = playerPos % scene.gameMap.width;
      const pY = Math.floor(playerPos / scene.gameMap.width);

      const eX = aiPos % scene.gameMap.width;
      const eY = Math.floor(aiPos / scene.gameMap.width);

      const astar = new ROT.Path.AStar(pX, pY, passable);

      const points = [];

      // compute star for current entity
      astar.compute(eX, eY, (x: number, y: number) => {
        points.push([x, y]);
      });

      // TODO: i think this should always have the start path and the end pasth
      // node so i think a 0 is an error
      if (points.length === 0) {
        console.error("astar did not return a path");

        return false;
      }

      // get the first new tile in path
      const newX = points[1][0];
      const newY = points[1][1];

      const nextPos = newX + (scene.gameMap.width * newY);

      if (moveTo(scene, aiId, nextPos) === false) {
        // if the nextPos does not equal the playerPos then there is nothing
        // to do foe the ai
        if (nextPos !== playerPos) {
          return true;
        }

        if (scene.components.ai[aiId] !== Ai.Enemy) {
          return true;
        }

        return attackEnt(scene, aiId, scene.playerEnt);
      }
    }
  }

  return true;
}
