"use strict";
exports.__esModule = true;
var fs = require("fs");
var SPRITE_SHEET_W = 768;
var SPRITE_SHEET_H = 352;
var SRITE_SIZE_W = 16;
var SRITE_SIZE_H = 16;
var IMAGE_NAME = "colored_packed.png";
var OUTPUT_PATH = "public/assets/pngs/colored_packed.json";
var Result = /** @class */ (function () {
    function Result(value, success, message) {
        this.value = value;
        this.success = success;
        this.message = message;
    }
    Result.prototype.check_ok = function () {
        if (!this.success) {
            if (this.message) {
                console.error(this.message);
            }
            return false;
        }
        return true;
    };
    Result.prototype.get_value = function () {
        if (!this.check_ok()) {
            return false;
        }
        if (!this.value) {
            console.log(this.message);
            return true;
        }
        else {
            return this.value;
        }
    };
    return Result;
}());
var Rect = /** @class */ (function () {
    function Rect(w, h) {
        this.w = w;
        this.h = h;
    }
    return Rect;
}());
var SpriteRect = /** @class */ (function () {
    function SpriteRect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return SpriteRect;
}());
var SpriteMapFrame = /** @class */ (function () {
    function SpriteMapFrame(sprite_rect, source_rect) {
        this.frame = sprite_rect;
        this.spriteSourceSize = sprite_rect;
        this.sourceSize = source_rect;
        this.rotated = false;
        this.trimmed = true;
    }
    SpriteMapFrame.prototype.set_rotation = function (bool) {
        this.rotated = bool;
    };
    SpriteMapFrame.prototype.set_timmed = function (bool) {
        this.trimmed = bool;
    };
    SpriteMapFrame.prototype.set_frame = function (frame) {
        this.frame = frame;
    };
    return SpriteMapFrame;
}());
var SpriteMapMeta = /** @class */ (function () {
    function SpriteMapMeta() {
        this.scale = 1;
    }
    return SpriteMapMeta;
}());
var SpriteMapJson = /** @class */ (function () {
    function SpriteMapJson() {
    }
    return SpriteMapJson;
}());
var SpriteMapJsonBuilder = /** @class */ (function () {
    function SpriteMapJsonBuilder() {
        this.meta = new SpriteMapMeta();
        this.frames = {};
    }
    SpriteMapJsonBuilder.prototype.build = function () {
        if (!this.meta.image) {
            return new Result(null, false, "no image source given");
        }
        if (!this.meta.size) {
            return new Result(null, false, "no source size given");
        }
        if (!this.meta.scale) {
            return new Result(null, false, "no scale given");
        }
        if (!this.frames) {
            return new Result(null, false, "no frames given");
        }
        var sp_map = {
            meta: this.meta,
            frames: this.frames
        };
        return new Result(sp_map, true, "");
    };
    return SpriteMapJsonBuilder;
}());
function make_sprite_json(input, source_size, sprite_size) {
    var sprite_map = new SpriteMapJsonBuilder();
    sprite_map.meta.image = input;
    sprite_map.meta.size = new Rect(source_size[0], source_size[1]);
    var source_rect = new Rect(source_size[0], source_size[1]);
    var counter = 0;
    for (var x = 0; x < source_size[0]; x += sprite_size[0]) {
        for (var y = 0; y < source_size[1]; y += sprite_size[1]) {
            var sprite_rect = new SpriteRect(x, y, sprite_size[0], sprite_size[1]);
            var sp_frame = new SpriteMapFrame(sprite_rect, source_rect);
            sprite_map.frames[counter.toString()] = sp_frame;
            counter += 1;
        }
    }
    return sprite_map.build();
}
function write_out_json(output, sprite_json) {
    try {
        fs.writeFileSync(output, JSON.stringify(sprite_json));
        return new Result(null, true, "write ok");
    }
    catch (_a) {
        return new Result(null, false, "failed to write file");
    }
}
function run() {
    var sprite_json = make_sprite_json(IMAGE_NAME, [SPRITE_SHEET_W, SPRITE_SHEET_H], [SRITE_SIZE_W, SRITE_SIZE_H]);
    if (typeof sprite_json == "string") {
        console.error(sprite_json);
        return false;
    }
    var json_value = sprite_json.get_value();
    if (!json_value || typeof json_value == "boolean") {
        return false;
    }
    else {
        var write_result = write_out_json(OUTPUT_PATH, json_value);
        return write_result.check_ok();
    }
}
function main() {
    console.log("start");
    if (!run()) {
        process.exit(1);
    }
    console.log("end");
}
main();
