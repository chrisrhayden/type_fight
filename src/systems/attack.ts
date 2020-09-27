import {Scene} from "../scenes";

export function attack_ent(
  _scene: Scene,
  from_ent: number | string,
  to_ent: number | string
): boolean {
  console.log(" attack > from: ", from_ent, "  to:", to_ent);

  return true;
}
