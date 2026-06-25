import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { clientIpFromHeaders } from "@/lib/auth/error-classify";
import { buildSearchCatalog } from "@/lib/search/catalog";
import { createRateLimiter } from "@/lib/server/rate-limit";

// Streaming can run a little long; give the function room.
export const maxDuration = 30;

// Direct DeepSeek provider (reads DEEPSEEK_API_KEY). "deepseek-chat" (V3) is the
// fast conversational model — right for a snappy streaming Q&A; swap to
// "deepseek-reasoner" (R1) to trade latency for visible chain-of-thought.
const MODEL = deepseek("deepseek-chat");

// Best-effort in-memory per-IP limiter (per Fluid instance). Paired with the
// message/length caps + capped output tokens to bound per-conversation cost.
const limiter = createRateLimiter({ windowMs: 60_000, max: 12 });

// Grounding: the model is told exactly what exists and the precise locale-less
// href for each item, so every link it emits resolves to a real page.
async function buildSystemPrompt(): Promise<string> {
  const catalog = (await buildSearchCatalog())
    .map(
      (d) =>
        `- [${d.type}] "${d.title}" → ${d.href}${d.external ? " (external)" : ""} :: ${d.description}`,
    )
    .join("\n");

  return [
    "You are **M4RKYU.SYS** — the resident terminal intelligence of Mark Yu's portfolio.",
    "Mark is a developer/designer who builds web apps, games, and visual work. You answer visitors' questions about him and his work.",
    "",
    "VOICE: sharp, precise, a little playful — a knowledgeable console, never corporate filler. Open with the answer, not a greeting.",
    "",
    "RULES:",
    "- Stay on-topic: Mark, his work, and the catalog below. For anything unrelated, decline in one witty line and steer back.",
    "- Be tight: 1–4 short sentences, or a short bulleted list. No padding.",
    "- Use **bold** for the most important names, technologies, and facts.",
    "- When you reference a piece of content, link it with Markdown using the EXACT href from the catalog, e.g. [Nimbus](/work/nimbus). NEVER invent a title, href, or fact that is not in the catalog.",
    "- If nothing in the catalog fits, say so plainly and suggest the closest area.",
    "",
    "CATALOG (title → href :: summary):",
    catalog,
  ].join("\n");
}

const MAX_MESSAGES = 12;
const MAX_CHARS = 1_000;

function isLikelyUiMessages(value: unknown): value is UIMessage[] {
  return (
    Array.isArray(value) &&
    value.every((m) => m && typeof m === "object" && "role" in m && "parts" in m)
  );
}

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers) ?? "anon";
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
  const messages = (body as { messages?: unknown })?.messages;
  if (!isLikelyUiMessages(messages)) {
    return Response.json({ error: "badRequest" }, { status: 400 });
  }

  // Cap turns + total text so a crafted payload can't blow up the prompt.
  const recent = messages.slice(-MAX_MESSAGES);
  const totalChars = JSON.stringify(recent).length;
  if (totalChars > MAX_CHARS * MAX_MESSAGES) {
    return Response.json({ error: "tooLong" }, { status: 413 });
  }

  const result = streamText({
    model: MODEL,
    system: await buildSystemPrompt(),
    messages: await convertToModelMessages(recent),
    temperature: 0.4,
    maxOutputTokens: 700,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ask] stream error", error);
      }
      // Surfaced to the client's useChat error state. Most likely cause:
      // DEEPSEEK_API_KEY unset or invalid.
      return "unavailable";
    },
  });
}
