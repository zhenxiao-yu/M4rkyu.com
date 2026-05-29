import { z } from "zod";

// `min(1)` on required strings so empty data fails the Zod parse at
// build time rather than silently rendering a blank line. Optional
// fields stay loose; `contentStatusSchema` already gates whether a
// page is real or placeholder.

export const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

export const contentStatusSchema = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

export const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  shortPitch: z.string().min(1),
  category: z.enum([
    "web-app",
    "game-dev",
    "ai-tool",
    "art-film",
    "experiment",
    "maintenance",
  ]),
  year: z.string().min(1),
  status: z.enum(["ready", "development", "maintenance", "archived", "draft"]),
  contentStatus: contentStatusSchema.default("draft"),
  featured: z.boolean(),
  problem: z.string().min(1),
  solution: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string()),
  // Cross-cutting tags (themes, scope, audience). Separate from
  // `stack` (technologies) — the /work filter UX can offer either
  // axis. Default empty so existing static entries validate.
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()),
  architectureNotes: z.array(z.string()),
  // No "TBD…" default — an empty array reads as "no challenges yet"
  // and the page section collapses cleanly. Inventing placeholder
  // copy here would inject fake content into every project that
  // forgot to author this field.
  challenges: z.array(z.string()).default([]),
  screenshots: z.array(imageSchema).default([]),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  outcome: z.string().min(1),
  lessonsLearned: z.array(z.string()),
  nextSteps: z.array(z.string()),
  seo: seoSchema,
  translations: z.record(z.string(), z.unknown()).optional(),
});

const profilePortraitSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  focal: z.enum(["top", "center", "bottom"]).default("center"),
});

export const profileSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  email: z.string().email(),
  intro: z.string(),
  timeline: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
      date: z.string(),
    }),
  ),
  values: z.array(z.string()),
  // Optional social handles. Each key holds either a real URL or
  // null/undefined when the handle hasn't been claimed yet — the
  // footer / CTA renderers render only the populated ones, so adding
  // a handle requires no other code changes.
  socials: z
    .object({
      github: z.string().url().optional(),
      devto: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      bluesky: z.string().url().optional(),
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      mastodon: z.string().url().optional(),
      facebook: z.string().url().optional(),
      youtube: z.string().url().optional(),
      buymeacoffee: z.string().url().optional(),
    })
    .partial()
    .default({}),
  // Optional resume link. Public PDF lives at `public/resume.pdf`.
  resumeUrl: z.string().optional(),
  // About-dashboard fields — all default-empty so the page renders
  // gracefully before content is filled in.
  // GitHub handle (slug only — full URL derives from this in the GitHub stats card).
  githubHandle: z.string().optional(),
  // Tasteful skills list — group buckets the rail visually, no fake levels.
  skills: z
    .array(
      z.object({
        label: z.string(),
        group: z.string(),
        // Optional: short descriptor / "depth" hint (e.g., "daily", "exploring").
        note: z.string().optional(),
      }),
    )
    .default([]),
  // Cities visited recently — render as dots on the about travel map.
  cities: z
    .array(
      z.object({
        name: z.string(),
        country: z.string(),
        // WGS84 decimal coordinates; coords.com has a free picker.
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        // Optional ISO-ish ("2024-08") so the timeline can sort. When
        // omitted, the travel map falls back to array insertion order
        // and hides the per-entry date in the list.
        visitedAt: z.string().optional(),
        // Optional: short note shown on hover/tap.
        note: z.string().optional(),
      }),
    )
    .default([]),
  // "Currently into" status items — surfaced in the about page
  // narrative carousel. Each entry becomes one auto-rotating slide.
  // Kept short and editable; no API fetch.
  currently: z
    .array(
      z.object({
        kind: z.enum(["building", "reading", "listening", "watching"]),
        label: z.string(),
        detail: z.string().optional(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  // Optional portraits for the /about portrait stack. `portrait` is
  // kept as a single-image fallback for older content.
  portraits: z.array(profilePortraitSchema).default([]),
  portrait: profilePortraitSchema.optional(),
});

export const galleryAspectSchema = z.enum([
  "1/1",
  "4/5",
  "3/4",
  "2/3",
  "16/9",
  "21/9",
]);

export const galleryCollectionSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  cover: imageSchema.extend({
    focal: z.enum(["top", "center", "bottom"]).default("center"),
  }),
  count: z.number(),
  status: contentStatusSchema.default("placeholder"),
  intro: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mood: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export const galleryItemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  collection: z.string().min(1),
  type: z.enum(["image", "contact-sheet", "process"]),
  status: contentStatusSchema,
  caption: z.string().min(1),
  src: imageSchema.optional(),
  aspect: galleryAspectSchema.default("4/5"),
  capturedAt: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  mood: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  related: z.array(z.string()).default([]),
});

