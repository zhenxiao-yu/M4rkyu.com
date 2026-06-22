import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "M4rkyu.com",
    short_name: "M4rkyu",
    description:
      "Portfolio archive for software, games, visual systems, and writing by ZhenXiao Mark Yu.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    // Warm Risograph ink, not cold black: background_color matches the
    // BrandMark ground (#0c0a06) so the install/splash screen blends with
    // the M4 icon; theme_color matches the site's dark --background.
    background_color: "#0c0a06",
    theme_color: "#080705",
    categories: ["portfolio", "developer", "design"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
