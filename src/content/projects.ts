import type { z } from "zod";
import { projectSchema } from "./schemas";

type ProjectInput = z.input<typeof projectSchema>;

const projects = [
  {
    title: "Nimbus",
    slug: "nimbus",
    shortPitch:
      "A passwordless cloud workspace for organizing, sharing, beaming, and asking questions about your files.",
    why: "I wanted a place to put my own files that felt calm instead of like a settings panel — and the authentication flow was the part of product work I most wanted to actually get good at, not just wire up.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: true,
    problem:
      "Personal cloud storage is usually either a bare folder tree or a dense administration console. Both make routine actions such as finding, sharing, and understanding files feel heavier than they should.",
    solution:
      "Nimbus combines Appwrite-backed storage, magic-link OTP access, short-lived sharing, browser-to-browser WebRTC transfer, and an optional AI workspace in one calm dashboard. Core file management works without an AI key.",
    role: "Solo full-stack product engineer: product design, authentication, storage and sharing workflows, WebRTC transfer, AI integration, and deployment.",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Appwrite",
      "WebRTC",
      "Groq",
      "Tailwind CSS",
    ],
    stackGroups: [
      {
        group: "Product",
        items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"],
      },
      {
        group: "Platform",
        items: ["Appwrite Auth", "Appwrite Database", "Appwrite Storage"],
      },
      { group: "Transfer + AI", items: ["WebRTC", "Groq", "Claude Haiku 4.5"] },
    ],
    tags: ["cloud-storage", "passwordless", "webrtc", "ai-workspace"],
    timeline: "2024-2026 · v2.2",
    platforms: ["Responsive web", "Desktop-first dashboard"],
    features: [
      "Passwordless magic-link OTP authentication",
      "Drag-and-drop upload, folders, live search, sorting, and file classification",
      "Revocable sharing links and browser-to-browser Beam transfers",
      "Optional workspace summaries and file Q&A",
      "Storage usage analytics and responsive dashboard states",
    ],
    architectureNotes: [
      "Appwrite owns identity, metadata, and object storage; application helpers keep those service details out of the interface layer.",
      "Beam uses WebRTC and a four-digit pairing code, so transferred bytes do not pass through Nimbus storage.",
      "The AI workspace is capability-gated and disappears when no provider key is configured.",
      "Security headers, structured data, dynamic social images, analytics, and performance monitoring are part of the deployment surface.",
    ],
    decisions: [
      {
        title: "Transfer files without becoming the transfer server",
        context:
          "Large peer-to-peer transfers would consume storage and bandwidth while making Nimbus responsible for another copy of the file.",
        choice:
          "Use a four-digit pairing flow to establish a WebRTC connection and send bytes directly between browsers.",
        consequence:
          "Transfers avoid Nimbus storage, but pairing, NAT traversal, and reconnect states become visible product concerns.",
      },
      {
        title: "Keep AI optional instead of foundational",
        context:
          "File upload, organization, and sharing must remain dependable when no model key is configured or a provider is unavailable.",
        choice:
          "Capability-gate the AI workspace and keep the storage model independent from summaries and file Q&A.",
        consequence:
          "The core product degrades cleanly; AI feels additive, though it cannot simplify the underlying file workflows.",
      },
    ],
    challenges: [
      "Keeping upload, share, transfer, and AI states legible without turning the dashboard into an operations console.",
      "Designing WebRTC pairing and failure recovery around short-lived sessions and browser networking constraints.",
    ],
    screenshots: [
      {
        src: "/project-covers/nimbus-dashboard.webp",
        alt: "Nimbus landing page introducing its file workspace, AI assistant, and browser-to-browser transfer",
        width: 1440,
        height: 960,
      },
      {
        src: "/project-covers/nimbus-features.webp",
        alt: "Nimbus product feature section showing storage, sharing, Beam transfer, and AI capabilities",
        width: 1440,
        height: 1000,
        label: "Product surface",
        caption:
          "The public product tour explains the storage, sharing, Beam, and optional AI layers before account creation.",
      },
    ],
    liveUrl: "https://nimbus-storage-app.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/nimbus-storage-app",
    outcome:
      "A deployed v2.2 cloud workspace that goes beyond CRUD storage: passwordless access, revocable sharing, direct peer transfer, and optional AI assistance live behind one coherent product model.",
    lessonsLearned: [
      "Authentication copy matters as much as authentication mechanics.",
      "Storage products need visual hierarchy before they need decoration.",
    ],
    nextSteps: [
      "Add deeper file activity history",
      "Broaden Beam recovery states",
      "Publish the Appwrite data model",
    ],
    seo: {
      title: "Nimbus case study",
      description: "Nimbus secure file management app by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch: "围绕文件组织、OTP 访问和存储分析构建的安全文件管理平台。",
        why: "想给自己的文件找个看着舒服的地方，而不是又一个设置面板——而身份验证那一块，是我最想认真做好、而不只是接上能用的部分。",
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
      "A no-signup AI writing tool that generates, scores, edits, and shares platform-specific bios across eight models.",
    why: "I have rewritten my own bio about forty times and hated every version, so I built the thing that narrows the decision before the blank box gets a chance to.",
    category: "ai-tool",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: true,
    problem:
      "Short profile bios are deceptively hard because they compress tone, audience, context, and professional signal into a tiny space.",
    solution:
      "BioLoom turns a guided set of identity, audience, tone, length, and platform choices into four structured options. It streams typed output, scores drafts across five categories, supports inline revision, and falls back across Groq-hosted models and Gemini.",
    role: "Solo AI product engineer: product flow, prompt and schema design, multi-provider routing, scoring, interface design, and deployment.",
    stack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Vercel AI SDK 4",
      "Groq",
      "Gemini 2.0 Flash",
      "Zustand",
      "Tailwind CSS",
    ],
    stackGroups: [
      {
        group: "Product",
        items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"],
      },
      {
        group: "Generation",
        items: ["Vercel AI SDK 4", "Groq", "Gemini 2.0 Flash"],
      },
      { group: "Client state", items: ["Zustand", "localStorage"] },
    ],
    tags: ["generative-ai", "writing-tool", "multi-model", "no-signup"],
    timeline: "2024-2026",
    platforms: ["Responsive web", "No account required"],
    features: [
      "Four structured bios per generation with streaming presentation",
      "Eight selectable models across Groq and Gemini fallback",
      "Five platform presets, six tones, and granular length/temperature controls",
      "Five-part scoring, revision tips, inline editing, and regeneration",
      "Share links, text export, command palette, and local history",
    ],
    architectureNotes: [
      "The Vercel AI SDK streams schema-shaped results rather than unvalidated prose blobs.",
      "Provider selection and fallback are separated from the prompt surface, allowing the same UX to span eight models.",
      "History and preferences remain local through Zustand persistence; the core tool requires no account.",
    ],
    decisions: [
      {
        title: "Constrain generation before asking for prose",
        context:
          "A single open prompt produces bios that vary unpredictably in tone, length, and platform fit.",
        choice:
          "Collect platform, audience, tone, focus, length, temperature, and emoji preferences before generation.",
        consequence:
          "Output is more repeatable and editable, at the cost of a longer form than a one-click generator.",
      },
      {
        title: "Stream structured options, not one text blob",
        context:
          "Users need alternatives they can compare, score, and revise rather than a single answer they must accept or discard.",
        choice:
          "Use schema-shaped streaming to return four bios and route provider fallback behind the same result contract.",
        consequence:
          "The review experience becomes useful across models, while schema adherence and partial-stream handling add implementation complexity.",
      },
    ],
    challenges: [
      "Making model choice useful without forcing non-technical users to understand provider differences.",
      "Balancing creative variation with predictable length, tone, and platform limits.",
    ],
    screenshots: [
      {
        src: "/project-covers/bioloom-generator.webp",
        alt: "BioLoom generator with platform tabs, model counts, guided fields, and an output panel",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/bioloom-controls.webp",
        alt: "BioLoom lower generator controls for tone, audience, focus, and output settings",
        width: 1440,
        height: 1000,
        label: "Guided controls",
        caption:
          "The form narrows platform, tone, audience, focus, and output constraints before asking a model to write.",
      },
    ],
    liveUrl: "https://ai-bio-generator-steel.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/ai-bio-generator",
    outcome:
      "A deployed, no-signup writing utility with real model choice, structured output, scoring, history, editing, and sharing rather than a single prompt box.",
    lessonsLearned: [
      "Good AI tools narrow the decision space before generation.",
      "Small tools still need strong typography and empty states.",
    ],
    nextSteps: [
      "Add multilingual scoring examples",
      "Expose clearer model trade-offs",
      "Test accessibility with longer generated output",
    ],
    seo: {
      title: "BioLoom case study",
      description: "BioLoom AI bio generator by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "AI 辅助简介生成器，把零散的身份信息整理成适合不同平台的短文案。",
        why: "我自己的简介大概重写过四十遍，每一版都嫌弃，于是干脆做了个在空白框开口逼问之前、先帮你把选择缩小的工具。",
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
      "A free, no-key crypto dashboard with live prices, resilient public-data fallbacks, local portfolios, alerts, and comparison tools.",
    why: "I was tired of crypto dashboards that flash and pulse at you. I wanted one boring table I could actually read, so I made it.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: true,
    problem:
      "Crypto dashboards tend to drown users in motion, color, and unstable hierarchy. M4rketView focuses on comparison and scan speed.",
    solution:
      "M4rketView combines Binance WebSocket prices with public market, DeFi, chain, sentiment, and news sources. Watchlists, alerts, and portfolios stay in the browser, while query caching and source fallbacks keep the dashboard useful under rate limits.",
    role: "Solo frontend product engineer: data-source strategy, resilient fetching, financial interface design, client state, testing, and deployment.",
    stack: [
      "React 18",
      "TypeScript",
      "Vite 6",
      "TanStack Query",
      "Zustand",
      "Recharts",
      "Binance WebSocket",
      "Vitest",
    ],
    stackGroups: [
      {
        group: "Product",
        items: ["React 18", "TypeScript", "Vite 6", "Radix UI", "cmdk"],
      },
      {
        group: "Data",
        items: ["TanStack Query", "Zustand", "Binance WebSocket", "Recharts"],
      },
      { group: "Quality", items: ["Vitest", "145 tests", "strict TypeScript"] },
    ],
    tags: ["crypto", "data-dashboard", "local-first", "public-apis"],
    timeline: "2024-2026 · v1.3.2",
    platforms: ["Responsive web", "No account or API key"],
    features: [
      "Live Binance prices for 20 assets and market coverage for up to 250 coins",
      "Dashboard, markets, trending, compare, news, and treemap heatmap views",
      "Local-only watchlists, portfolios, price alerts, and preferences",
      "DeFi, chain, sentiment, and RSS data from multiple public providers",
      "Rate-limit-aware caching and provider failover",
    ],
    architectureNotes: [
      "CoinGecko is the primary broad-market source, with CoinPaprika and Binance fallbacks when requests fail or rate-limit.",
      "TanStack Query persists a 24-hour browser cache so stale-but-useful data can survive transient provider failures.",
      "Portfolio and watchlist data never leave localStorage; there is no backend, account system, or private API key.",
      "Data adapters normalize provider differences before values reach tables and charts.",
    ],
    decisions: [
      {
        title: "Treat API failure as normal operating state",
        context:
          "Free crypto providers disagree on schemas, rate limits, coverage, and availability.",
        choice:
          "Normalize providers behind adapters, add explicit fallbacks, and persist a 24-hour TanStack Query cache.",
        consequence:
          "The dashboard remains useful during partial outages, but freshness must be communicated instead of assuming every number is live.",
      },
      {
        title: "Keep personal finance data in the browser",
        context:
          "Watchlists and sample portfolios do not justify accounts, a database, or custody of user financial data.",
        choice:
          "Store portfolios, alerts, watchlists, and preferences locally with no backend identity layer.",
        consequence:
          "The app is private and frictionless, but cross-device sync and server-side alert delivery are deliberately absent.",
      },
    ],
    challenges: [
      "Public market APIs have different schemas, quotas, and outage behavior, so graceful degradation is a product requirement.",
      "Dense financial screens need visible freshness and error states without adding more visual noise.",
    ],
    screenshots: [
      {
        src: "/project-covers/m4rketview-dashboard.webp",
        alt: "M4rketView dashboard showing market cap, dominance, volume, sentiment, gainers, losers, and a heatmap",
        width: 1440,
        height: 960,
      },
      {
        src: "/project-covers/m4rketview-heatmap.webp",
        alt: "M4rketView 24-hour market heatmap sized by asset and colored by price movement",
        width: 1440,
        height: 1000,
        label: "Market heatmap",
        caption:
          "The treemap turns relative market size and 24-hour movement into a fast visual scan while preserving exact values.",
      },
    ],
    liveUrl: "https://m4rket-view.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/M4rketView",
    outcome:
      "A deployed v1.3.2 dashboard that remains free and accountless while handling live streams, public API limits, local portfolio state, and a broad set of comparison views.",
    lessonsLearned: [
      "Dense layouts need restraint, not extra animation.",
      "Financial interfaces should reveal state changes without shouting.",
    ],
    nextSteps: [
      "Surface per-widget source freshness",
      "Expand deterministic adapter tests",
      "Add import/export for local portfolios",
    ],
    seo: {
      title: "M4rketView case study",
      description: "M4rketView cryptocurrency screener by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "为快速浏览、自选观察和行情表格清晰度设计的加密货币筛选工具。",
        why: "受够了那些一直闪、一直跳的加密货币面板。我只想要一张能好好看的、无聊的表格，于是自己做了一张。",
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
    stack: [
      "Next.js",
      "React 19",
      "TypeScript",
      "Supabase",
      "TensorFlow.js",
      "Konva",
      "Tailwind CSS",
      "Zod",
    ],
    stackGroups: [
      {
        group: "Frontend",
        items: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Konva"],
      },
      { group: "Backend", items: ["Supabase", "Zod"] },
      { group: "ML", items: ["TensorFlow.js"] },
    ],
    tags: ["planning", "local-first", "gardening", "deterministic"],
    timeline: "2026 · active development",
    platforms: ["Responsive web", "Local-first planning"],
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
    decisions: [
      {
        title: "Make the planner deterministic before adding AI",
        context:
          "Material quantities, sequencing, and regional suitability cannot depend on a model improvising plausible advice.",
        choice:
          "Let a rules-based engine own the plan and restrict Claude to rephrasing facts that are already set.",
        consequence:
          "Plans remain inspectable and work without AI, while expanding capability requires catalog and rule work rather than prompt changes.",
      },
      {
        title: "Represent uncertainty instead of hiding it",
        context:
          "Users may not have measurements, retailer inventory changes, and Ontario-first data does not generalize everywhere.",
        choice:
          "Return ranges, confidence labels, sources, last-checked dates, and explicit verify-before-buying notes.",
        consequence:
          "The output is less magically precise but more trustworthy and actionable.",
      },
    ],
    challenges: [
      "Producing useful material ranges when users have not measured their yard without disguising uncertainty as precision.",
      "Keeping AI, live-data adapters, and optional cloud sync additive so the core planner still works when every external service is absent.",
      "The current catalog is Ontario-first; recommendations outside that region need broader data before they can claim the same grounding.",
    ],
    screenshots: [
      {
        src: "/project-covers/bloomprint-home.webp",
        alt: "Bloomprint home page offering buildable yard plans for real homes",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/bloomprint-planner.webp",
        alt: "Bloomprint deterministic planning progress showing intake, plant scoring, material sizing, and risk checks",
        width: 1440,
        height: 1000,
        label: "Planning engine",
        caption:
          "The demo exposes the deterministic stages before the result: intake, regional scoring, quantities, risk checks, and packaging.",
      },
    ],
    liveUrl: "https://bloomprint.online",
    githubUrl: "https://github.com/zhenxiao-yu/Bloomprint",
    outcome:
      "A working local-first planning app live at bloomprint.online that chooses honest grounding — sourced facts, confidence tags, price ranges — over confident AI guesswork.",
    lessonsLearned: [
      "Deterministic-first earns trust a chatbot-first tool can't.",
      "Honest hedging — ranges, 'verify before buying' — reads as more credible than false precision.",
      "Local-first changes every assumption about state, sync, and failure.",
    ],
    nextSteps: [
      "Expand the catalog beyond Ontario",
      "Connect and evaluate live-data providers",
      "Add collaborative plan review",
    ],
    seo: {
      title: "Bloomprint case study",
      description:
        "Bloomprint turns yard inspiration into a buildable, honestly-grounded plan. By ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "把庭院灵感变成可执行的方案——买什么、买多少、需要哪些工具、按什么顺序、可能会出什么问题。",
        problem:
          "改造庭院让人无从下手：一张灵感照片说不清材料、数量、工具和步骤，也说不清哪里会出错——而多数工具只会像聊天机器人一样给出自信的猜测。",
        solution:
          "这是一个结构化的规划应用，而不是聊天机器人：确定性引擎才是真正的依据，完全离线、无需 AI 密钥和照片也能工作——AI 只负责润色已生成的方案。每份方案都基于区域化目录（以安大略为先）、价格区间而非虚假精确价、在未测量时自动放宽的用料计算，以及分阶段的操作指南。",
      },
    },
  },
  {
    title: "PolitiLens",
    slug: "politilens",
    shortPitch:
      "A political news intelligence dashboard for comparing how outlets across the spectrum frame the same story.",
    why: "I wanted a way to read political coverage without pretending a single score could tell me who was right. The useful question was narrower: what changes when the same event moves across different editorial lenses?",
    category: "web-app",
    year: "2026",
    status: "ready",
    contentStatus: "ready",
    featured: true,
    problem:
      "Political news is abundant but comparison is expensive. Readers have to find parallel coverage manually, infer editorial positioning, and separate factual overlap from framing differences.",
    solution:
      "PolitiLens aggregates coverage from dozens of international outlets, clusters articles about the same event, and presents divergence, sentiment, source health, political-compass placement, and AI-assisted framing analysis with its methodology and limitations kept visible.",
    role: "Solo product engineer: research model, data pipeline, dashboard architecture, information design, internationalization, and deployment.",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "TanStack Query",
      "Zustand",
      "Vercel AI SDK",
      "OpenRouter",
      "Tailwind CSS",
      "Recharts",
      "Zod",
    ],
    stackGroups: [
      {
        group: "Product",
        items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"],
      },
      {
        group: "Data",
        items: ["TanStack Query", "Zustand", "RSS", "GDELT", "Congress.gov"],
      },
      {
        group: "Analysis",
        items: ["Vercel AI SDK", "OpenRouter", "AFINN", "compromise"],
      },
      { group: "Visualization", items: ["Recharts", "react-simple-maps"] },
    ],
    tags: ["news", "media-literacy", "research-tool", "data-visualization"],
    timeline: "May 2026 · v1.1.0",
    platforms: ["Web", "Responsive dashboard"],
    features: [
      "Story clustering across politically diverse outlets",
      "Two-axis political compass with regional filtering",
      "Divergence and sentiment signals with confidence context",
      "AI-assisted framing comparison and consensus extraction",
      "Congress, fact-check, source-health, and world-coverage views",
      "Complete English and Simplified Chinese interface",
    ],
    architectureNotes: [
      "RSS and API articles normalize into one model before URL deduplication and similarity clustering.",
      "Divergence is a transparent heuristic based on source breadth, spectrum coverage, and region rather than a claim about truth.",
      "Expensive news aggregation routes use bounded concurrency, caching, and stale-while-revalidate behavior.",
      "AI analysis is downstream of deterministic clustering and presents framing differences without assigning factual authority.",
    ],
    decisions: [
      {
        title: "Measure divergence without calling it truth",
        context:
          "Political framing is multidimensional, and a single bias score can imply certainty the system does not possess.",
        choice:
          "Compute a documented heuristic from source breadth, spectrum coverage, and region, then show its method and confidence context.",
        consequence:
          "The signal supports comparison without judging factual correctness, but readers must still inspect the underlying coverage.",
      },
      {
        title: "Cluster deterministically before invoking AI",
        context:
          "Letting a model decide which articles belong together would make the core research unit difficult to reproduce or challenge.",
        choice:
          "Normalize, deduplicate, and similarity-cluster articles first; use AI only to describe framing and consensus inside an established cluster.",
        consequence:
          "The pipeline stays inspectable and cheaper, while deterministic clustering errors remain visible instead of being hidden by fluent summaries.",
      },
    ],
    challenges: [
      "Keeping politically sensitive scores explainable enough that users can challenge the method.",
      "Handling unreliable feeds and uneven source coverage without hiding degraded data.",
      "Making a dense research interface scan quickly on both desktop and mobile.",
    ],
    screenshots: [
      {
        src: "/project-covers/politilens-dashboard.webp",
        alt: "PolitiLens political compass dashboard comparing news outlets and story clusters",
        width: 1600,
        height: 1000,
        label: "Compass",
        caption:
          "The primary research view maps outlets across economic and social axes while keeping the active story clusters visible.",
      },
      {
        src: "/project-covers/politilens-stories.webp",
        alt: "PolitiLens story explorer with divergence filters and clustered political news",
        width: 1600,
        height: 1000,
        label: "Story explorer",
        caption:
          "Clustered stories expose source breadth, political lean coverage, sentiment, and divergence before the reader opens a comparison.",
      },
    ],
    liveUrl: "https://politilens-plum.vercel.app",
    outcome:
      "A deployed v1.1 research product that turns a noisy news stream into a transparent comparison workflow without presenting its heuristics as objective truth.",
    lessonsLearned: [
      "Trust comes from showing how a score was produced, not polishing away its uncertainty.",
      "Dense dashboards need progressive disclosure so methodology remains available without blocking the first scan.",
      "AI is more credible when it describes differences after deterministic grouping instead of deciding the groups itself.",
    ],
    nextSteps: [
      "Ground framing summaries in cited article excerpts",
      "Improve entity-aware story clustering",
      "Add timeline views for how coverage changes across a news cycle",
    ],
    seo: {
      title: "PolitiLens political news intelligence case study",
      description:
        "PolitiLens compares political news framing across the spectrum with transparent clustering, divergence, and methodology.",
    },
    translations: {
      zh: {
        shortPitch: "政治新闻情报面板，用来比较不同立场媒体如何报道同一事件。",
        why: "我想做一个不靠单一分数替读者判断对错的政治新闻工具。更有价值的问题其实更窄：同一件事经过不同编辑视角时，哪些部分发生了变化？",
        problem:
          "政治新闻数量庞大，但横向比较成本很高。读者需要手动寻找平行报道、判断媒体位置，并区分共同事实与叙事差异。",
        solution:
          "PolitiLens 汇集不同政治光谱与地区的媒体报道，将同一事件聚类，并展示分歧度、语气、来源健康度、政治罗盘位置与 AI 辅助的叙事分析，同时公开方法与局限。",
        outcome:
          "一个已部署的 v1.1 研究产品，把嘈杂的新闻流整理成透明的比较流程，同时明确说明启发式指标并不等同于客观真相。",
      },
    },
  },
  {
    title: "Purecreate",
    slug: "purecreate",
    shortPitch:
      "A 3D apparel customizer that designs your shirt in real time and generates decals from a text prompt with DALL·E 3.",
    why: "Half curiosity about putting a real-time 3D scene next to an image model, half an excuse to fold an old two-server monorepo into one app I could deploy without thinking about it.",
    category: "ai-tool",
    year: "2024",
    status: "maintenance",
    contentStatus: "ready",
    featured: false,
    problem:
      "Designing custom apparel usually means clunky mockup tools or a slow back-and-forth with a designer — there's no fast, visual way to see an idea on the product and iterate.",
    solution:
      "A single Next.js app pairing a real-time react-three-fiber 3D garment canvas with DALL·E 3 decal generation: pick colors, type a prompt, and watch the design appear on a rotating shirt. It consolidates an older Vite + Express monorepo into one deployable app, with the OpenAI calls living in Route Handlers instead of a separate server.",
    role: "Solo developer: original customizer, 3D canvas, AI image route, reactive state, and the Vite/Express-to-Next.js migration.",
    stack: [
      "Next.js 15",
      "React 18.3",
      "react-three-fiber",
      "three.js",
      "Valtio",
      "OpenAI DALL·E 3",
      "Tailwind CSS 3.4",
    ],
    stackGroups: [
      {
        group: "Frontend",
        items: ["Next.js 15", "React 18.3", "Tailwind CSS 3.4"],
      },
      { group: "3D", items: ["react-three-fiber", "three.js", "Valtio"] },
      {
        group: "AI + API",
        items: ["OpenAI DALL·E 3", "Next.js Route Handlers"],
      },
    ],
    tags: ["3d", "ai", "image-generation", "customizer"],
    timeline: "2024 · Next.js migration in 2026",
    platforms: ["Desktop web prototype", "WebGL"],
    features: [
      "Real-time 3D garment customizer (react-three-fiber)",
      "AI decal generation from a text prompt (DALL·E 3)",
      "Live color and texture controls",
      "Single deployable Next.js app — OpenAI in Route Handlers",
    ],
    architectureNotes: [
      "The 3D scene is dynamically imported (ssr: false) so heavy WebGL never blocks first paint.",
      "OpenAI calls live in a Node.js Route Handler with a server-only key and a 60-second duration budget.",
      "Valtio holds reactive design state shared between the UI and the 3D scene.",
      "Moving the API and canvas under one origin removed the old Express server and its CORS boundary.",
    ],
    decisions: [
      {
        title: "Collapse two deployments into one application",
        context:
          "The original Vite frontend and Express image API required separate hosting, environment wiring, and CORS configuration.",
        choice:
          "Move the image endpoint into a Next.js Node Route Handler and keep the OpenAI key server-side.",
        consequence:
          "Deployment and same-origin requests are simpler, but the image route inherits serverless duration and provider-latency limits.",
      },
      {
        title: "Keep WebGL outside server rendering",
        context:
          "Three.js and its renderer depend on browser globals and add substantial client work.",
        choice:
          "Dynamically import the canvas with server rendering disabled while the rest of the application uses the App Router.",
        consequence:
          "The page shell can render independently, but the current renderer compatibility regression still has to be repaired before the demo is healthy.",
      },
    ],
    challenges: [
      "three.js touches browser globals, so the canvas must stay outside server rendering.",
      "The current public deployment is behind a Vercel security checkpoint, and a clean local install exposes a React renderer compatibility regression; the source is available, but the demo should not be presented as healthy.",
    ],
    screenshots: [
      {
        src: "/project-covers/purecreate-source.webp",
        alt: "Purecreate repository documentation describing the Next.js 15 migration and 3D application stack",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/purecreate-texture.webp",
        alt: "Black and cream contour texture shipped as a decal asset in Purecreate",
        width: 630,
        height: 630,
        label: "Source asset",
        caption:
          "An original texture from the customizer's public asset library, used to test live material and decal changes on the garment.",
      },
    ],
    githubUrl: "https://github.com/zhenxiao-yu/Purecreate-Demo",
    outcome:
      "A source-available 3D and AI product prototype plus a completed architectural migration from a Vite/Express split deployment to a single Next.js application. The present demo still needs compatibility repair.",
    lessonsLearned: [
      "Dynamically importing the 3D scene keeps a heavy WebGL app fast to first paint.",
      "Collapsing a frontend + API monorepo into one Next.js app removes a whole deploy surface.",
    ],
    nextSteps: [
      "Repair the current renderer compatibility regression",
      "Restore a publicly accessible demo",
      "Add saved designs and more garment types",
    ],
    seo: {
      title: "Purecreate case study",
      description:
        "Purecreate 3D apparel customizer with DALL·E 3 decal generation by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "一个 3D 服装定制器，实时设计你的 T 恤，并通过 DALL·E 3 根据文字提示生成图案。",
        why: "一半是好奇把实时 3D 场景和图像模型放在一起会怎样，一半是给自己找个借口，把一个旧的双服务器仓库塞进一个能随手部署的应用里。",
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
      "A single-player Unreal Engine 4 systems prototype covering stance, looting, equipment, inventory, weapons, and scopes.",
    category: "game-dev",
    year: "2021",
    status: "archived",
    contentStatus: "ready",
    featured: false,
    problem:
      "The goal was to learn how a PUBG-like character and equipment loop is assembled in Unreal: locomotion states, world pickups, drag-and-drop inventory, weapon slots, ammunition, and scoped aiming.",
    solution:
      "Built in Unreal Engine 4.26.2 with Blueprint visual scripting, the prototype connects stand/crouch/prone movement, item data, loot interaction, equipment slots, weapon handling, and a scoped combat view. It is explicitly a single-player learning project, not a multiplayer battle royale.",
    role: "Solo developer: gameplay systems, Blueprint scripting, and integration.",
    stack: ["Unreal Engine 4.26.2", "Blueprints", "UMG", "Marketplace assets"],
    stackGroups: [
      { group: "Engine", items: ["Unreal Engine 4.26.2", "UMG"] },
      { group: "Gameplay", items: ["Blueprints", "Data-driven items"] },
      { group: "Content", items: ["Marketplace assets"] },
    ],
    tags: ["battle-royale", "unreal-engine", "gamedev"],
    timeline: "May 2021 · archived prototype",
    platforms: ["Windows", "Unreal Editor"],
    features: [
      "Stand, crouch, and prone locomotion states",
      "World loot, equipment, and drag-and-drop inventory",
      "Weapon slots, ammunition, attachments, and scoped aiming",
      "Blueprint-driven item and character systems",
    ],
    architectureNotes: [
      "Item definitions and inventory behavior are separated so world pickups can move into equipment and weapon slots without one monolithic graph.",
      "Pose-state logic coordinates locomotion and animation changes across standing, crouched, and prone modes.",
      "The repository documents both Blueprint graphs and in-engine results, making the learning process inspectable.",
    ],
    decisions: [
      {
        title: "Prototype systems in Blueprints first",
        context:
          "The learning goal was rapid iteration across inventory, equipment, stance, animation, and weapons rather than shipping a production multiplayer game.",
        choice:
          "Build the gameplay loop primarily with Blueprint components and document the graphs alongside in-engine results.",
        consequence:
          "Iteration stayed visual and fast, but graph ownership and readability became the scaling limit.",
      },
      {
        title: "Stop at a single-player systems study",
        context:
          "Replication and authoritative multiplayer would multiply the scope before the core inventory and weapon interactions were understood.",
        choice:
          "Exclude networking, match flow, and safe-zone systems and describe the prototype accurately.",
        consequence:
          "The repository is useful as a focused reference, not a claim of a complete battle-royale implementation.",
      },
    ],
    challenges: [
      "Keeping Blueprint ownership readable as inventory, equipment, animation, and weapon state begin to overlap.",
      "Third-party assets limit redistribution; this repository is a learning reference rather than a packaged commercial release.",
      "Multiplayer, replication, match flow, and a shrinking safe zone were not implemented.",
    ],
    screenshots: [
      {
        src: "/project-covers/unreal-inventory.webp",
        alt: "Unreal Engine prototype inventory with vicinity loot, backpack items, equipment slots, and two weapons",
        width: 1600,
        height: 928,
      },
      {
        src: "/project-covers/unreal-blueprint.webp",
        alt: "Blueprint graph from the Unreal battle royale systems prototype",
        width: 1600,
        height: 1163,
        label: "Blueprint logic",
        caption:
          "The public repository documents the visual scripting behind item, inventory, and character behavior.",
      },
      {
        src: "/project-covers/unreal-command-center.webp",
        alt: "Third-person gameplay scene inside the Unreal Engine prototype",
        width: 1600,
        height: 928,
        label: "Gameplay scene",
        caption:
          "A playable editor scene used to integrate locomotion, pickups, equipment, and weapon handling.",
      },
    ],
    githubUrl: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
    outcome:
      "An archived but substantial single-player UE4 systems study. Its repository has attracted 11 stars and 11 forks while remaining clear about the absence of multiplayer and its asset-license limits.",
    lessonsLearned: [
      "Blueprints are great for iteration but need discipline to stay readable.",
      "Even a prototype benefits from componentized, decoupled systems.",
    ],
    nextSteps: [
      "Preserve the architecture notes",
      "Package a license-safe sample",
      "Treat replication as a separate future study",
    ],
    seo: {
      title: "Unreal Battle Royale Prototype case study",
      description:
        "UE4 battle-royale prototype with inventory and weapon systems by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "使用 UE4 与蓝图打造的大逃杀原型——包含背包、武器操作与核心对局系统。",
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
      "A published Unity WebGL dungeon shooter with procedural floors, sanity pressure, classes, bosses, loot, and fast-travel exploration.",
    why: "I wanted to know how roguelikes feel from the inside, and the only honest way to find out was to ship a rough one to itch.io and let strangers tell me where it hurt.",
    category: "game-dev",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "This university team project explored how procedural dungeon structure, combat readability, navigation, and psychological pressure can reinforce one another inside a compact 2D action game.",
    solution:
      "The four-person team built five escalating procedural levels with class selection, ranged combat, loot, bosses, a sanity system, minimap fast travel, and A*-based enemy line-of-sight behavior, then published a WebGL v1.0.2 build on itch.io.",
    role: "Four-person university game-development project; contributor to the shared Unity/C# implementation, integration, testing, and published build.",
    stack: ["Unity 2022.3.9f1 LTS", "C#", "URP", "WebGL", "itch.io"],
    stackGroups: [
      { group: "Engine", items: ["Unity 2022.3.9f1 LTS", "C#", "URP"] },
      {
        group: "Systems",
        items: ["Procedural generation", "A* pathfinding", "Scriptable data"],
      },
      { group: "Release", items: ["WebGL", "Windows", "itch.io"] },
    ],
    tags: ["roguelike", "2d", "pixel", "gamedev"],
    timeline: "2024 · v1.0.2 university team project",
    platforms: ["WebGL", "Windows build"],
    features: [
      "Procedural dungeon progression across five levels",
      "Three playable classes, ranged weapons, loot, and bosses",
      "Sanity mechanic that adds pressure beyond health",
      "Minimap fast travel and A*-based enemy line of sight",
      "Playable WebGL release on itch.io",
    ],
    architectureNotes: [
      "Roughly 150 C# scripts divide movement, combat, dungeon generation, enemies, UI, audio, and interactive props.",
      "Procedural rooms and difficulty scaling build a repeatable five-floor run structure.",
      "Navigation combines a minimap travel layer for players with A* and visibility checks for enemies.",
    ],
    decisions: [
      {
        title: "Use five escalating floors as the run spine",
        context:
          "Procedural rooms need a readable sense of progression rather than endless random encounters.",
        choice:
          "Organize generation, difficulty, loot, and bosses into a fixed five-level escalation.",
        consequence:
          "Runs gain a clear arc, while balancing each floor across three classes becomes a larger tuning problem.",
      },
      {
        title: "Add sanity as a second pressure system",
        context:
          "Health alone did not express the psychological-horror theme or create enough pressure between fights.",
        choice:
          "Track sanity alongside combat state and connect it to exploration and survival.",
        consequence:
          "The game gains thematic tension, but players must understand two failure pressures through a compact HUD.",
      },
    ],
    challenges: [
      "Integrating many shared Unity systems across a four-person student team without losing a playable build.",
      "Balancing procedural layouts, sanity, enemy pressure, and class differences across five floors.",
      "Third-party art and audio licenses make this a published educational prototype, not a commercial asset package.",
    ],
    screenshots: [
      {
        src: "/project-covers/descent-gameplay.webp",
        alt: "Descent Into Madness gameplay showing a player firing through a procedural dungeon room",
        width: 1090,
        height: 573,
      },
      {
        src: "/project-covers/descent-class-select.webp",
        alt: "Descent Into Madness class selection screen",
        width: 1600,
        height: 897,
        label: "Class selection",
        caption:
          "Three starting classes change the player's combat profile before entering the dungeon.",
      },
      {
        src: "/project-covers/descent-dungeon.webp",
        alt: "Descent Into Madness dungeon gameplay with enemies, loot, and interface elements",
        width: 1600,
        height: 895,
        label: "Dungeon run",
        caption:
          "The released build combines procedural rooms, ranged combat, sanity pressure, loot, and minimap navigation.",
      },
    ],
    liveUrl: "https://markyu615.itch.io/descent-into-madness",
    githubUrl: "https://github.com/zhenxiao-yu/Descent-In-To-Madness",
    outcome:
      "A playable v1.0.2 WebGL prototype shipped by a four-person university team, with the complete Unity source published for inspection.",
    lessonsLearned: [
      "Roguelike tension comes from pacing, not just enemy count.",
      "Shipping a build to itch.io forces real finish work a repo never demands.",
    ],
    nextSteps: [
      "Preserve the WebGL build",
      "Document individual system ownership",
      "Archive third-party asset attributions",
    ],
    seo: {
      title: "Descent Into Madness case study",
      description:
        "Descent Into Madness 2D pixel roguelike shooter by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "用 Unity 制作的 2D 像素风 Roguelike 射击游戏——不断深入、战斗，并在逐步升级的关卡中生存。",
        why: "想从内部搞懂 Roguelike 到底是什么手感，而最诚实的办法，就是先做一个粗糙的版本丢上 itch.io，让陌生人告诉我哪里不对劲。",
        problem:
          "一个聚焦的原型，用来学习 Roguelike 的核心循环：程序化的压力、以局为单位的成长，以及像素风格下利落的射击手感。",
        solution:
          "使用 Unity 2022.3 与 C# 开发，将像素风战斗与逐步升级的 Roguelike 结构结合，并在 itch.io 上发布了可游玩的版本。",
        role: "四人大学游戏开发项目；参与共享的 Unity/C# 实现、整合、测试与发布。",
      },
    },
  },
  {
    title: "UI Studio",
    slug: "ui-studio",
    shortPitch:
      "A no-login multiplayer design canvas with shared objects, cursors, comments, undo history, and exportable room URLs.",
    why: "Multiplayer always felt like sorcery to me, so I built the smallest shared canvas I could and watched the other cursors move until it stopped feeling like magic.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "Design tools tend to be either single-player or heavyweight. UI Studio explores how light a shared canvas can feel while still handling live presence and concurrent edits.",
    solution:
      "UI Studio pairs Fabric.js object editing with Liveblocks storage, presence, comments, and history. A shared URL opens the same room, where collaborators can draw, arrange layers, chat through cursors, comment, undo, and export without creating an account.",
    role: "Solo developer: canvas architecture, multiplayer state, interface, and deployment.",
    stack: [
      "Next.js 14",
      "TypeScript",
      "Fabric.js 5",
      "Liveblocks",
      "Tailwind CSS",
      "jsPDF",
    ],
    stackGroups: [
      { group: "Product", items: ["Next.js 14", "TypeScript", "Tailwind CSS"] },
      { group: "Canvas", items: ["Fabric.js 5", "Layers", "Inspector"] },
      {
        group: "Realtime",
        items: ["Liveblocks Storage", "Presence", "Comments", "History"],
      },
      { group: "Export", items: ["PNG", "PDF", "JSON", "jsPDF"] },
    ],
    tags: ["realtime", "collaboration", "design-tool"],
    timeline: "2024-2026",
    platforms: ["Desktop editor", "Mobile read-only viewer"],
    features: [
      "No-login room URLs with active-user presence and live cursors",
      "Shapes, text, images, multi-select, alignment, ordering, and layers",
      "Cursor chat, emoji reactions, and pinned comments",
      "Shared undo/redo and visible connection state",
      "PNG/PDF/JSON export plus JSON import",
      "Pan and zoom from 20% to 400% with a mobile read-only view",
    ],
    architectureNotes: [
      "Fabric.js owns the canvas object model; Liveblocks owns the shared state.",
      "Ephemeral cursor and user presence is separated from durable room storage and comment threads.",
      "Shared history keeps undo/redo collaborative instead of treating every browser as an isolated editor.",
      "Unique room identifiers make collaboration link-first and remove an authentication step from the prototype.",
    ],
    decisions: [
      {
        title: "Separate durable objects from ephemeral presence",
        context:
          "Canvas objects and comments must persist, while cursors, selection, and active-user state update too frequently for the same storage path.",
        choice:
          "Use Liveblocks storage for durable room data and presence for transient collaboration signals.",
        consequence:
          "Cursor feedback stays responsive, but synchronization code must coordinate two kinds of shared state.",
      },
      {
        title: "Make rooms link-first and account-free",
        context:
          "Authentication would add friction before the multiplayer canvas proved useful.",
        choice:
          "Generate a unique room URL and let collaborators enter directly.",
        consequence:
          "Sharing is immediate, but ownership, discovery, and access control remain intentionally limited.",
      },
    ],
    challenges: [
      "Synchronizing Fabric object mutations with durable multiplayer storage without creating feedback loops.",
      "The mobile experience is intentionally read-only; the full editor is designed for pointer-and-keyboard input.",
      "Automated headless verification reached the deployed room URL but did not render the canvas surface, so the case study does not claim cross-browser coverage beyond the documented implementation.",
    ],
    screenshots: [
      {
        src: "/project-covers/ui-studio-home.webp",
        alt: "UI Studio home screen offering a new shareable collaborative board",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/ui-studio-features.webp",
        alt: "UI Studio repository documentation listing canvas, collaboration, and export capabilities",
        width: 1440,
        height: 1000,
        label: "Documented scope",
        caption:
          "The public repository documents the shipped room, canvas, presence, comments, history, layer, and export systems.",
      },
    ],
    liveUrl: "https://ui-studio-mu.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/ui-studio",
    outcome:
      "A deployed, source-available multiplayer canvas with a notably broad prototype surface: presence, comments, shared history, layers, inspector tools, and three export formats.",
    lessonsLearned: [
      "Multiplayer feels magical only when presence is instant and edits never fight.",
      "Separating ephemeral presence from durable storage keeps the canvas responsive.",
    ],
    nextSteps: [
      "Restore reliable automated canvas rendering",
      "Add focused multiplayer integration tests",
      "Decide whether mobile editing belongs in scope",
    ],
    seo: {
      title: "UI Studio case study",
      description:
        "UI Studio real-time collaborative design canvas by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "实时协作设计画布，多人可以在同一块画板上同时绘制、排布与编辑。",
        why: "多人协作在我看来一直像某种魔法，所以我做了一个能做到的最小的共享画布，盯着别人的光标移动，直到它不再像魔法为止。",
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
      "A personal Windows-first toolkit for local AI coding: PowerShell automation, Ollama, a Streamlit control center, and conservative repo workers.",
    category: "ai-tool",
    year: "2026",
    status: "development",
    contentStatus: "ready",
    featured: false,
    problem:
      "Many AI coding workflows assume paid cloud access, Unix tooling, and permissive automation. This project asks what a local fallback looks like on a real Windows workstation when control and review matter more than autonomy.",
    solution:
      "Around 55 PowerShell scripts inspect and bootstrap the machine, manage Ollama, run health checks, schedule jobs, and launch one-task repo workers. A modular Streamlit dashboard surfaces status and reports, while six sequential role prompts produce advisory plans without editing files.",
    role: "Solo developer: Windows automation, safety model, local-model workflow, Streamlit dashboard, documentation, and release packaging.",
    stack: [
      "PowerShell",
      "Python",
      "Streamlit",
      "Ollama",
      "Aider",
      "GitHub CLI",
      "Windows",
    ],
    stackGroups: [
      {
        group: "Automation",
        items: ["PowerShell 5.1/7", "Windows Task Scheduler", "GitHub CLI"],
      },
      { group: "Local AI", items: ["Ollama", "qwen2.5-coder:14b", "Aider"] },
      { group: "Control surface", items: ["Python", "Streamlit"] },
      { group: "Platform", items: ["Windows 10/11", "VS Code", "Cline"] },
    ],
    tags: ["ai", "developer-tools", "local-llm", "automation"],
    timeline: "2026 · experimental v1.1.0",
    platforms: ["Windows 10/11", "Localhost dashboard"],
    features: [
      "Ordered inspect/install/model/validation bootstrap scripts",
      "Ollama lifecycle, model checks, diagnostics, and provider routing",
      "Streamlit dashboard with eight operational pages",
      "Conservative one-task repo worker that branches, validates, reports, and stops",
      "Six-role advisory pipeline that never edits the target repository",
      "Explicit safeguards against dirty worktrees, secrets, commits, and pushes",
    ],
    architectureNotes: [
      "Automation is scripted in PowerShell so it stays transparent and hackable.",
      "The repo worker delegates edits to Aider but wraps it in preflight checks, isolated branches, validation, risk scanning, and reports.",
      "The six-role pipeline is advisory: it passes repository context through Product, Tech Lead, Developer, QA, Reviewer, and DevOps prompts without changing files.",
      "The dashboard is split into config, data, services, pages, and UI modules rather than one Streamlit script.",
    ],
    decisions: [
      {
        title: "Wrap model automation in a conservative worker",
        context:
          "A local model can edit quickly, but unattended commits, dirty worktrees, and sensitive-file changes create unacceptable risk.",
        choice:
          "Require a clean repo, create an isolated branch, run one task, validate, flag risky files, report, and stop without committing or pushing.",
        consequence:
          "Automation is slower and deliberately human-gated, but its output remains reviewable and recoverable.",
      },
      {
        title: "Keep the six-role pipeline advisory",
        context:
          "Multiple role prompts are useful for planning and review but can compound mistakes if each is allowed to mutate the repo.",
        choice:
          "Pass repository context through six sequential roles that only write a combined report.",
        consequence:
          "The pipeline improves perspective without edit conflicts, though a human still has to turn advice into code.",
      },
    ],
    challenges: [
      "This is a personal toolkit shaped around one machine, not a general-purpose agent platform.",
      "Most scripts assume a C:\\ai-agent-tools installation path and depend on locally installed Windows tooling and hardware.",
      "Local models provide continuity and privacy, but they do not match the capability or convenience of every paid model.",
    ],
    screenshots: [
      {
        src: "/project-covers/ai-agent-overview.webp",
        alt: "AI Agent Tools repository overview identifying it as an experimental Windows-first local AI toolkit",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/ai-agent-toolkit.webp",
        alt: "AI Agent Tools documentation describing its PowerShell scripts, Streamlit dashboard, and advisory prompts",
        width: 1440,
        height: 1000,
        label: "Toolkit map",
        caption:
          "The public documentation separates machine automation, the dashboard, conservative repo workers, and advisory role prompts.",
      },
    ],
    githubUrl: "https://github.com/zhenxiao-yu/ai-agent-tools",
    outcome:
      "A released v1.1.0 personal toolkit with documented setup, safety boundaries, diagnostics, dashboard modules, and repeatable local-model workflows. It is useful as a reference, not advertised as a polished cross-platform product.",
    lessonsLearned: [
      "Local-first AI tooling trades convenience for control and privacy.",
      "Windows-native developer tooling is underserved and worth designing for.",
    ],
    nextSteps: [
      "Remove hard-coded installation assumptions",
      "Add repeatable integration tests for worker safety",
      "Publish measured local-model comparisons",
    ],
    seo: {
      title: "AI Agent Toolkit case study",
      description:
        "Windows-first local AI coding toolkit with multi-agent workflows by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "面向 Windows 的本地 AI 编程工具集——多智能体工作流、Ollama 自动化与开发者仪表盘工具。",
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
      "A v3.1 offline-first Markdown workspace with advanced preview, local documents, collaboration, and an eight-player typing arena.",
    why: "I write in markdown constantly and resent every editor that gives up the moment the wifi does. The multiplayer typing game was just me refusing to stop once it worked offline.",
    category: "web-app",
    year: "2024",
    status: "ready",
    contentStatus: "ready",
    featured: false,
    problem:
      "Most markdown editors assume a connection and a single writer. M4rkdown asks what an editor feels like when it works offline first and invites other people in.",
    solution:
      "M4rkdown combines CodeMirror 6, local document tabs, rich Markdown preview, templates, export, and PWA caching in a Preact app. PartyKit adds collaborative writing and a separate typing battle with solo challenges, multiplayer rooms, XP, and reconnect recovery.",
    role: "Solo developer: editor UX, offline/PWA layer, realtime sync, and deployment.",
    stack: [
      "Preact 10",
      "TypeScript",
      "Vite",
      "CodeMirror 6",
      "PartyKit",
      "Workbox",
      "KaTeX",
      "Mermaid",
    ],
    stackGroups: [
      {
        group: "Frontend",
        items: ["Preact 10", "Signals", "TypeScript", "Vite"],
      },
      {
        group: "Editor",
        items: ["CodeMirror 6", "Vim mode", "KaTeX", "Mermaid"],
      },
      { group: "Realtime", items: ["PartyKit"] },
      { group: "Platform", items: ["Workbox", "PWA", "localStorage"] },
    ],
    tags: ["markdown", "editor", "realtime", "offline-first"],
    timeline: "2024-2026 · v3.1.0",
    platforms: ["Responsive web", "Installable PWA"],
    features: [
      "Editor, split, preview, focus, and typewriter modes",
      "Vim bindings, formatting toolbar, linting, outline, templates, and image paste",
      "KaTeX math, Mermaid diagrams, syntax themes, and multiple export formats",
      "Tabbed local documents with word goals and offline PWA support",
      "Realtime collaborative writing with reconnect recovery",
      "Solo daily challenges and multiplayer typing rooms for up to eight players",
    ],
    architectureNotes: [
      "CodeMirror 6 owns editing extensions while Preact Signals keep document, preference, and mode state lightweight.",
      "Workbox caches the application shell so core writing remains available offline.",
      "PartyKit separates room-based collaboration and typing-arena state from local document persistence.",
      "Markdown extensions for math, diagrams, callouts, footnotes, and syntax rendering are composed into the preview pipeline.",
    ],
    decisions: [
      {
        title: "Separate local documents from realtime rooms",
        context:
          "Offline writing and multiplayer sessions have different ownership, persistence, and recovery semantics.",
        choice:
          "Keep tabbed documents in local storage and use PartyKit only for room-based collaboration and battles.",
        consequence:
          "Offline writing stays dependable, while moving content between local and shared contexts remains an explicit action.",
      },
      {
        title: "Use one product shell for work and play",
        context:
          "A typing arena could have become a disconnected side project with separate navigation and state.",
        choice:
          "Present Writer and Battle as first-class modes inside the same Preact application.",
        consequence:
          "The utility becomes memorable and reuses realtime infrastructure, but the product must maintain two very different interaction densities.",
      },
    ],
    challenges: [
      "Offline local documents and realtime rooms have different ownership and recovery rules.",
      "A feature-rich editor must keep keyboard commands discoverable without letting toolbars dominate the writing surface.",
      "The former m4rkdown.is-a.dev address no longer resolves to the app; the case study now links to the working Vercel deployment.",
    ],
    screenshots: [
      {
        src: "/project-covers/m4rkdown-writer.webp",
        alt: "M4rkdown split editor showing Markdown source and rendered preview",
        width: 1440,
        height: 1000,
      },
      {
        src: "/project-covers/m4rkdown-modes.webp",
        alt: "M4rkdown mode selector offering the Writer workspace and live typing Battle",
        width: 1440,
        height: 1000,
        label: "Two modes",
        caption:
          "The entry screen makes the project's unusual scope explicit: a serious offline writer and a live typing game share one product.",
      },
    ],
    liveUrl: "https://m4rkdown.vercel.app",
    githubUrl: "https://github.com/zhenxiao-yu/m4rkdown-editor",
    outcome:
      "A deployed v3.1.0 PWA with a genuinely broad editor surface and a memorable second mode: collaborative and competitive realtime typing built on the same application foundation.",
    lessonsLearned: [
      "Offline-first changes every assumption about state and conflict resolution.",
      "A small playful mode makes a utility memorable.",
    ],
    nextSteps: [
      "Add durable document version history",
      "Test collaboration recovery under network churn",
      "Retire stale domain references across the repository",
    ],
    seo: {
      title: "M4rkdown case study",
      description:
        "M4rkdown offline-first collaborative markdown editor by ZhenXiao Mark Yu.",
    },
    translations: {
      zh: {
        shortPitch:
          "离线优先的 Markdown 编辑器，支持实时协作、PWA 安装，以及多人打字竞技模式。",
        why: "我天天用 markdown 写东西，也烦透了那些一断网就罢工的编辑器。至于那个多人打字小游戏，纯粹是它能离线工作之后，我没忍住继续往下做。",
        problem:
          "大多数 Markdown 编辑器都默认联网且单人使用。M4rkdown 想探索一个离线优先、并且能邀请他人加入的编辑器会是什么体验。",
        solution:
          "以 CodeMirror 作为编辑核心，封装在 Preact + Vite 的 PWA 中，使用 PartyKit 实现实时协作，并在同一套同步引擎之上加入了趣味的多人打字模式。",
      },
    },
  },
] satisfies ProjectInput[];

export const allProjects = projects.map((project) =>
  projectSchema.parse(project),
);
export const featuredProjects = allProjects.filter(
  (project) => project.featured,
);

export function getProject(slug: string) {
  return allProjects.find((project) => project.slug === slug);
}
