#!/usr/bin/env node
// Optimize a folder of curated, web-format images (e.g. Eagle exports) into the
// exact shapes m4rkyu.com needs. No new deps — uses the sharp + exifr already
// in node_modules.
//
// WHY a folder of exports (not the raw .library): ~8.6k of the library is HEIC
// (HEVC-compressed), which the bundled sharp/libheif CANNOT decode (no HEVC
// decoder) and browsers on Windows can't either. Eagle's own Export converts
// HEIC via the OS decoder — so the happy path is: sort in Eagle -> Export each
// collection (and a `portraits/` set) as WebP/JPEG -> run this.
//
// Usage:
//   node scripts/optimize-images.mjs --src <exportDir> --out <stagingDir>
//        [--max 2400] [--quality 82]
//
// <src> layout — one subfolder per target:
//   <src>/chengdu/*           gallery collection "chengdu"
//   <src>/artworks/*          gallery collection "artworks"
//   <src>/portraits/*         the /about portrait-orbit (special-cased)
//
// Output:
//   <out>/<collection>/*.webp         optimized frames (feed the admin
//                                     batch-uploader at /admin -> Gallery)
//   <out>/<collection>/manifest.json  [{file,title,width,height,aspect,
//                                       blurDataURL,capturedAt}]
//   For `portraits/`: ALSO copies the optimized webp into public/portraits/
//   and prints a ready-to-paste profile.ts `portraits: [...]` array.

import sharp from "sharp";
import exifr from "exifr";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const READABLE = /\.(jpe?g|png|webp|tiff?|avif|gif)$/i;
// Aspect tokens the gallery schema accepts (galleryAspectSchema).
const ASPECTS = [
  ["1/1", 1], ["4/5", 0.8], ["3/4", 0.75], ["2/3", 0.6667], ["16/9", 1.7778], ["21/9", 2.3333],
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function nearestAspect(w, h) {
  const r = w / h;
  let best = ASPECTS[0][0];
  let bestD = Infinity;
  for (const [token, ratio] of ASPECTS) {
    const d = Math.abs(ratio - r);
    if (d < bestD) { bestD = d; best = token; }
  }
  return best;
}

function titleFromFile(file) {
  return path
    .basename(file, path.extname(file))
    .replace(/[_-]+/g, " ")
    .replace(/\b\d{4}[ ._]\d{2}[ ._]\d{2}[ ._]?/g, "")
    .replace(/\bIMG\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || "Untitled";
}

async function capturedAt(srcPath) {
  try {
    const x = await exifr.parse(srcPath, ["DateTimeOriginal", "CreateDate"]);
    const d = x?.DateTimeOriginal || x?.CreateDate;
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    /* no EXIF — fine */
  }
  return undefined;
}

async function optimizeOne(srcPath, max, quality) {
  const pipeline = sharp(srcPath).rotate(); // bake in EXIF orientation
  const buf = await pipeline
    .clone()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  // LQIP: a tiny JPEG data-URL, matching the admin uploader's blur convention.
  const lqip = await sharp(srcPath)
    .rotate()
    .resize({ width: 24, height: 24, fit: "inside" })
    .jpeg({ quality: 40 })
    .toBuffer();
  return {
    buf,
    width: meta.width,
    height: meta.height,
    aspect: nearestAspect(meta.width, meta.height),
    blurDataURL: `data:image/jpeg;base64,${lqip.toString("base64")}`,
    capturedAt: await capturedAt(srcPath),
  };
}

async function main() {
  const src = arg("src");
  const out = arg("out", path.join(REPO_ROOT, ".image-staging"));
  const max = Number(arg("max", "2400"));
  const quality = Number(arg("quality", "82"));
  if (!src) {
    console.error("Missing --src <exportDir>. See header for the expected layout.");
    process.exit(1);
  }

  const groups = (await fs.readdir(src, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  if (groups.length === 0) {
    console.error(`No collection subfolders in ${src}. Expected e.g. ${src}/artworks/, ${src}/portraits/.`);
    process.exit(1);
  }

  const portraitEntries = [];
  let grand = 0;

  for (const group of groups) {
    const groupSrc = path.join(src, group);
    const files = (await fs.readdir(groupSrc)).filter((f) => READABLE.test(f)).sort();
    if (files.length === 0) continue;
    const isPortraits = group.toLowerCase() === "portraits";
    const groupOut = path.join(out, group);
    await fs.mkdir(groupOut, { recursive: true });
    const manifest = [];

    for (const file of files) {
      const srcPath = path.join(groupSrc, file);
      let r;
      try {
        r = await optimizeOne(srcPath, max, quality);
      } catch (e) {
        console.warn(`  ! skipped ${file}: ${e.message.split("\n")[0]}`);
        continue;
      }
      const base = file.replace(path.extname(file), "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const outName = `${base}.webp`;
      await fs.writeFile(path.join(groupOut, outName), r.buf);
      manifest.push({
        file: outName,
        title: titleFromFile(file),
        width: r.width,
        height: r.height,
        aspect: r.aspect,
        blurDataURL: r.blurDataURL,
        capturedAt: r.capturedAt,
      });
      grand += 1;

      if (isPortraits) {
        const destDir = path.join(REPO_ROOT, "public", "portraits");
        await fs.mkdir(destDir, { recursive: true });
        await fs.writeFile(path.join(destDir, outName), r.buf);
        portraitEntries.push({ src: `/portraits/${outName}`, alt: titleFromFile(file), focal: "center" });
      }
    }

    await fs.writeFile(
      path.join(groupOut, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
    console.log(`✓ ${group}: ${manifest.length} optimized → ${path.relative(REPO_ROOT, groupOut)}`);
  }

  console.log(`\nDone. ${grand} image(s) optimized into ${path.relative(REPO_ROOT, out)}.`);
  if (portraitEntries.length) {
    console.log(`\nPortraits copied to public/portraits/. Paste into src/content/profile.ts:\n`);
    console.log("portraits: " + JSON.stringify(portraitEntries, null, 2) + ",");
  }
  console.log(
    `\nGallery collections: open /admin → Gallery → the collection → batch-upload the\n` +
      `files from each <staging>/<collection>/ folder (the admin flow handles Supabase\n` +
      `storage + blur + EXIF date + DB rows). manifest.json is there for reference.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
