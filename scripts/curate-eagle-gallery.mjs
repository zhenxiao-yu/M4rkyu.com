import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import exifr from "exifr";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "heic", "png", "webp"]);

const DESTINATIONS = [
  {
    slug: "macao",
    title: "Macao",
    bounds: [22.08, 22.25, 113.52, 113.62],
  },
  {
    slug: "shenzhen",
    title: "Shenzhen",
    bounds: [22.45, 22.95, 113.7, 114.75],
  },
  {
    slug: "hong-kong",
    title: "Hong Kong",
    bounds: [22.13, 22.4499, 113.82, 114.52],
  },
  {
    slug: "dali",
    title: "Dali",
    bounds: [25.3, 26.15, 99.75, 100.5],
  },
  {
    slug: "kunming",
    title: "Kunming",
    bounds: [24.45, 25.55, 102.25, 103.25],
  },
  {
    slug: "guangzhou",
    title: "Guangzhou",
    bounds: [22.45, 23.85, 112.7, 114.1],
  },
  {
    slug: "zhuhai",
    title: "Zhuhai",
    bounds: [21.75, 22.55, 113.0, 113.75],
  },
  {
    slug: "quebec",
    title: "Quebec City",
    bounds: [46.45, 47.15, -71.75, -70.65],
  },
  {
    slug: "montreal",
    title: "Montreal",
    bounds: [45.2, 45.85, -74.15, -73.25],
  },
  {
    slug: "nova-scotia",
    title: "Nova Scotia",
    bounds: [43.25, 47.25, -66.55, -59.45],
  },
  {
    slug: "ontario",
    title: "Ontario",
    bounds: [41.45, 56.95, -95.25, -74.25],
  },
  {
    slug: "changchun",
    title: "Changchun",
    bounds: [43.45, 44.35, 124.85, 126.15],
  },
  {
    slug: "shenyang",
    title: "Shenyang",
    bounds: [41.25, 42.25, 122.75, 124.35],
  },
  {
    slug: "harbin",
    title: "Harbin",
    bounds: [45.15, 46.25, 125.65, 127.45],
  },
  {
    slug: "shanghai",
    title: "Shanghai",
    bounds: [30.65, 31.9, 120.75, 122.05],
  },
  {
    slug: "shangri-la-city",
    title: "Shangri-La City",
    bounds: [27.45, 28.35, 99.25, 100.25],
  },
  {
    slug: "xining",
    title: "Xining",
    bounds: [36.15, 37.05, 101.15, 102.45],
  },
  {
    slug: "japan",
    title: "Japan",
    bounds: [24.0, 46.5, 122.5, 146.5],
  },
];

function usage() {
  console.log(
    "Usage: node scripts/curate-eagle-gallery.mjs --library <path> --out <path> [--concurrency 12]",
  );
}

function parseArgs(argv) {
  const result = { concurrency: 12, sheetLimit: 30 };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--library") result.library = argv[++i];
    else if (value === "--out") result.out = argv[++i];
    else if (value === "--sheets-dir") result.sheetsDir = argv[++i];
    else if (value === "--sheet-limit") {
      result.sheetLimit = Math.max(1, Number(argv[++i]) || 30);
    } else if (value === "--concurrency") {
      result.concurrency = Math.max(1, Number(argv[++i]) || 12);
    } else if (value === "--help") {
      usage();
      process.exit(0);
    }
  }
  if (!result.library || !result.out) {
    usage();
    process.exit(1);
  }
  return result;
}

