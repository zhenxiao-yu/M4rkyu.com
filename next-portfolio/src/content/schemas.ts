import { z } from "zod";

export const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export const contentStatusSchema = z.enum(["ready", "draft", "placeholder", "coming-soon"]);

export const projectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  shortPitch: z.string(),
  category: z.enum([
    "web-app",
    "game-dev",
    "ai-tool",
    "art-film",
    "experiment",
    "maintenance",
  ]),
  year: z.string(),
  status: z.enum(["ready", "development", "maintenance", "archived", "draft"]),
  contentStatus: contentStatusSchema.default("draft"),
  featured: z.boolean(),
  problem: z.string(),
  solution: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  features: z.array(z.string()),
  architectureNotes: z.array(z.string()),
  challenges: z.array(z.string()).default(["TBD: replace with final challenge notes."]),
  screenshots: z.array(imageSchema).default([]),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  outcome: z.string(),
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

export const galleryCollectionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  cover: imageSchema,
  count: z.number(),
  status: contentStatusSchema.default("placeholder"),
});

export const galleryItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  collection: z.string(),
  type: z.enum(["image", "contact-sheet", "process"]),
  status: contentStatusSchema,
  caption: z.string(),
});

export const resourceSchema = z.object({
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  description: z.string(),
  why: z.string(),
  link: z.string().url(),
  pricing: z.string(),
  tags: z.array(z.string()),
  status: contentStatusSchema.default("placeholder"),
});

export const postSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  excerpt: z.string(),
  date: z.string(),
  readingTime: z.string(),
  tags: z.array(z.string()),
  status: contentStatusSchema,
});

export const gameSchema = z.object({
  title: z.string(),
  slug: z.string(),
  engine: z.string(),
  year: z.string(),
  status: contentStatusSchema,
  pitch: z.string(),
  role: z.string(),
  notes: z.array(z.string()),
});

export const mediaItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  format: z.enum(["video", "reel", "process", "poster"]),
  status: contentStatusSchema,
  description: z.string(),
  duration: z.string().optional(),
});

export const serviceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
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
