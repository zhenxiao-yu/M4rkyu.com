import { z } from "zod";

export const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

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
  status: z.enum(["ready", "development", "maintenance", "archived"]),
  featured: z.boolean(),
  problem: z.string(),
  solution: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  features: z.array(z.string()),
  architectureNotes: z.array(z.string()),
  screenshots: z.array(imageSchema),
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
});

export type Project = z.infer<typeof projectSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type GalleryCollection = z.infer<typeof galleryCollectionSchema>;
export type Resource = z.infer<typeof resourceSchema>;