function inferDestinations(items) {
  const located = items
    .filter(
      (item) =>
        item.destination && item.capturedAt && item.capturedAtSource === "exif",
    )
    .map((item) => ({ ...item, time: Date.parse(item.capturedAt) }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => a.time - b.time);

  for (const item of items) {
    if (
      item.destination ||
      !item.capturedAt ||
      item.capturedAtSource !== "exif"
    ) {
      continue;
    }
    const time = Date.parse(item.capturedAt);
    if (!Number.isFinite(time)) continue;
    let before = null;
    let after = null;
    for (const candidate of located) {
      if (candidate.time <= time) before = candidate;
      if (candidate.time > time) {
        after = candidate;
        break;
      }
    }
    const beforeGap = before ? time - before.time : Number.POSITIVE_INFINITY;
    const afterGap = after ? after.time - time : Number.POSITIVE_INFINITY;
    const threeHours = 3 * 60 * 60 * 1000;
    const twelveHours = 12 * 60 * 60 * 1000;
    if (
      before &&
      after &&
      before.destination === after.destination &&
      beforeGap <= twelveHours &&
      afterGap <= twelveHours
    ) {
      item.inferredDestination = before.destination;
      item.locationConfidence = "sandwiched";
    } else {
      const nearest = beforeGap <= afterGap ? before : after;
      const nearestGap = Math.min(beforeGap, afterGap);
      if (nearest && nearestGap <= threeHours) {
        item.inferredDestination = nearest.destination;
        item.locationConfidence = "nearby-time";
      }
    }
  }
}

function selectDiverse(items, limit) {
  const selected = [];
  for (const item of [...items].sort((a, b) => b.score - a.score)) {
    const time = item.capturedAt ? Date.parse(item.capturedAt) : null;
    const nearDuplicate = selected.some((chosen) => {
      if (!time || !chosen.capturedAt) return false;
      const gap = Math.abs(time - Date.parse(chosen.capturedAt));
      const sameCoordinates =
        item.latitude !== null &&
        chosen.latitude !== null &&
        Math.abs(item.latitude - chosen.latitude) < 0.0002 &&
        Math.abs(item.longitude - chosen.longitude) < 0.0002;
      return gap < 20_000 && sameCoordinates;
    });
    if (!nearDuplicate) selected.push(item);
    if (selected.length >= limit) break;
  }
  return selected;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function createContactSheet(destination, items, outputPath) {
  const { default: sharp } = await import("sharp");
  const columns = 5;
  const tileWidth = 320;
  const imageHeight = 230;
  const labelHeight = 58;
  const tileHeight = imageHeight + labelHeight;
  const selected = selectDiverse(items, 30);
  if (selected.length === 0) return;
  const rows = Math.ceil(selected.length / columns);
  const composites = [];

  for (let index = 0; index < selected.length; index += 1) {
    const item = selected[index];
    let image;
    try {
      image = await sharp(item.previewPath)
        .rotate()
        .resize(tileWidth, imageHeight, {
          fit: "contain",
          background: "#111111",
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch {
      continue;
    }
    const x = (index % columns) * tileWidth;
    const y = Math.floor(index / columns) * tileHeight;
    composites.push({ input: image, left: x, top: y });
    const date = item.capturedAt?.slice(0, 10) ?? "unknown date";
    const label = `${String(index + 1).padStart(2, "0")}  ${item.name.slice(0, 25)}\n${date}  score ${item.score}`;
    const svg = Buffer.from(
      `<svg width="${tileWidth}" height="${labelHeight}">
        <rect width="100%" height="100%" fill="#f5f1e8"/>
        <text x="12" y="22" font-family="Arial, sans-serif" font-size="13" fill="#171717">${escapeXml(label.split("\n")[0])}</text>
        <text x="12" y="43" font-family="Arial, sans-serif" font-size="12" fill="#555">${escapeXml(label.split("\n")[1])}</text>
      </svg>`,
    );
    composites.push({ input: svg, left: x, top: y + imageHeight });
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background: "#f5f1e8",
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(outputPath);
  console.log(`Wrote ${outputPath}`);
}

function inBounds(latitude, longitude, bounds) {
  const [minLat, maxLat, minLon, maxLon] = bounds;
  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLon &&
    longitude <= maxLon
  );
}

function destinationFor(latitude, longitude) {
  return DESTINATIONS.find((destination) =>
    inBounds(latitude, longitude, destination.bounds),
  );
}

function scoreItem(metadata) {
  const tags = new Set(metadata.tags ?? []);
  const megapixels =
    ((metadata.width ?? 0) * (metadata.height ?? 0)) / 1_000_000;
  let score = Math.min(megapixels, 16);
  if (tags.has("quality:high")) score += 24;
  if (tags.has("status:keep")) score += 12;
  if (tags.has("candidate:hero")) score += 18;
  if (tags.has("candidate:best")) score += 14;
  if (tags.has("candidate:archive")) score += 8;
  if (tags.has("aspect:landscape")) score += 3;
  if (tags.has("quality:low")) score -= 30;
  if (tags.has("media:screenshot") || tags.has("status:spam")) score -= 100;
  return Math.round(score * 100) / 100;
}

function captureDate(metadata, exif) {
  const value = exif?.DateTimeOriginal ?? exif?.CreateDate;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { value: value.toISOString(), source: "exif" };
  }
  if (typeof metadata.btime === "number") {
    return { value: new Date(metadata.btime).toISOString(), source: "eagle" };
  }
  return { value: null, source: null };
}

async function findAsset(directory, metadata) {
  const expected = path.join(directory, `${metadata.name}.${metadata.ext}`);
  try {
    await fs.access(expected);
    return expected;
  } catch {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const match = files.find(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(`.${metadata.ext.toLowerCase()}`),
    );
    return match ? path.join(directory, match.name) : null;
  }
}

async function inspectItem(directory) {
  const metadataPath = path.join(directory, "metadata.json");
  let metadata;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
  } catch {
    return null;
  }
  if (
    metadata.isDeleted ||
    !IMAGE_EXTENSIONS.has(String(metadata.ext).toLowerCase())
  ) {
    return null;
  }

  const assetPath = await findAsset(directory, metadata);
  if (!assetPath) return null;
  const eaglePreviewPath = path.join(
    directory,
    `${metadata.name}_thumbnail.png`,
  );
  const hasEaglePreview = await fs
    .access(eaglePreviewPath)
    .then(() => true)
    .catch(() => false);

  let gps = null;
  let exif = null;
  try {
    [gps, exif] = await Promise.all([
      exifr.gps(assetPath),
      exifr.parse(assetPath, [
        "DateTimeOriginal",
        "CreateDate",
        "Make",
        "Model",
      ]),
    ]);
  } catch {
    // Edited exports and screenshots often have no readable EXIF.
  }

  const latitude = gps?.latitude;
  const longitude = gps?.longitude;
  const destination =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? destinationFor(latitude, longitude)
      : null;
  const captured = captureDate(metadata, exif);

  return {
    eagleId: metadata.id,
    name: metadata.name,
    extension: metadata.ext,
    assetPath,
    previewPath: hasEaglePreview ? eaglePreviewPath : assetPath,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    capturedAt: captured.value,
    capturedAtSource: captured.source,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    camera: [exif?.Make, exif?.Model].filter(Boolean).join(" ") || null,
    destination: destination?.slug ?? null,
    destinationTitle: destination?.title ?? null,
    score: scoreItem(metadata),
    tags: metadata.tags ?? [],
    folders: metadata.folders ?? [],
    annotation: metadata.annotation ?? "",
    palettes: metadata.palettes ?? [],
  };
}

async function mapConcurrent(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index], index);
      if ((index + 1) % 500 === 0) {
        console.log(`Inspected ${index + 1}/${values.length}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const imageRoot = path.join(path.resolve(args.library), "images");
  const entries = await fs.readdir(imageRoot, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory() && entry.name.endsWith(".info"))
    .map((entry) => path.join(imageRoot, entry.name));

  const inspected = (
    await mapConcurrent(directories, args.concurrency, inspectItem)
  ).filter(Boolean);
  inferDestinations(inspected);

  const byDestination = Object.fromEntries(
    DESTINATIONS.map((destination) => [
      destination.slug,
      inspected
        .filter(
          (item) =>
            (item.destination ?? item.inferredDestination) === destination.slug,
        )
        .sort((a, b) => b.score - a.score),
    ]),
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    library: path.resolve(args.library),
    activeImageCount: inspected.length,
    geotaggedCount: inspected.filter((item) => item.latitude !== null).length,
    matchedCount: inspected.filter((item) => item.destination !== null).length,
    inferredCount: inspected.filter((item) => item.inferredDestination).length,
    destinations: DESTINATIONS.map(({ slug, title }) => ({
      slug,
      title,
      count: byDestination[slug].length,
    })),
    byDestination,
    unmatchedCandidates: inspected
      .filter(
        (item) =>
          !item.destination && !item.inferredDestination && item.score >= 20,
      )
      .sort((a, b) => b.score - a.score),
  };

  const outPath = path.resolve(args.out);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
  console.table(payload.destinations);

  if (args.sheetsDir) {
    const sheetsDir = path.resolve(args.sheetsDir);
    for (const destination of DESTINATIONS) {
      await createContactSheet(
        destination,
        byDestination[destination.slug].slice(0, args.sheetLimit),
        path.join(sheetsDir, `${destination.slug}.jpg`),
      );
    }
  }
}

await main();
