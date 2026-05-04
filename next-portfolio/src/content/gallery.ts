import type { z } from "zod";
import { galleryCollectionSchema, galleryItemSchema } from "./schemas";

const galleryCollectionEntries = [
  {
    title: "Black & White",
    slug: "black-white",
    description: "Contrast studies, street fragments, and visual notes shaped for gallery mode.",
    cover: { src: "/gallery/black-white.svg", alt: "Black and white gallery cover" },
    count: 12,
  },
  {
    title: "Artworks",
    slug: "artworks",
    description: "A compact archive of painting, digital studies, and physical-to-digital experiments.",
    cover: { src: "/gallery/artworks.svg", alt: "Artworks gallery cover" },
    count: 18,
  },
  {
    title: "Travel Contact Sheets",
    slug: "travel-contact-sheets",
    description: "China, Canada, and travel memory arranged as restrained visual contact sheets.",
    cover: { src: "/gallery/travel.svg", alt: "Travel contact sheet cover" },
    count: 24,
  },
] satisfies Array<z.input<typeof galleryCollectionSchema>>;

const galleryItemEntries = [
  {
    title: "Placeholder contact sheet 01",
    slug: "placeholder-contact-sheet-01",
    collection: "black-white",
    type: "contact-sheet",
    status: "placeholder",
    caption: "Placeholder: replace with final black-and-white photography selection.",
  },
  {
    title: "Draft monochrome study",
    slug: "draft-monochrome-study",
    collection: "black-white",
    type: "image",
    status: "draft",
    caption: "Draft: final caption and metadata pending.",
  },
  {
    title: "Digital artwork frame TBD",
    slug: "digital-artwork-frame-tbd",
    collection: "artworks",
    type: "image",
    status: "placeholder",
    caption: "MEDIA TBD: final artwork image and process notes pending.",
  },
  {
    title: "Process scan pending",
    slug: "process-scan-pending",
    collection: "artworks",
    type: "process",
    status: "coming-soon",
    caption: "Coming soon: process capture will be added after media optimization.",
  },
  {
    title: "Travel memory placeholder",
    slug: "travel-memory-placeholder",
    collection: "travel-contact-sheets",
    type: "contact-sheet",
    status: "placeholder",
    caption: "Placeholder: replace with final travel contact sheet.",
  },
  {
    title: "Archive negative TBD",
    slug: "archive-negative-tbd",
    collection: "travel-contact-sheets",
    type: "image",
    status: "draft",
    caption: "TBD: add final location-safe caption without private address details.",
  },
] satisfies Array<z.input<typeof galleryItemSchema>>;

export const galleryCollections = galleryCollectionEntries.map((collection) =>
  galleryCollectionSchema.parse(collection),
);

export const galleryItems = galleryItemEntries.map((item) => galleryItemSchema.parse(item));
