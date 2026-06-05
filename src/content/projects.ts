import type { z } from "zod";
import { projectSchema } from "./schemas";

type ProjectInput = z.input<typeof projectSchema>;

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
    stackGroups: [
      { group: "Frontend", items: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"] },
      { group: "Backend", items: ["Appwrite"] },
      { group: "Data viz", items: ["Chart.js"] },
    ],
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
    year: "2024",
    status: "ready",
    featured: true,
    problem:
      "Short profile bios are deceptively hard because they compress tone, audience, context, and professional signal into a tiny space.",
    solution:
      "BioLoom pairs a guided prompt structure with streaming generation and multi-model fallbacks (Gemini, Groq via the Vercel AI SDK), so users shape sharper, platform-specific bios — and can share the result.",
    role: "Frontend and AI product engineer: interaction flow, prompt surface, visual design, and deployment.",
    stack: ["Next.js", "TypeScript", "Vercel AI SDK", "Gemini", "Groq", "Tailwind CSS", "shadcn/ui"],
    stackGroups: [
      { group: "Frontend", items: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"] },
      { group: "AI", items: ["Vercel AI SDK", "Gemini", "Groq"] },
    ],
    features: [
      "Streaming generated bios",
      "Multi-model fallback (Gemini, Groq)",
      "Platform-specific tone presets",
      "Shareable output links",
    ],
    architectureNotes: [
      "The generation path is intentionally short to reduce drop-off.",
      "The UI separates creative input from final copy review.",
    ],
    screenshots: [{ src: "/project-covers/bioloom.svg", alt: "BioLoom monochrome cover" }],
    liveUrl: "https://ai-bio-generator-steel.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/ai-bio-generator",
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
      "The interface prioritizes live prices over WebSocket, DeFi analytics, portfolio tracking, and a searchable, comparison-first market table over decorative chart noise.",
    role: "Frontend engineer: data UI, table experience, responsive behavior, and API integration.",
    stack: ["React", "TypeScript", "TanStack Query", "WebSocket", "Vite", "Vercel"],
    stackGroups: [
      { group: "Frontend", items: ["React", "TypeScript", "Vite"] },
      { group: "Data", items: ["TanStack Query", "WebSocket"] },
      { group: "Infra", items: ["Vercel"] },
    ],
    features: [
      "Live prices over WebSocket",
      "DeFi analytics and portfolio tracking",
      "Searchable market table",
      "Readable, comparison-first hierarchy",
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
  {
    title: "Bloomprint",
    slug: "bloomprint",
    shortPitch:
      "Turns yard inspiration into a buildable plan — what to buy, how much, what tools, in what order, and what can go wrong.",
    category: "web-app",
    year: "2026",
    status: "development",
    contentStatus: "ready",
    featured: true,
    problem:
      "Landscaping a yard is overwhelming: an inspiration photo says nothing about materials, quantities, tools, sequencing, or the ways a project can go wrong — and most tools answer with a chatbot's confident guess.",
    solution:
      "A structured planning app, not a chatbot: a deterministic engine is the source of truth and works fully offline with no AI key and no photo — AI only rephrases the finished plan. Every plan is grounded in a region-aware catalog (Ontario-first), price bands instead of fake exact prices, material calculators that widen when you haven't measured, and per-phase how-to guides.",
    role: "Solo developer: planning engine, product UI, local-first storage, and optional cloud sync.",
    stack: ["Next.js", "React 19", "TypeScript", "Supabase", "TensorFlow.js", "Konva", "Tailwind CSS", "Zod"],
    stackGroups: [
      { group: "Frontend", items: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Konva"] },
      { group: "Backend", items: ["Supabase", "Zod"] },
      { group: "ML", items: ["TensorFlow.js"] },
    ],
    tags: ["planning", "local-first", "gardening", "deterministic"],
    features: [
      "Deterministic planning engine as the source of truth",
      "Local-first storage with optional Supabase cross-device sync",
      "Free/Open Data Mode — works with no paid API",
      "Region-aware retailer links and honest price bands",
      "Optional AI presentation (Claude) with silent fallback",
      "On-device photo segmentation (TensorFlow.js)",
    ],
    architectureNotes: [
      "The deterministic engine owns the truth; AI and live data only enrich, never override.",
      "Local-first by design — the plan never waits on the network; cloud sync sits behind the local layer.",
      "Every live fact carries a source, a confidence tag, and a 'last checked' time.",
    ],
    screenshots: [{ src: "/project-covers/bloomprint.svg", alt: "Bloomprint yard plan blueprint cover" }],
    liveUrl: "https://bloomprint.online",
    githubUrl: "https://github.com/zhenxiao-yu/Bloomprint",
    outcome:
      "A working local-first planning app live at bloomprint.online that chooses honest grounding — sourced facts, confidence tags, price ranges — over confident AI guesswork.",
    lessonsLearned: [
      "Deterministic-first earns trust a chatbot-first tool can't.",
      "Honest hedging — ranges, 'verify before buying' — reads as more credible than false precision.",
      "Local-first changes every assumption about state, sync, and failure.",
    ],
    nextSteps: ["Expand the catalog beyond Ontario", "Wire real live-data providers", "Add collaborative plans"],
    seo: {
      title: "Bloomprint case study",
      description: "Bloomprint turns yard inspiration into a buildable, honestly-grounded plan. By ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "把庭院灵感变成可执行的方案——买什么、买多少、需要哪些工具、按什么顺序、可能会出什么问题。",
        problem:
          "改造庭院让人无从下手：一张灵感照片说不清材料、数量、工具和步骤，也说不清哪里会出错——而多数工具只会像聊天机器人一样给出自信的猜测。",
        solution:
          "这是一个结构化的规划应用，而不是聊天机器人：确定性引擎才是真正的依据，完全离线、无需 AI 密钥和照片也能工作——AI 只负责润色已生成的方案。每份方案都基于区域化目录（以安大略为先）、价格区间而非虚假精确价、在未测量时自动放宽的用料计算，以及分阶段的操作指南。",
      },
    },
  },
  {
    title: "Purecreate",
    slug: "purecreate",
    shortPitch:
      "A 3D apparel customizer that designs your shirt in real time and generates decals from a text prompt with DALL·E 3.",
    category: "ai-tool",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "Designing custom apparel usually means clunky mockup tools or a slow back-and-forth with a designer — there's no fast, visual way to see an idea on the product and iterate.",
    solution:
      "A single Next.js app pairing a real-time react-three-fiber 3D garment canvas with DALL·E 3 decal generation: pick colors, type a prompt, and watch the design appear on a rotating shirt. It consolidates an older Vite + Express monorepo into one deployable app, with the OpenAI calls living in Route Handlers instead of a separate server.",
    role: "Solo developer: 3D canvas, AI image route, reactive state, and the Next.js port.",
    stack: ["Next.js", "React", "react-three-fiber", "three.js", "Valtio", "OpenAI (DALL·E 3)", "Tailwind CSS"],
    stackGroups: [
      { group: "Frontend", items: ["Next.js", "React", "Tailwind CSS"] },
      { group: "3D", items: ["react-three-fiber", "three.js", "Valtio"] },
      { group: "AI", items: ["OpenAI (DALL·E 3)"] },
    ],
    tags: ["3d", "ai", "image-generation", "customizer"],
    features: [
      "Real-time 3D garment customizer (react-three-fiber)",
      "AI decal generation from a text prompt (DALL·E 3)",
      "Live color and texture controls",
      "Single deployable Next.js app — OpenAI in Route Handlers",
    ],
    architectureNotes: [
      "The 3D scene is dynamically imported (ssr: false) so heavy WebGL never blocks first paint.",
      "OpenAI calls live in Route Handlers — no separate Express server, server-side key only.",
      "Valtio holds reactive design state shared between the UI and the 3D scene.",
    ],
    screenshots: [{ src: "/project-covers/purecreate.svg", alt: "Purecreate 3D apparel customizer cover" }],
    liveUrl: "https://purecreate-designer.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/Purecreate-Demo",
    outcome:
      "A deployed 3D + AI customizer that turns a text prompt into a design on a rotating garment — and a clean Vite/Express → Next.js consolidation.",
    lessonsLearned: [
      "Dynamically importing the 3D scene keeps a heavy WebGL app fast to first paint.",
      "Collapsing a frontend + API monorepo into one Next.js app removes a whole deploy surface.",
    ],
    nextSteps: ["Add saved designs", "Support more garment types", "Tighten mobile 3D controls"],
    seo: {
      title: "Purecreate case study",
      description: "Purecreate 3D apparel customizer with DALL·E 3 decal generation by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "一个 3D 服装定制器，实时设计你的 T 恤，并通过 DALL·E 3 根据文字提示生成图案。",
        problem:
          "定制服装通常意味着繁琐的样机工具，或与设计师反复沟通——缺少一种快速、可视化地把想法呈现在产品上并迭代的方式。",
        solution:
          "一个 Next.js 应用，将基于 react-three-fiber 的实时 3D 服装画布与 DALL·E 3 图案生成结合：选颜色、输入提示词，就能看到设计出现在旋转的 T 恤上。它把原本 Vite + Express 的多仓库整合成一个可部署的应用，OpenAI 调用放在 Route Handlers 中，而非独立服务器。",
      },
    },
  },
  {
    title: "Unreal Battle Royale Prototype",
    slug: "unreal-battle-royale",
    shortPitch:
      "A UE4 battle-royale prototype built with Blueprints — inventory, weapon handling, and core match systems.",
    category: "game-dev",
    year: "2021",
    status: "archived",
    contentStatus: "ready",
    featured: false,
    problem:
      "A deep dive into Unreal Engine systems: how a battle-royale match actually holds together — inventory, pickups, weapons, and player state — built primarily in Blueprints.",
    solution:
      "Implemented in Unreal Engine 4 with Blueprint visual scripting and some C++, the prototype assembles inventory management, weapon handling, and the moment-to-moment systems a battle-royale loop needs.",
    role: "Solo developer: gameplay systems, Blueprint scripting, and integration.",
    stack: ["Unreal Engine 4", "Blueprints", "C++"],
    stackGroups: [
      { group: "Engine", items: ["Unreal Engine 4"] },
      { group: "Scripting", items: ["Blueprints", "C++"] },
    ],
    tags: ["battle-royale", "unreal-engine", "gamedev"],
    features: [
      "Inventory and pickup system",
      "Weapon handling and switching",
      "Blueprint-driven gameplay systems",
      "Battle-royale match scaffolding",
    ],
    architectureNotes: [
      "Gameplay logic lives in Blueprints for fast iteration, with C++ where it matters.",
      "Systems are componentized so inventory and weapons stay decoupled.",
    ],
    challenges: ["Keeping Blueprint graphs readable as systems grow."],
    screenshots: [{ src: "/project-covers/unreal-battle-royale.svg", alt: "Unreal battle-royale safe-zone map cover" }],
    githubUrl: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
    outcome:
      "A UE4 prototype exploring inventory, weapon handling, and Blueprint-driven battle-royale systems.",
    lessonsLearned: [
      "Blueprints are great for iteration but need discipline to stay readable.",
      "Even a prototype benefits from componentized, decoupled systems.",
    ],
    nextSteps: ["Document the Blueprint architecture", "Capture gameplay footage", "Port key systems to C++"],
    seo: {
      title: "Unreal Battle Royale Prototype case study",
      description: "UE4 battle-royale prototype with inventory and weapon systems by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "使用 UE4 与蓝图打造的大逃杀原型——包含背包、武器操作与核心对局系统。",
        problem:
          "一次对虚幻引擎系统的深入研究：一局大逃杀究竟是如何运转的——背包、拾取、武器与玩家状态，主要使用蓝图实现。",
        solution:
          "在 Unreal Engine 4 中以蓝图可视化脚本（辅以部分 C++）实现，原型搭建了背包管理、武器操作，以及大逃杀循环所需的实时系统。",
      },
    },
  },
  {
    title: "Descent Into Madness",
    slug: "descent-into-madness",
    shortPitch:
      "A 2D pixel-art roguelike shooter built in Unity — descend, fight, and survive escalating runs.",
    category: "game-dev",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "A focused prototype for learning roguelike loops: procedural pressure, run-based progression, and tight shooting inside a pixel-art frame.",
    solution:
      "Built in Unity 2022.3 with C#, the game pairs pixel-art combat with a roguelike structure of escalating encounters, published as a playable build on itch.io.",
    role: "Solo developer: gameplay systems, C# scripting, pixel-art integration, and build/publish.",
    stack: ["Unity", "C#", "Pixel art", "itch.io"],
    stackGroups: [
      { group: "Engine", items: ["Unity", "C#"] },
      { group: "Art", items: ["Pixel art"] },
      { group: "Release", items: ["itch.io"] },
    ],
    tags: ["roguelike", "2d", "pixel", "gamedev"],
    features: [
      "Run-based roguelike progression",
      "Pixel-art enemies and environments",
      "Twin-stick-style shooting",
      "Playable build on itch.io",
    ],
    architectureNotes: [
      "Encounter and spawn logic is data-driven so runs vary without code changes.",
      "Combat, movement, and UI are kept in separate Unity systems.",
    ],
    challenges: ["Tuning difficulty escalation so runs stay tense but fair."],
    screenshots: [{ src: "/project-covers/descent-into-madness.svg", alt: "Descent Into Madness pixel dungeon cover" }],
    liveUrl: "https://markyu615.itch.io/descent-into-madness",
    githubUrl: "https://github.com/zhenxiao-yu/Descent-In-To-Madness",
    outcome:
      "A playable pixel roguelike prototype published on itch.io.",
    lessonsLearned: [
      "Roguelike tension comes from pacing, not just enemy count.",
      "Shipping a build to itch.io forces real finish work a repo never demands.",
    ],
    nextSteps: ["Add more enemy archetypes", "Expand run modifiers", "Capture gameplay footage"],
    seo: {
      title: "Descent Into Madness case study",
      description: "Descent Into Madness 2D pixel roguelike shooter by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "用 Unity 制作的 2D 像素风 Roguelike 射击游戏——不断深入、战斗，并在逐步升级的关卡中生存。",
        problem:
          "一个聚焦的原型，用来学习 Roguelike 的核心循环：程序化的压力、以局为单位的成长，以及像素风格下利落的射击手感。",
        solution:
          "使用 Unity 2022.3 与 C# 开发，将像素风战斗与逐步升级的 Roguelike 结构结合，并在 itch.io 上发布了可游玩的版本。",
      },
    },
  },
  {
    title: "UI Studio",
    slug: "ui-studio",
    shortPitch:
      "A real-time collaborative design canvas where multiple people sketch, arrange, and edit the same board at once.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "Design tools tend to be either single-player or heavyweight. UI Studio explores how light a shared canvas can feel while still handling live presence and concurrent edits.",
    solution:
      "A Next.js canvas built on Fabric.js for vector editing and Liveblocks for multiplayer state, so cursors, selections, and shape changes sync between collaborators in real time.",
    role: "Solo developer: canvas architecture, multiplayer state, interface, and deployment.",
    stack: ["Next.js", "TypeScript", "Fabric.js", "Liveblocks", "Tailwind CSS"],
    stackGroups: [
      { group: "Frontend", items: ["Next.js", "TypeScript", "Tailwind CSS"] },
      { group: "Canvas", items: ["Fabric.js"] },
      { group: "Realtime", items: ["Liveblocks"] },
    ],
    tags: ["realtime", "collaboration", "design-tool"],
    features: [
      "Live multiplayer canvas with presence",
      "Vector shapes, text, and image objects",
      "Per-user cursors and selections",
      "Shareable room-based boards",
    ],
    architectureNotes: [
      "Fabric.js owns the canvas object model; Liveblocks owns the shared state.",
      "Ephemeral presence is separated from durable storage so cursors stay fast on heavy boards.",
    ],
    screenshots: [{ src: "/project-covers/ui-studio.svg", alt: "UI Studio collaborative canvas cover" }],
    liveUrl: "https://ui-studio-mu.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/ui-studio",
    outcome:
      "A working real-time canvas deployed on Vercel — a study in multiplayer presence and conflict-tolerant editing.",
    lessonsLearned: [
      "Multiplayer feels magical only when presence is instant and edits never fight.",
      "Separating ephemeral presence from durable storage keeps the canvas responsive.",
    ],
    nextSteps: ["Add comments and reactions", "Support board export", "Tighten mobile canvas gestures"],
    seo: {
      title: "UI Studio case study",
      description: "UI Studio real-time collaborative design canvas by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "实时协作设计画布，多人可以在同一块画板上同时绘制、排布与编辑。",
        problem:
          "设计工具往往要么是单人使用，要么过于笨重。UI Studio 探索一个共享画布能做到多轻量，同时仍能处理实时在线状态与并发编辑。",
        solution:
          "基于 Next.js 的画布，使用 Fabric.js 实现矢量编辑、Liveblocks 处理多人状态，让光标、选区和图形改动在协作者之间实时同步。",
      },
    },
  },
  {
    title: "AI Agent Toolkit",
    slug: "ai-agent-toolkit",
    shortPitch:
      "A Windows-first local AI coding toolkit — multi-agent workflows, Ollama automation, and developer dashboard utilities.",
    category: "ai-tool",
    year: "2026",
    status: "development",
    contentStatus: "ready",
    featured: false,
    problem:
      "Most AI coding tooling assumes the cloud and a Unix shell. This toolkit explores a local-first, Windows-native workflow for running and orchestrating models on your own machine.",
    solution:
      "A PowerShell-based toolkit that automates Ollama, coordinates multiple agents, and ships small dashboard utilities — keeping the loop local, scriptable, and Windows-friendly.",
    role: "Solo developer: tooling design, PowerShell automation, and agent orchestration.",
    stack: ["PowerShell", "Ollama", "Local LLMs", "Windows"],
    stackGroups: [
      { group: "Automation", items: ["PowerShell"] },
      { group: "Runtime", items: ["Ollama", "Local LLMs"] },
      { group: "Platform", items: ["Windows"] },
    ],
    tags: ["ai", "developer-tools", "local-llm", "automation"],
    features: [
      "Multi-agent workflow orchestration",
      "Ollama automation scripts",
      "Local-first, Windows-native setup",
      "Developer dashboard utilities",
    ],
    architectureNotes: [
      "Automation is scripted in PowerShell so it stays transparent and hackable.",
      "Agent coordination is kept separate from model-runtime concerns.",
    ],
    screenshots: [{ src: "/project-covers/ai-agent-toolkit.svg", alt: "AI Agent Toolkit terminal and agent graph cover" }],
    githubUrl: "https://github.com/zhenxiao-yu/ai-agent-tools",
    outcome:
      "A working local-first AI tooling experiment aimed at Windows developers.",
    lessonsLearned: [
      "Local-first AI tooling trades convenience for control and privacy.",
      "Windows-native developer tooling is underserved and worth designing for.",
    ],
    nextSteps: ["Document setup", "Add more agent recipes", "Publish usage examples"],
    seo: {
      title: "AI Agent Toolkit case study",
      description: "Windows-first local AI coding toolkit with multi-agent workflows by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "面向 Windows 的本地 AI 编程工具集——多智能体工作流、Ollama 自动化与开发者仪表盘工具。",
        problem:
          "大多数 AI 编程工具都默认运行在云端和 Unix 环境。这个工具集探索一种本地优先、面向 Windows 的工作流，在自己的机器上运行和编排模型。",
        solution:
          "基于 PowerShell 的工具集，自动化 Ollama、协调多个智能体，并提供小型仪表盘工具——让整个流程保持本地化、可脚本化且对 Windows 友好。",
      },
    },
  },
  {
    title: "M4rkdown",
    slug: "m4rkdown",
    shortPitch:
      "An offline-first markdown editor with realtime collaboration, PWA install, and a multiplayer typing arena.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "Most markdown editors assume a connection and a single writer. M4rkdown asks what an editor feels like when it works offline first and invites other people in.",
    solution:
      "A CodeMirror editing surface wrapped in a Preact + Vite PWA, with PartyKit powering realtime collaboration and a playful multiplayer typing mode layered on the same sync engine.",
    role: "Solo developer: editor UX, offline/PWA layer, realtime sync, and deployment.",
    stack: ["Preact", "TypeScript", "Vite", "CodeMirror", "PartyKit", "PWA"],
    stackGroups: [
      { group: "Frontend", items: ["Preact", "TypeScript", "Vite"] },
      { group: "Editor", items: ["CodeMirror"] },
      { group: "Realtime", items: ["PartyKit"] },
      { group: "Platform", items: ["PWA"] },
    ],
    tags: ["markdown", "editor", "realtime", "offline-first"],
    features: [
      "Offline-first writing that syncs on reconnect",
      "Live collaborative editing",
      "Installable PWA",
      "Multiplayer typing arena",
    ],
    architectureNotes: [
      "CodeMirror handles the editing model; PartyKit carries collaborative state.",
      "Service-worker caching keeps the editor usable with no network.",
    ],
    screenshots: [{ src: "/project-covers/m4rkdown.svg", alt: "M4rkdown split editor and preview cover" }],
    liveUrl: "https://m4rkdown.is-a.dev",
    githubUrl: "https://github.com/zhenxiao-yu/m4rkdown-editor",
    outcome:
      "A deployed offline-first editor that doubles as a multiplayer writing surface and a typing game.",
    lessonsLearned: [
      "Offline-first changes every assumption about state and conflict resolution.",
      "A small playful mode makes a utility memorable.",
    ],
    nextSteps: ["Add document history", "Expand export formats", "Polish conflict resolution"],
    seo: {
      title: "M4rkdown case study",
      description: "M4rkdown offline-first collaborative markdown editor by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "离线优先的 Markdown 编辑器，支持实时协作、PWA 安装，以及多人打字竞技模式。",
        problem:
          "大多数 Markdown 编辑器都默认联网且单人使用。M4rkdown 想探索一个离线优先、并且能邀请他人加入的编辑器会是什么体验。",
        solution:
          "以 CodeMirror 作为编辑核心，封装在 Preact + Vite 的 PWA 中，使用 PartyKit 实现实时协作，并在同一套同步引擎之上加入了趣味的多人打字模式。",
      },
    },
  },
] satisfies ProjectInput[];

export const allProjects = projects.map((project) => projectSchema.parse(project));
export const featuredProjects = allProjects.filter((project) => project.featured);

export function getProject(slug: string) {
  return allProjects.find((project) => project.slug === slug);
}
