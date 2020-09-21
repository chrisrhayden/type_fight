export class Entities {
  id: number;

  constructor() {
    this.id = 1;
  }

  new_id(): number {
    const old_id = this.id;

    this.id += 1;

    return old_id;
  }
}