export const resourceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  why: z.string().min(1),
  // "link" resources point at external sites; "tool" resources live at
  // /resources/[slug] and render an in-browser interactive component
  // loaded via the dynamic tool registry in src/components/tools/.
  type: z.enum(["link", "tool"]).default("link"),
  // For type="link" this is the external URL. For type="tool" this can
  // be a docs/source URL associated with the tool (often the same as
  // the in-house route). Always validated as a URL so cards have
  // somewhere to point.
  link: z.string().url(),
  pricing: z.string().min(1),
  tags: z.array(z.string()),
  status: contentStatusSchema.default("placeholder"),
  // Featured tools get the bento spotlight on /resources. Defaults to
  // false so existing entries keep validating untouched.
  featured: z.boolean().default(false),
  // Optional lucide icon name; falls back to a sensible category default.
  iconKey: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  excerpt: z.string().min(1),
  date: z.string().min(1),
  publishedAt: z.string().optional(),
  readingTime: z.string().min(1),
  tags: z.array(z.string()),
  status: contentStatusSchema,
  // Phase 1.5 additions
  pinned: z.boolean().default(false),
  // Phase 8.1 additions — populated when the post is syndicated
  // from dev.to. `canonicalUrl` is set to dev.to so search engines
  // see the original as canonical (no duplicate-content penalty);
  // `coverImage` is dev.to's CDN-hosted social image.
  canonicalUrl: z.string().url().optional(),
  coverImage: imageSchema.optional(),
  reactionsCount: z.number().int().nonnegative().default(0),
  commentsCount: z.number().int().nonnegative().default(0),
});

// Note: the previous `postsArraySchema` ("at most one pinned") was
// retired in Phase 8.1. Posts now come from the dev.to API which
// has no pinned concept; the local `Post.pinned` flag is reserved
// for a future hand-curated feature post and stays at most one by
// authoring convention.

export const gameSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  engine: z.string().min(1),
  year: z.string().min(1),
  status: contentStatusSchema,
  pitch: z.string().min(1),
  role: z.string().min(1),
  notes: z.array(z.string()),
  // Phase 1.3 additions — all optional / defaulted so existing content validates.
  cover: imageSchema.optional(),
  trailerUrl: z.string().url().optional(),
  platforms: z.array(z.string()).default([]),
  pillars: z.array(z.string()).default([]),
  postmortem: z.string().optional(),
  outcome: z.string().optional(),
  buildLinks: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .default([]),
  // Phase 3.2 — per-locale translation overrides. Mirrors projectSchema.
  // Same `localize()` helper at src/lib/content/localize.ts merges the
  // active-locale slice into the base game object.
  translations: z.record(z.string(), z.unknown()).optional(),
});

export const mediaItemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  format: z.enum(["video", "reel", "process", "poster"]),
  status: contentStatusSchema,
  description: z.string().min(1),
  duration: z.string().optional(),
  // Optional poster/still uploaded via the admin CMS. When present the
  // /media surfaces render it instead of the placeholder frame.
  poster: imageSchema.optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  fit: z.array(z.string()),
  status: contentStatusSchema,
});

// /notes is a personal microblog — a persona feed of short posts. Each
// note is one of five kinds; kind-specific fields stay optional so a
// plain "update" validates without carrying review/tierlist baggage.
export const noteKindSchema = z.enum([
  "update", // a status / what-I'm-doing post
  "repost", // sharing an external link with commentary
  "note", // a longer free-form thought
  "review", // a rated take on a book / film / album / game / object
  "tierlist", // a ranked S/A/B/… list
]);

// One row of a tier list — a label ("S", "A", "Honorable mentions") and
// the items ranked into it.
export const noteTierSchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string()).default([]),
});

export const noteSchema = z.object({
  slug: z.string().min(1),
  kind: noteKindSchema.default("note"),
  // Optional for terse "update" posts; used as the subject line for
  // reviews and the name of a tier list.
  title: z.string().default(""),
  // Markdown body, rendered through the shared remark + Shiki pipeline.
  body: z.string().default(""),
  status: contentStatusSchema.default("draft"),
  tags: z.array(z.string()).default([]),
  // Display + sort date (ISO string). The feed is newest-first.
  publishedAt: z.string().min(1),
  // repost / review source link.
  link: z
    .object({ url: z.string().url(), label: z.string().default("") })
    .optional(),
  // review rating, 0–5 (0 = unrated).
  rating: z.number().int().min(0).max(5).optional(),
  // tierlist rows (empty for other kinds).
  tiers: z.array(noteTierSchema).default([]),
});

export type Project = z.infer<typeof projectSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type GalleryCollection = z.infer<typeof galleryCollectionSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Post = z.infer<typeof postSchema>;
export type Game = z.infer<typeof gameSchema>;
export type MediaItem = z.infer<typeof mediaItemSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Note = z.infer<typeof noteSchema>;
export type NoteKind = z.infer<typeof noteKindSchema>;
export type NoteTier = z.infer<typeof noteTierSchema>;
