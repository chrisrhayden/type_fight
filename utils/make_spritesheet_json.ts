import * as fs from "fs";

const SPRITE_SHEET_W = 768;
const SPRITE_SHEET_H = 352;

const SRITE_SIZE_W = 16;
const SRITE_SIZE_H = 16;

const IMAGE_NAME = "colored_packed.png";

const OUTPUT_PATH = "public/assets/pngs/colored_packed.json";

interface ResultInterface<T> {
  value: T;
  success: boolean;
  message: string;
}

class Result<T> implements ResultInterface<T> {
  value: T | null;
  success: boolean;
  message: string;

  constructor(value: T | null, success: boolean, message: string) {
    this.value = value;
    this.success = success;
    this.message = message;
  }

  check_ok(): boolean {
    if (!this.success) {
      if (this.message) {
        console.error(this.message);
      }

      return false;
    }

    return true;
  }

  get_value(): T | boolean {
    if (!this.check_ok()) {
      return false;
    }

    if (!this.value) {
      console.log(this.message);
      return true;
    } else {
      return this.value;
    }
  }
}

class Rect {
  w: number;
  h: number;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
  }
}

class SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

class SpriteMapFrame {
  frame: SpriteRect;
  spriteSourceSize: SpriteRect;
  sourceSize: Rect;
  rotated: boolean;
  // idk what this is referring too but it was true by default in spritesheet-js
  // https://github.com/krzysztof-o/spritesheet.js/
  // blob/master/templates/json.template
  trimmed: boolean;

  constructor(sprite_rect: SpriteRect, source_rect: Rect) {
    this.frame = sprite_rect;

    this.spriteSourceSize = {x: 0, y: 0, w: 16, h: 16};

    this.sourceSize = source_rect;

    this.rotated = false;
    this.trimmed = false;

  }

  set_rotation(bool: boolean) {
    this.rotated = bool;
  }

  set_timmed(bool: boolean) {
    this.trimmed = bool;
  }

  set_frame(frame: SpriteRect) {
    this.frame = frame;
  }
}

class SpriteMapMeta {
  image?: string;
  size?: Rect;
  scale: number;

  constructor() {
    this.scale = 1;
  }
}

class SpriteMapJson {
  meta: SpriteMapMeta;
  frames: {[name: string]: SpriteMapFrame};
}


class SpriteMapJsonBuilder {
  meta: SpriteMapMeta;
  frames: {[name: string]: SpriteMapFrame};

  constructor() {
    this.meta = new SpriteMapMeta();

    this.frames = {};
  }

  build(): Result<SpriteMapJson> {
    if (!this.meta.image) {
      return new Result(null, false, "no image source given");
    }

    if (!this.meta.size === null) {
      return new Result(null, false, "no source size given");
    }

    if (this.meta.scale === null) {
      return new Result(null, false, "no scale given");
    }

    if (!this.frames) {
      return new Result(null, false, "no frames given");
    }

    const sp_map: SpriteMapJson = {
      meta: this.meta,
      frames: this.frames,
    };

    return new Result(sp_map, true, "");
  }
}

function make_sprite_json(
  input: string,
  source_size: [number, number],
  sprite_size: [number, number]
): Result<SpriteMapJson> {
  const sprite_map: SpriteMapJsonBuilder = new SpriteMapJsonBuilder();

  sprite_map.meta.image = input;
  sprite_map.meta.size = new Rect(source_size[0], source_size[1]);

  const source_rect = new Rect(source_size[0], source_size[1]);

  let counter = 0;

  // we have the axis in the outside loop to count the sprites row wise
  // the outer y loop gets the first row
  for (let y = 0; y < source_size[1]; y += sprite_size[1]) {
    // then we run though the columns getting each sprite from left to right
    // order
    for (let x = 0; x < source_size[0]; x += sprite_size[0]) {

      const sprite_rect = new SpriteRect(x, y, sprite_size[0], sprite_size[1]);

      const sp_frame = new SpriteMapFrame(sprite_rect, source_rect);

      sprite_map.frames[counter.toString()] = sp_frame;

      counter += 1;
    }
  }

  return sprite_map.build();
}

function write_out_json(
  output: string,
  sprite_json: SpriteMapJson
): Result<null> {
  try {
    fs.writeFileSync(output, JSON.stringify(sprite_json, null, 4));

    return new Result(null, true, "write ok");
  } catch {
    return new Result(null, false, "failed to write file");
  }
}

function run(): boolean {
  const sprite_json = make_sprite_json(IMAGE_NAME,
    [SPRITE_SHEET_W, SPRITE_SHEET_H],
    [SRITE_SIZE_W, SRITE_SIZE_H]);

  if (typeof sprite_json === "string") {
    console.error(sprite_json);
    return false;
  }

  const json_value = sprite_json.get_value();

  if (!json_value || typeof json_value === "boolean") {
    return false;
  } else {
    console.log("writing file");
    const write_result = write_out_json(OUTPUT_PATH, json_value);

    return write_result.check_ok();
  }
}

function main(): void {
  if (!run()) {
    process.exit(1);
  }
}

main();
