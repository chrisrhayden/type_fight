use std::error::Error;
use std::path::PathBuf;

use image::{imageops::FilterType, DynamicImage, GenericImageView, Rgba};

use rusttype::{point, Font, Scale};

#[derive(Copy, Clone, Debug)]
struct PxRect {
    w: u32,
    h: u32,
}

impl PxRect {
    fn new(w: u32, h: u32) -> Self {
        Self { w, h }
    }
}

#[derive(Copy, Clone, Debug)]
struct PxPoint {
    x: u32,
    y: u32,
}

impl PxPoint {
    fn new(x: u32, y: u32) -> Self {
        Self { x, y }
    }
}

struct Opts {
    total: u32,
    scale: f32,
    src_img_path: PathBuf,
    out_img_path: PathBuf,
    start: PxPoint,
    sprite_size: PxRect,
    row_count: u32,
    padding: u32,
}

fn add_numbers(opts: &Opts) -> Result<(), Box<dyn Error>> {
    // Load the font
    let font_data = include_bytes!("../unscii.ttf");

    // This only succeeds if collection consists of one font
    let font = Font::try_from_bytes(font_data as &[u8])
        .expect("Error constructing Font");

    // The font size to use
    let scale = Scale::uniform(opts.scale);

    // Use a dark red colour
    let colour = (255, 255, 255);

    let src_img = image::open(&opts.src_img_path)?;

    let src_width = src_img.width();
    let src_height = src_img.height();

    let mut new_img: DynamicImage =
        DynamicImage::new_rgba8(src_width, src_height);

    new_img.clone_from(&src_img);

    let new_img =
        new_img.resize(src_width * 2, src_height * 2, FilterType::Nearest);

    let mut new_img = new_img.into_rgba();

    let sprite_w = opts.sprite_size.w * 2;
    let srite_h = opts.sprite_size.h * 2;

    let mut g_x = opts.start.x;
    let mut g_y = opts.start.y;

    let mut row_count = 0;

    for num in 0..opts.total {
        if row_count == opts.row_count {
            row_count = 0;

            g_x = opts.start.x;

            g_y += srite_h;
        }

        let num_string = format!("{}", num);

        // layout the glyphs in a line with 20 pixels padding
        let glyphs: Vec<_> = font
            .layout(&num_string, scale, point(1_f32, 1_f32))
            .collect();

        // Create a new rgba image with some padding

        // Loop through the glyphs in the text, positing each one on a line
        for glyph in glyphs {
            if let Some(bounding_box) = glyph.pixel_bounding_box() {
                // Draw the glyph into the image per-pixel by using the draw closure
                glyph.draw(|x, y, v| {
                    let color: Rgba<u8> = if v > 0.4 {
                        Rgba([
                            colour.0,
                            colour.1,
                            colour.2,
                            (v * 255_f32) as u8,
                        ])
                    } else {
                        Rgba([0, 0, 0, 255])
                    };

                    new_img.put_pixel(
                        x + g_x + bounding_box.min.x as u32,
                        y + g_y,
                        color,
                    );
                });
            }
        }

        g_x += sprite_w + opts.padding;

        row_count += 1;
    }

    new_img.save(&opts.out_img_path).unwrap();

    Ok(())
}

fn run() -> Result<(), Box<dyn Error>> {
    let src_img_path = PathBuf::from("colored_packed.png");
    let out_img_path = PathBuf::from("fuck.png");

    let scale = 14_f32;

    let total = 1056;

    let start = PxPoint::new(0, 0);

    let sprite_size = PxRect::new(16, 16);

    let row_count = 48;

    let padding = 0;

    let opts = Opts {
        src_img_path,
        out_img_path,
        total,
        start,
        scale,
        sprite_size,
        row_count,
        padding,
    };

    add_numbers(&opts)
}

fn main() {
    if let Err(err) = run() {
        eprintln!("{}", err);
    }
}
