/*
 * One-time build helper: downscale the large Blender source textures in
 * /Animation into web-friendly equirectangular maps under /public/earth.
 *
 * Run with:  node scripts/resize-earth-textures.cjs
 * Requires jimp (installed with --no-save; not a runtime dependency).
 *
 * Outputs (all 2048x1024, 2:1 equirectangular):
 *   public/earth/albedo.jpg  day/colour map
 *   public/earth/bump.jpg    grayscale terrain relief (bumpMap)
 *   public/earth/clouds.jpg  grayscale cloud cover (used as alphaMap)
 *   public/earth/ocean.jpg   grayscale roughness map (oceans dark = glossy)
 */
const Jimp = require("jimp");
const jpeg = require("jpeg-js");
const path = require("path");

// The source bump map is 21600x10800 (~233 MP), which blows past jpeg-js's
// default resolution/memory guards. Raise them just for this one-off script.
Jimp.decoders["image/jpeg"] = (data) =>
  jpeg.decode(data, { maxResolutionInMP: 400, maxMemoryUsageInMB: 6144 });

const SRC = path.join(__dirname, "..", "Animation");
const OUT = path.join(__dirname, "..", "public", "earth");
const W = 2048;
const H = 1024;

async function save(img, name, quality) {
  const out = path.join(OUT, name);
  img.quality(quality);
  await img.writeAsync(out);
  const { size } = require("fs").statSync(out);
  console.log(`  -> ${name}  (${(size / 1024).toFixed(0)} KB)`);
}

async function main() {
  // 1. Albedo (day colour map) — 8192x4096 source
  console.log("albedo…");
  const albedo = await Jimp.read(path.join(SRC, "earth albedo.jpg"));
  albedo.resize(W, H);
  await save(albedo, "albedo.jpg", 84);

  // 2. Bump / terrain relief — 21600x10800 source (grayscale)
  console.log("bump…");
  const bump = await Jimp.read(path.join(SRC, "earth bump.jpg"));
  bump.greyscale().resize(W, H);
  await save(bump, "bump.jpg", 80);

  // 3. Clouds — 4096x2048 RGB (white clouds on black). Use luminance so it
  //    can drive an alphaMap on the cloud shell.
  console.log("clouds…");
  const clouds = await Jimp.read(path.join(SRC, "clouds earth.png"));
  clouds.greyscale().resize(W, H);
  await save(clouds, "clouds.jpg", 80);

  // 4. Ocean / land mask — 10800x5400 grayscale. We want OCEANS to be dark
  //    (low roughness => glossy) and LAND bright (matte). Detect polarity by
  //    sampling a known land point (Sahara) vs a known ocean point (Pacific)
  //    on the equirectangular map, then invert if needed.
  console.log("ocean mask…");
  const ocean = await Jimp.read(path.join(SRC, "earth land ocean mask.png"));
  ocean.greyscale().resize(W, H);
  const sample = (lat, lon) => {
    const x = Math.round(((lon + 180) / 360) * (W - 1));
    const y = Math.round(((90 - lat) / 180) * (H - 1));
    return Jimp.intToRGBA(ocean.getPixelColor(x, y)).r;
  };
  const sahara = sample(23, 13); // land
  const pacific = sample(0, -150); // open ocean
  console.log(`     sample land(Sahara)=${sahara}  ocean(Pacific)=${pacific}`);
  if (pacific > sahara) {
    console.log("     ocean is bright -> inverting so oceans are glossy");
    ocean.invert();
  }
  await save(ocean, "ocean.jpg", 85);

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
