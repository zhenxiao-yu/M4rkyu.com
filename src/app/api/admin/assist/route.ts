import { generateText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { clientIpFromHeaders } from "@/lib/auth/error-classify";
import { createRateLimiter } from "@/lib/server/rate-limit";

// Admin-only metadata drafting. Reuses the same DeepSeek provider as the
// public /api/ask console (reads DEEPSEEK_API_KEY). One-shot generateText —
// fields are short, so streaming would just add UI complexity.
export const maxDuration = 20;

const MODEL = deepseek("deepseek-chat");

// Generous for a single operator, tight enough to bound cost if a session
// is left open. Keyed per-IP like the public route.
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

type Task = "seoTitle" | "seoDescription" | "shortPitch" | "tags";

// Per-task output budget + the one-line instruction handed to the model.
// Budgets are deliberately small so a field-fill stays snappy and cheap.
const TASK_CONFIG: Record<Task, { tokens: number; instruction: string }> = {
  seoTitle: {
    tokens: 60,
    instruction:
      "Write a single SEO page <title>: at most 60 characters, specific, leading with the concrete subject. No quotes, no trailing punctuation, no site name.",
  },
  seoDescription: {
    tokens: 140,
    instruction:
      "Write a meta description: 120–155 characters, one or two sentences, concrete and inviting. No quotes.",
  },
  shortPitch: {
    tokens: 110,
    instruction:
      "Write a punchy 1–2 sentence pitch in a sharp indie-developer voice: concrete, specific, no marketing fluff, no buzzwords, no quotes.",
  },
  tags: {
    tokens: 90,
    instruction:
      "List 5–8 short lowercase topical tags drawn from the content, comma-separated on one line. No leading #, no quotes, tags only.",
  },
};

function isTask(value: unknown): value is Task {
  return typeof value === "string" && value in TASK_CONFIG;
}

// Only string values survive; everything trimmed + length-capped so a giant
// pasted body can't blow up the prompt.
function normalizeContext(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 1_200);
      if (trimmed) out[key] = trimmed;
    }
  }
  return out;
}

// Strip wrapping quotes / stray code fences the model sometimes adds.
function cleanOutput(text: string): string {
  return text
    .trim()
    .replace(/^```[a-z]*\n?|\n?```$/gi, "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

const SYSTEM = [
  "You assist an admin writing CMS metadata for Mark Yu's developer/designer portfolio.",
  "Use ONLY the facts in the provided context. Never invent titles, metrics, clients, awards, dates, or features that are not present.",
  "Output ONLY the requested text — no preamble, no labels, no explanation, no Markdown.",
].join(" ");

export async function POST(req: Request) {
  // Privileged surface — confirm admin before doing any work.
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return Response.json({ error: "forbidden" }, { status: 404 });
  }

  const ip = clientIpFromHeaders(req.headers) ?? "admin";
  if (limiter.check(ip, Date.now())) {
    return Response.json(
      { error: "rateLimited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "badRequest" }, { status: 400 });
  }

  const task = (body as { task?: unknown })?.task;
  if (!isTask(task)) {
    return Response.json({ error: "badRequest" }, { status: 400 });
  }

  const context = normalizeContext((body as { context?: unknown })?.context);
  if (Object.keys(context).length === 0) {
    return Response.json({ error: "needContext" }, { status: 422 });
  }

  const config = TASK_CONFIG[task];
  const contextBlock = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM,
      prompt: `${config.instruction}\n\nCONTEXT:\n${contextBlock}`,
      temperature: 0.4,
      maxOutputTokens: config.tokens,
    });

    const cleaned = cleanOutput(text);
    if (!cleaned) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }
    return Response.json({ text: cleaned });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/assist] error", error);
    }
    // Most likely DEEPSEEK_API_KEY unset/invalid.
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
