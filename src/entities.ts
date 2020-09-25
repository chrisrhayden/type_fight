/** a basic entity manager
 *
 * there really isn't anything to this as its just a way to be sure that
 * entities are unique
 *
 * a zero id will never be used so it can be used as a sort of null value if
 * ever needed
 */
export class Entities {
  id: number;

  constructor() {
    this.id = 0;
  }

  new_id(): number {
    this.id += 1;

    return this.id;
  }
}
