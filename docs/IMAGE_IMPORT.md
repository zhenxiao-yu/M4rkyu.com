# Image Import — Eagle → m4rkyu.com

How real photos get from the Eagle library (`H:\My Gallery.library`) onto the
site. Two destinations, two paths:

- **Gallery photos** (`/archive`) → Supabase (Storage bucket `gallery-images` +
  `gallery_items` rows). Ingested through the **admin batch-uploader**.
- **Portraits** (`/about` portrait-orbit) → static `public/portraits/` +
  `src/content/profile.ts`. Wired by the optimizer directly.

## Why you must export from Eagle (not point a script at the `.library`)

~8,600 of the 19k library items are **HEIC** (HEVC-compressed). The bundled
`sharp`/`libheif` has **no HEVC decoder**, and browsers on Windows can't decode
HEIC either — so neither a Node script nor the admin uploader can read the raw
`.library` HEIC. **Eagle's own Export** converts HEIC via the OS decoder, so it's
the reliable, dependency-free bridge.

## Workflow

### 1. Curate in Eagle

Drag your picks into **M4RKYU Archive ▸ Collections** — one Eagle folder per
gallery collection: `Chengdu`, `Chongqing`, `Beijing`, `Tibet`,
`Black & White`, `Artworks` — and into **People & Portraits** for the `/about`
shots. (`Artworks` is pinned first on `/archive`; the four city folders get a
Google-Maps pin link — see `src/content/gallery-curation.ts`.)

### 2. Export from Eagle as WebP/JPEG

Select a collection → right-click → **Export** → format **WebP** (or JPEG),
max edge ~2400px. Export each collection into its own subfolder, e.g.:

```
H:\m4rkyu-export\
  artworks\      *.webp
  chengdu\       *.webp
  beijing\       *.webp
  portraits\     *.webp   ← the /about portrait set
```

The subfolder name **is** the collection slug (lowercase). `portraits/` is
special-cased.

### 3. Optimize + wire

```bash
node scripts/optimize-images.mjs --src H:/m4rkyu-export --out .image-staging
# options: --max 2400  --quality 82
```

For each image this re-encodes to capped WebP (EXIF orientation baked in),
generates a base64 LQIP `blurDataURL`, detects the nearest gallery `aspect`,
and reads `capturedAt` from EXIF. It writes `.image-staging/<collection>/*.webp`
+ a `manifest.json` per collection. (`.image-staging/` is build output — keep it
out of git.)

For `portraits/` it ALSO copies the optimized files into `public/portraits/`
and prints a ready-to-paste `portraits: [...]` array for `src/content/profile.ts`
(set each `focal` to `top`/`center`/`bottom` to taste).

### 4. Load the galleries

For each gallery collection, open **/admin → Gallery → \<collection\>** and
**batch-upload** the files from `.image-staging/<collection>/`. The admin flow
(`src/lib/gallery/admin/items.ts` → `storage.ts`) uploads to the
`gallery-images` bucket, regenerates the blur + EXIF date, and inserts the
`gallery_items` rows. Set the collection `status` to **ready** so it appears on
`/archive`. (`manifest.json` is there for reference/captioning.)

> The admin uploader is the supported ingestion path — it enforces the Zod
> schema, RLS, and storage layout. The optimizer deliberately does **not** write
> to Supabase; it only prepares clean, correctly-shaped files.

## Toolchain

- `sharp` (transcode + resize + LQIP) and `exifr` (capture date) — both already
  in `node_modules`; **no new dependencies**.
- HEIC is handled upstream by Eagle's export, never by this script.
