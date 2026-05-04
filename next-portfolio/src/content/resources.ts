import { resourceSchema } from "./schemas";

export const resources = [
  {
    name: "Next.js",
    slug: "nextjs",
    category: "Framework",
    description: "React framework for server-rendered, static, and streaming application surfaces.",
    why: "The remake uses it for route-level metadata, server components, image optimization, and Vercel alignment.",
    link: "https://nextjs.org",
    pricing: "Free",
    tags: ["react", "vercel", "performance"],
  },
  {
    name: "shadcn/ui",
    slug: "shadcn-ui",
    category: "UI foundation",
    description: "Copy-owned component foundation built on Radix primitives.",
    why: "It supports source ownership while keeping accessibility primitives close to the codebase.",
    link: "https://ui.shadcn.com",
    pricing: "Free",
    tags: ["radix", "design-system", "accessibility"],
  },
  {
    name: "Pagefind",
    slug: "pagefind",
    category: "Search",
    description: "Static-site search that can be added without a hosted search dependency.",
    why: "A good first search layer for portfolio content before a hosted search system is justified.",
    link: "https://pagefind.app",
    pricing: "Free",
    tags: ["search", "static", "content"],
  },
].map((resource) => resourceSchema.parse(resource));
