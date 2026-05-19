import { profileSchema } from "./schemas";

export const profile = profileSchema.parse({
  name: "ZhenXiao Mark Yu",
  title: "Software engineer, frontend developer, game developer, digital artist",
  location: "Ontario, Canada",
  email: "markyu0615@gmail.com",
  intro:
    "Mark builds at the intersection of software, games, visual systems, and digital art. The remake frames that range as one coherent archive: serious engineering, cinematic restraint, and creative systems thinking.",
  timeline: [
    {
      label: "China to Canada",
      detail: "A cross-cultural path that informs the site's bilingual and editorial direction.",
      date: "2013 onward",
    },
    {
      label: "Western University",
      detail: "Software engineering foundation, research exposure, and systems thinking.",
      date: "University",
    },
    {
      label: "J.D. Power",
      detail: "Full-stack internship experience across Java, Spring Boot, data workflows, and UI work.",
      date: "2022-2023",
    },
  ],
  values: [
    "Clarity before spectacle",
    "Performance as a design material",
    "Accessible interfaces with atmosphere",
    "Creative tooling that feels precise",
  ],
  socials: {
    github: "https://github.com/zhenxiao-yu",
    devto: "https://dev.to/zhenxiao_yu_a87bb6b2017f1",
  },
  resumeUrl: "/resume.pdf",
  githubHandle: "zhenxiao-yu",

  // Skills — grouped by `group`. SkillsRail buckets visually.
  // No fake levels; optional `note` only where a one-word qualifier helps.
  skills: [
    // Frontend
    { label: "React", group: "Frontend", note: "daily" },
    { label: "Next.js", group: "Frontend", note: "App Router" },
    { label: "TypeScript", group: "Frontend" },
    { label: "Tailwind", group: "Frontend", note: "v4 internals" },
    { label: "Motion", group: "Frontend" },
    { label: "Storybook", group: "Frontend" },
    { label: "Radix", group: "Frontend" },
    { label: "Vite", group: "Frontend" },
    { label: "HTML5", group: "Frontend" },
    { label: "CSS", group: "Frontend" },

    // Backend & Infra
    { label: "Node", group: "Backend & Infra" },
    { label: "PostgreSQL", group: "Backend & Infra" },
    { label: "Supabase", group: "Backend & Infra" },
    { label: "Resend", group: "Backend & Infra" },
    { label: "Vercel", group: "Backend & Infra" },
    { label: "REST", group: "Backend & Infra" },
    { label: "OAuth", group: "Backend & Infra" },

    // Game & Interaction
    { label: "Unity", group: "Game & Interaction" },
    { label: "C#", group: "Game & Interaction" },
    { label: "URP", group: "Game & Interaction" },
    { label: "Input systems", group: "Game & Interaction" },
    { label: "Game feel", group: "Game & Interaction" },

    // Creative & Visual
    { label: "Photography", group: "Creative & Visual" },
    { label: "Film", group: "Creative & Visual" },
    { label: "GLSL", group: "Creative & Visual", note: "shaders" },
    { label: "Color", group: "Creative & Visual" },
    { label: "Typography", group: "Creative & Visual" },

    // Tooling
    { label: "Git", group: "Tooling" },
    { label: "Figma", group: "Tooling" },
    { label: "Linear", group: "Tooling" },
    { label: "Claude Code", group: "Tooling" },
    { label: "Shell", group: "Tooling" },
  ],

  // Cities — WGS84 coordinates. `visitedAt` omitted; map renders
  // in array insertion order. Grouped by country for readability.
  cities: [
    // Canada (10)
    { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
    { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },
    { name: "Montreal", country: "Canada", lat: 45.5019, lng: -73.5674 },
    { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
    { name: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719 },
    { name: "Edmonton", country: "Canada", lat: 53.5461, lng: -113.4938 },
    { name: "Winnipeg", country: "Canada", lat: 49.8951, lng: -97.1384 },
    { name: "Halifax", country: "Canada", lat: 44.6488, lng: -63.5752 },
    { name: "Quebec City", country: "Canada", lat: 46.8139, lng: -71.208 },
    { name: "Victoria", country: "Canada", lat: 48.4284, lng: -123.3656 },

    // China (32)
    { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
    { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
    { name: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579 },
    { name: "Guangzhou", country: "China", lat: 23.1291, lng: 113.2644 },
    { name: "Chengdu", country: "China", lat: 30.5728, lng: 104.0668 },
    { name: "Chongqing", country: "China", lat: 29.563, lng: 106.5516 },
    { name: "Hangzhou", country: "China", lat: 30.2741, lng: 120.1551 },
    { name: "Suzhou", country: "China", lat: 31.2989, lng: 120.5853 },
    { name: "Nanjing", country: "China", lat: 32.0603, lng: 118.7969 },
    { name: "Wuhan", country: "China", lat: 30.5928, lng: 114.3055 },
    { name: "Xi'an", country: "China", lat: 34.3416, lng: 108.9398 },
    { name: "Tianjin", country: "China", lat: 39.3434, lng: 117.3616 },
    { name: "Qingdao", country: "China", lat: 36.0671, lng: 120.3826 },
    { name: "Dalian", country: "China", lat: 38.914, lng: 121.6147 },
    { name: "Shenyang", country: "China", lat: 41.8057, lng: 123.4315 },
    { name: "Harbin", country: "China", lat: 45.8038, lng: 126.5349 },
    { name: "Changsha", country: "China", lat: 28.2282, lng: 112.9388 },
    { name: "Zhengzhou", country: "China", lat: 34.7466, lng: 113.6254 },
    { name: "Jinan", country: "China", lat: 36.6512, lng: 117.1201 },
    { name: "Fuzhou", country: "China", lat: 26.0745, lng: 119.2965 },
    { name: "Xiamen", country: "China", lat: 24.4798, lng: 118.0894 },
    { name: "Kunming", country: "China", lat: 25.0389, lng: 102.7183 },
    { name: "Lhasa", country: "China", lat: 29.6525, lng: 91.1721 },
    { name: "Urumqi", country: "China", lat: 43.8256, lng: 87.6168 },
    { name: "Lanzhou", country: "China", lat: 36.0611, lng: 103.8343 },
    { name: "Hohhot", country: "China", lat: 40.8426, lng: 111.7491 },
    { name: "Nanning", country: "China", lat: 22.8174, lng: 108.3669 },
    { name: "Haikou", country: "China", lat: 20.0444, lng: 110.1989 },
    { name: "Sanya", country: "China", lat: 18.2528, lng: 109.5119 },
    { name: "Macau", country: "China", lat: 22.1987, lng: 113.5439 },
    { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694 },
    { name: "Hefei", country: "China", lat: 31.8206, lng: 117.2272 },

    // Japan (2)
    { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
  ],

  // Currently — small status feed surfaced in the about narrative
  // carousel. Edit freely; each entry becomes one auto-rotating slide.
  currently: [
    { kind: "building", label: "m4rkyu.com — the long-form archive" },
    { kind: "reading", label: "Designing Data-Intensive Applications" },
    { kind: "listening", label: "Hiroshi Yoshimura — Music for Nine Postcards" },
    { kind: "watching", label: "Severance, season 2" },
  ],

  // Portrait — drop a file at public/portrait.jpg (or any path under
  // /public) and update the src below. The card renders a placeholder
  // slot until a real src is set.
  // portrait: { src: "/portrait.jpg", alt: "Mark Yu, 2026", focal: "center" },
});
