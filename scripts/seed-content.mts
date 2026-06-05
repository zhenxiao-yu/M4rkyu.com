/**
 * Idempotent content seed — bridges the gap between the static
 * src/content/*.ts arrays and the Supabase tables that power the admin
 * CMS. Reads every static array, maps camelCase → snake_case columns,
 * and UPSERTs by slug (or composite key for gallery items, or singleton
 * id for the profile). After the first run, the DB is the source of
 * truth and the admin shows everything that's live on the site; the
 * static files stay only as an emergency fallback.
 *
 * Run modes — default is DRY-RUN; --apply writes:
 *
 *   npm run seed:content              # dry-run, prints per-table counts
 *   npm run seed:content -- --apply   # actually upserts into Supabase
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (loaded via Node's --env-file flag in the npm script).
 * The service-role key bypasses RLS and is server-only — never commit
 * it. The key is read from the process env, never logged.
 *
 * Node ≥ 23.6 type-strips .ts files natively, so this runs without tsx.
 */
import { existsSync, readFileSync } from "node:fs";

// Load .env.local manually — tsx swallows Node's --env-file flag, so we
// can't rely on it. Do this before anything else touches process.env.
if (existsSync(".env.local")) {
  // Overwrite unset OR empty values — turbo/Vercel CLI sometimes
  // pre-populates known keys with "" which would shadow .env.local.
  // Trim inner whitespace too (a stray space at the end of a pasted
  // secret silently breaks auth otherwise).
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "").trim();
    }
  }
}

import { createClient } from "@supabase/supabase-js";
import { allProjects } from "../src/content/projects.ts";
import { games as staticGames } from "../src/content/games.ts";
import { mediaItems as staticMedia } from "../src/content/media.ts";
import { notes as staticNotes } from "../src/content/notes.ts";
import { resources as staticResources } from "../src/content/resources.ts";
import { products as staticProducts } from "../src/content/shop.ts";
import {
  galleryCollections,
  galleryItems,
} from "../src/content/gallery.ts";
import { profile as staticProfile } from "../src/content/profile.ts";

const APPLY = process.argv.includes("--apply");
// Optional single-table scope so re-seeding one source (e.g. projects)
// can't clobber admin edits in the others. Matches the `name` passed to
// seed() below. Usage: `--only=projects`.
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  return arg ? arg.slice("--only=".length) : null;
})();
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accept either the legacy service_role JWT or the new sb_secret_*
// secret key — both bypass RLS for the corresponding key system.
const KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY / " +
      "SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const sb = createClient(URL_, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── per-type mappers ───────────────────────────────────────────────

function mapProject(p: (typeof allProjects)[number], i: number) {
  return {
    slug: p.slug,
    title: p.title,
    short_pitch: p.shortPitch,
    category: p.category,
    year: p.year,
    status: p.status,
    content_status: p.contentStatus,
    featured: p.featured,
    problem: p.problem,
    solution: p.solution,
    role: p.role,
    outcome: p.outcome,
    stack: p.stack,
    tags: p.tags,
    features: p.features,
    architecture_notes: p.architectureNotes,
    challenges: p.challenges,
    lessons_learned: p.lessonsLearned,
    next_steps: p.nextSteps,
    live_url: p.liveUrl ?? null,
    github_url: p.githubUrl ?? null,
    // Cover from the static screenshots[0] — a public /project-covers/*
    // path. Without this the seeded rows render the "media TBD"
    // placeholder, which is why the DB-backed home looked cover-less.
    cover_image_src: p.screenshots[0]?.src ?? null,
    cover_image_alt: p.screenshots[0]?.alt ?? "",
    seo_title: p.seo.title,
    seo_description: p.seo.description,
    sort_order: i,
  };
}

function mapGame(g: (typeof staticGames)[number], i: number) {
  return {
    slug: g.slug,
    title: g.title,
    engine: g.engine,
    year: g.year,
    status: g.status,
    pitch: g.pitch,
    role: g.role,
    notes: g.notes,
    platforms: g.platforms,
    pillars: g.pillars,
    postmortem: g.postmortem ?? "",
    outcome: g.outcome ?? "",
    cover_src: g.cover?.src ?? "",
    cover_alt: g.cover?.alt ?? "",
    trailer_url: g.trailerUrl ?? null,
    build_links: g.buildLinks,
    sort_order: i,
  };
}

function mapMedia(m: (typeof staticMedia)[number], i: number) {
  return {
    slug: m.slug,
    title: m.title,
    format: m.format,
    status: m.status,
    description: m.description,
    duration: m.duration ?? "",
    poster_alt: m.poster?.alt ?? "",
    sort_order: i,
  };
}

