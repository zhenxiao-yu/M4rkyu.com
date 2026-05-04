import { galleryCollectionSchema } from "./schemas";

export const galleryCollections = [
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
].map((collection) => galleryCollectionSchema.parse(collection));
