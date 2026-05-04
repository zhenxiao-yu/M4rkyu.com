import { projectSchema, type Project } from "./schemas";

const projects = [
  {
    title: "Nimbus",
    slug: "nimbus",
    shortPitch:
      "A secure file management platform shaped around calm organization, OTP access, and storage analytics.",
    category: "web-app",
    year: "2024",
    status: "ready",
    featured: true,
    problem:
      "Personal cloud tools often feel either too bare or too opaque. Nimbus reframes file storage as a focused operating surface for uploads, access, and usage signals.",
    solution:
      "The product combines a Next.js interface, Appwrite-backed storage, OTP authentication, and compact analytics so the main file workflows stay fast and readable.",
    role: "Full-stack product engineer: interface architecture, authentication flow, storage workflows, responsive UI, and deployment.",
    stack: ["Next.js", "TypeScript", "Appwrite", "Tailwind CSS", "shadcn/ui", "Chart.js"],
    features: [
      "Secure file upload and organization",
      "OTP-based access flow",
      "Storage usage visualization",
      "Responsive dashboard layout",
    ],
    architectureNotes: [
      "Server-rendered routes keep the dashboard shell quick to parse.",
      "Client interactivity is scoped to upload state, charts, and account actions.",
      "Storage primitives are abstracted away from the visual project surface.",
    ],
    screenshots: [{ src: "/project-covers/nimbus.svg", alt: "Nimbus monochrome cover" }],
    liveUrl: "https://nimbus-storage-app.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/nimbus-storage-app",
    outcome:
      "A production-style case study for authenticated SaaS interfaces, storage UX, and polished dashboard motion.",
    lessonsLearned: [
      "Authentication copy matters as much as authentication mechanics.",
      "Storage products need visual hierarchy before they need decoration.",
    ],
    nextSteps: ["Add deeper audit logs", "Tighten empty and error states", "Document the Appwrite model"],
    seo: {
      title: "Nimbus case study",
      description: "Nimbus secure file management app by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "围绕文件组织、OTP 访问和存储分析构建的安全文件管理平台。",
        problem:
          "很多个人云工具要么过于简陋，要么过于封闭。Nimbus 把文件存储重新整理成一个清晰的操作界面。",
        solution:
          "项目使用 Next.js、Appwrite 存储、OTP 身份验证和紧凑的数据可视化，让上传、访问与管理流程保持轻快。",
      },
    },
  },
  {
    title: "BioLoom",
    slug: "bioloom",
    shortPitch:
      "An AI-assisted bio generator that turns scattered identity notes into concise, platform-ready personal copy.",
    category: "ai-tool",
    year: "2025",
    status: "ready",
    featured: true,
    problem:
      "Short profile bios are deceptively hard because they compress tone, audience, context, and professional signal into a tiny space.",
    solution:
      "BioLoom uses a guided prompt structure and a clean generation interface to help users shape sharper bios without feeling trapped in a blank text box.",
    role: "Frontend and AI product engineer: interaction flow, prompt surface, visual design, and deployment.",
    stack: ["Next.js", "React", "Tailwind CSS", "AI API", "Vercel"],
    features: [
      "Guided tone and platform inputs",
      "Fast generated bio variants",
      "Minimal responsive interface",
      "Copy-friendly output patterns",
    ],
    architectureNotes: [
      "The generation path is intentionally short to reduce drop-off.",
      "The UI separates creative input from final copy review.",
    ],
    screenshots: [{ src: "/project-covers/bioloom.svg", alt: "BioLoom monochrome cover" }],
    liveUrl: "https://bioloom.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/bioloom",
    outcome:
      "A compact AI utility that demonstrates how lightweight product structure can make generative interfaces feel useful.",
    lessonsLearned: [
      "Good AI tools narrow the decision space before generation.",
      "Small tools still need strong typography and empty states.",
    ],
    nextSteps: ["Add saved presets", "Improve multilingual output examples"],
    seo: {
      title: "BioLoom case study",
      description: "BioLoom AI bio generator by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "AI 辅助简介生成器，把零散的身份信息整理成适合不同平台的短文案。",
        problem:
          "个人简介看似很短，却要压缩语气、受众、背景和职业信号，写起来并不简单。",
        solution:
          "BioLoom 通过引导式输入和干净的生成界面，帮助用户摆脱空白文本框，更快得到可用版本。",
      },
    },
  },
  {
    title: "M4rketView",
    slug: "m4rketview",
    shortPitch:
      "A cryptocurrency screener built for quick scanning, watchlist thinking, and market table clarity.",
    category: "web-app",
    year: "2024",
    status: "ready",
    featured: true,
    problem:
      "Crypto dashboards tend to drown users in motion, color, and unstable hierarchy. M4rketView focuses on comparison and scan speed.",
    solution:
      "The interface prioritizes table density, search, watchlist states, and readable market metrics over decorative chart noise.",
    role: "Frontend engineer: data UI, table experience, responsive behavior, and API integration.",
    stack: ["React", "Tailwind CSS", "CoinGecko API", "Chart.js", "Vercel"],
    features: [
      "Market table with search",
      "Watchlist-style scanning",
      "Responsive metric cards",
      "Readable crypto asset hierarchy",
    ],
    architectureNotes: [
      "The project keeps market fetching separate from display formatting.",
      "Table rows are designed for repeat comparison rather than one-time browsing.",
    ],
    screenshots: [{ src: "/project-covers/m4rketview.svg", alt: "M4rketView monochrome cover" }],
    liveUrl: "https://m4rket-view.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/M4rketView",
    outcome:
      "A focused market interface that shows comfort with data-heavy products and financial UI constraints.",
    lessonsLearned: [
      "Dense layouts need restraint, not extra animation.",
      "Financial interfaces should reveal state changes without shouting.",
    ],
    nextSteps: ["Add saved views", "Improve loading skeletons", "Document API fallback behavior"],
    seo: {
      title: "M4rketView case study",
      description: "M4rketView cryptocurrency screener by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "为快速浏览、自选观察和行情表格清晰度设计的加密货币筛选工具。",
        problem:
          "很多加密货币面板被颜色、动效和信息层级淹没。M4rketView 更关注比较效率。",
        solution:
          "界面优先处理表格密度、搜索、自选状态和可读指标，而不是堆叠装饰性图表。",
      },
    },
  },
] satisfies Project[];

export const allProjects = projects.map((project) => projectSchema.parse(project));
export const featuredProjects = allProjects.filter((project) => project.featured);

export function getProject(slug: string) {
  return allProjects.find((project) => project.slug === slug);
}