function mapNote(n: (typeof staticNotes)[number], i: number) {
  return {
    slug: n.slug,
    kind: n.kind,
    title: n.title ?? "",
    body: n.body,
    status: n.status,
    tags: n.tags,
    published_at: n.publishedAt,
    link_url: n.link?.url ?? null,
    link_label: n.link?.label ?? null,
    rating: n.rating ?? null,
    tiers: n.tiers ?? null,
    sort_order: i,
  };
}

function mapResource(r: (typeof staticResources)[number], i: number) {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category,
    description: r.description,
    why: r.why,
    type: r.type,
    link: r.link,
    pricing: r.pricing,
    tags: r.tags,
    status: r.status,
    featured: r.featured,
    icon_key: r.iconKey ?? null,
    sort_order: i,
  };
}

function mapProduct(p: (typeof staticProducts)[number], i: number) {
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    category: p.category,
    kind: p.kind,
    price_in_cents: p.priceInCents,
    currency: p.currency,
    image_alt: p.image?.alt ?? "",
    status: p.status,
    featured: p.featured,
    in_stock: p.inStock,
    tags: p.tags,
    digital_note: p.digitalNote ?? null,
    sort_order: i,
  };
}

function mapCollection(c: (typeof galleryCollections)[number], i: number) {
  return {
    slug: c.slug,
    title: c.title,
    description: c.description,
    status: c.status,
    sort_order: i,
    featured: c.featured,
    cover_alt: c.cover.alt,
    mood: c.mood,
  };
}

function mapGalleryItem(
  it: (typeof galleryItems)[number],
  i: number,
  idBySlug: Map<string, string>,
) {
  const collection_id = idBySlug.get(it.collection);
  if (!collection_id) return null;
  return {
    collection_id,
    slug: it.slug,
    title: it.title,
    caption: it.caption,
    type: it.type,
    status: it.status,
    alt: it.src?.alt ?? "",
    aspect: it.aspect,
    captured_at: it.capturedAt ?? null,
    location: it.location ?? null,
    featured: it.featured,
    pinned: it.pinned,
    sort_order: i,
    mood: it.mood,
    tags: it.tags,
  };
}

// ── runner ─────────────────────────────────────────────────────────

async function seed(
  name: string,
  table: string,
  rows: unknown[],
  conflict: string,
) {
  if (ONLY && name !== ONLY) return;
  console.log(
    `[${name}] ${APPLY ? "Upserting" : "Would upsert"} ${rows.length} row(s) → ${table} (onConflict=${conflict})`,
  );
  if (!APPLY || rows.length === 0) return;
  const { error } = await sb
    .from(table)
    .upsert(rows as Record<string, unknown>[], { onConflict: conflict });
  if (error) {
    console.error(`[${name}] FAILED: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`[${name}] OK`);
  }
}

console.log(
  APPLY
    ? "Apply mode — writing to Supabase."
    : "Dry-run mode — printing counts only. Pass --apply to write.",
);

await seed("projects", "projects", allProjects.map(mapProject), "slug");
await seed("games", "games", staticGames.map(mapGame), "slug");
await seed("media", "media_items", staticMedia.map(mapMedia), "slug");
await seed("notes", "notes", staticNotes.map(mapNote), "slug");
await seed(
  "resources",
  "resources",
  staticResources.map(mapResource),
  "slug",
);
await seed("shop", "products", staticProducts.map(mapProduct), "slug");

// Gallery: collections first so items can resolve collection_id by slug
// on the same run. In dry-run we can't look up real ids, so we just
// report the would-upsert count.
await seed(
  "gallery_collections",
  "gallery_collections",
  galleryCollections.map(mapCollection),
  "slug",
);
if (APPLY && (!ONLY || ONLY === "gallery_items")) {
  const { data, error } = await sb
    .from("gallery_collections")
    .select("id, slug");
  if (error) {
    console.error(
      `[gallery_items] Could not look up collection ids: ${error.message}`,
    );
    process.exitCode = 1;
  } else {
    const idBySlug = new Map(
      (data ?? []).map((r) => [r.slug as string, r.id as string]),
    );
    const itemRows = galleryItems
      .map((it, i) => mapGalleryItem(it, i, idBySlug))
      .filter((x): x is NonNullable<typeof x> => x !== null);
    await seed(
      "gallery_items",
      "gallery_items",
      itemRows,
      "collection_id,slug",
    );
  }
} else if (!ONLY || ONLY === "gallery_items") {
  console.log(
    `[gallery_items] Would upsert ${galleryItems.length} row(s) → gallery_items (onConflict=collection_id,slug)`,
  );
}

// Profile is a singleton row keyed by id=true.
await seed(
  "profile",
  "site_profile",
  [{ id: true, data: staticProfile }],
  "id",
);

console.log("\nDone.");
