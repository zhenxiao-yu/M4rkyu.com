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
  link: z.string().url(),
  pricing: z.string().min(1),
  tags: z.array(z.string()),
  status: contentStatusSchema.default("placeholder"),
});

export const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  excerpt: z.string().min(1),
  date: z.string().min(1),
  readingTime: z.string().min(1),
  tags: z.array(z.string()),
  status: contentStatusSchema,
  // Phase 1.5 additions
  pinned: z.boolean().default(false),
});

// Build-time invariant: at most one post may be pinned site-wide.
export const postsArraySchema = z.array(postSchema).superRefine((arr, ctx) => {
  const pinnedCount = arr.filter((p) => p.pinned).length;
  if (pinnedCount > 1) {
    ctx.addIssue({
      code: "custom",
      message: `Only one post may be pinned at a time (found ${pinnedCount}).`,
    });
  }
});

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
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  fit: z.array(z.string()),
  status: contentStatusSchema,
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
