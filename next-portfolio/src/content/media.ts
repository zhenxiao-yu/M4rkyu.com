import { mediaItemSchema } from "./schemas";

export const mediaItems = [
  {
    title: "Portfolio reel placeholder",
    slug: "portfolio-reel-placeholder",
    format: "video",
    status: "placeholder",
    description: "VIDEO POSTER TBD: replace with a short optimized reel after media export.",
    duration: "TBD",
  },
  {
    title: "Game capture draft",
    slug: "game-capture-draft",
    format: "reel",
    status: "draft",
    description: "Draft: gameplay capture slot for future game archive pages.",
    duration: "TBD",
  },
  {
    title: "Artwork process frame",
    slug: "artwork-process-frame",
    format: "process",
    status: "coming-soon",
    description: "Coming soon: process media and captions after image optimization.",
  },
  {
    title: "Case-study poster system",
    slug: "case-study-poster-system",
    format: "poster",
    status: "placeholder",
    description: "Placeholder poster template for project detail hero media.",
  },
].map((item) => mediaItemSchema.parse(item));
