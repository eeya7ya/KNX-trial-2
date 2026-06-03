/*
 * One-time build helper: downscale the large Blender source textures in
 * /Animation into web-friendly equirectangular maps under /public/earth,
 * used by the globe.gl Earth on the homepage About section.
 *
 * Run with:  node scripts/resize-earth-textures.cjs
 * Requires jimp (installed with --no-save; not a runtime dependency).
 *
 * Outputs (2048x1024, 2:1 equirectangular):
 *   public/earth/albedo.jpg  day / colour map  (globeImageUrl)
 *   public/earth/bump.jpg    grayscale terrain relief  (bumpImageUrl)
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

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
