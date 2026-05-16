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
    background_color: "#050505",
    theme_color: "#050505",
    categories: ["portfolio", "developer", "design"],
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
