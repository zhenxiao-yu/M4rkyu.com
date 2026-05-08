import { postSchema } from "./schemas";

export const posts = [
  {
    title: "Draft: Rebuilding M4rkyu.com as a black-and-white archive",
    slug: "rebuilding-m4rkyu-archive",
    category: "Devlog",
    excerpt:
      "Placeholder devlog: final notes will document the design-system decisions, route architecture, and performance constraints.",
    date: "Draft",
    readingTime: "TBD",
    tags: ["remake", "design-system", "nextjs"],
    status: "draft",
  },
  {
    title: "Coming soon: Case-study writing system",
    slug: "case-study-writing-system",
    category: "Writing",
    excerpt:
      "Coming soon: a repeatable format for problem, solution, role, architecture, outcome, and lessons learned.",
    date: "Coming soon",
    readingTime: "TBD",
    tags: ["case-study", "portfolio"],
    status: "coming-soon",
  },
  {
    title: "TBD: Notes on game-feel prototypes",
    slug: "game-feel-prototypes",
    category: "Game dev",
    excerpt:
      "TBD: replace with real prototype notes after the game archive media and system diagrams are selected.",
    date: "TBD",
    readingTime: "TBD",
    tags: ["games", "systems"],
    status: "placeholder",
  },
].map((post) => postSchema.parse(post));
