import { serviceSchema } from "./schemas";

export const services = [
  {
    title: "Frontend systems",
    slug: "frontend-systems",
    description:
      "Draft: polished React/Next.js interfaces, design-system implementation, and responsive product surfaces.",
    fit: ["Portfolio/product prototypes", "Component systems", "Performance-minded UI"],
    status: "draft",
  },
  {
    title: "Full-stack app prototypes",
    slug: "full-stack-app-prototypes",
    description:
      "Placeholder: scoped app builds with clear data models, auth boundaries, and production-safe deployment paths.",
    fit: ["MVP surfaces", "Dashboards", "Developer tools"],
    status: "placeholder",
  },
  {
    title: "Game and creative systems",
    slug: "game-creative-systems",
    description:
      "Coming soon: collaboration lane for game prototypes, visual archives, and interactive portfolio experiences.",
    fit: ["Game UI", "Creative tools", "Interactive archives"],
    status: "coming-soon",
  },
].map((service) => serviceSchema.parse(service));
