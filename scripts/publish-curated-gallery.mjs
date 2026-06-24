import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--plan") result.plan = argv[++index];
    else if (argv[index] === "--manifest") result.manifest = argv[++index];
  }
  if (!result.plan || !result.manifest) {
    throw new Error(
      "Usage: publish-curated-gallery.mjs --plan <json> --manifest <json>",
    );
  }
  return result;
}

function mimeFor(filePath) {
  return path.extname(filePath).toLowerCase() === ".webp"
    ? "image/webp"
    : "application/octet-stream";
}

const args = parseArgs(process.argv.slice(2));
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase service credentials are missing.");

const plan = JSON.parse(await fs.readFile(args.plan, "utf8"));
const manifest = JSON.parse(await fs.readFile(args.manifest, "utf8"));
const exportedByEagleId = new Map(manifest.map((item) => [item.eagleId, item]));
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let sortOrder = 10;
for (const collection of plan.collections) {
  const { data: collectionRow, error: collectionError } = await supabase
    .from("gallery_collections")
    .upsert(
      {
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        status: collection.status,
        sort_order: sortOrder++,
        featured: collection.featured,
        mood: collection.mood,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (collectionError) throw collectionError;

  let coverPath = null;
  for (let index = 0; index < collection.items.length; index += 1) {
    const item = collection.items[index];
    const exported = exportedByEagleId.get(item.eagleId);
    if (!exported) throw new Error(`Missing export for ${item.eagleId}`);
    const storagePath = `${collection.slug}/${item.slug}.webp`;
    const bytes = await fs.readFile(exported.outputPath);
    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(storagePath, bytes, {
        contentType: mimeFor(exported.outputPath),
        cacheControl: "31536000",
        upsert: true,
      });
    if (uploadError) throw uploadError;
    coverPath ??= storagePath;

    const { error: itemError } = await supabase.from("gallery_items").upsert(
      {
        collection_id: collectionRow.id,
        slug: item.slug,
        title: item.title,
        caption: item.caption,
        type: "image",
        status: collection.status === "ready" ? "ready" : "draft",
        storage_path: storagePath,
        alt: item.alt,
        width: exported.width,
        height: exported.height,
        blur_data_url: exported.blurDataUrl,
        aspect: exported.aspect,
        captured_at: exported.capturedAt,
        location: collection.title,
        mood: collection.mood,
        tags: [
          "travel",
          collection.slug,
          "photography",
          `source:eagle:${item.eagleId}`,
        ],
        featured: Boolean(item.featured),
        pinned: index === 0,
        sort_order: (collection.sortOrderStart ?? 0) + index,
      },
      { onConflict: "collection_id,slug" },
    );
    if (itemError) throw itemError;
  }

  if (coverPath && !collection.preserveCover) {
    const { error: coverError } = await supabase
      .from("gallery_collections")
      .update({
        cover_path: coverPath,
        cover_alt: collection.items[0]?.alt ?? "",
      })
      .eq("id", collectionRow.id);
    if (coverError) throw coverError;
  }
  console.log(`${collection.slug}: ${collection.items.length} item(s)`);
}
