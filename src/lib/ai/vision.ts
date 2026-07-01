import "server-only";

import { env } from "@/lib/env";

export interface VisionMeta {
  alt: string;
  caption: string;
  tags: string[];
}

function extractJson(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return raw.slice(start, end + 1);
}

export function parseVisionResponse(raw: string): VisionMeta | null {
  const jsonText = extractJson(raw);
  if (!jsonText) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(jsonText);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const alt = typeof o.alt === "string" ? o.alt.trim().slice(0, 240) : "";
  const caption = typeof o.caption === "string" ? o.caption.trim().slice(0, 1000) : "";
  const tags = Array.isArray(o.tags)
    ? o.tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  if (!alt && !caption && tags.length === 0) return null;
  return { alt, caption, tags };
}

export function isVisionConfigured(): boolean {
  return Boolean(env.AI_VISION_API_KEY);
}

const SYSTEM =
  "You caption photographs for a personal photo archive. Look at the image and describe only what is visibly present — never invent people, places, brands, or dates. Reply with ONLY a JSON object.";

const INSTRUCTION =
  'Return a JSON object with exactly these keys: "alt" (a plain, factual alt-text description, <= 200 chars, no "image of"), "caption" (one short evocative sentence, <= 140 chars), and "tags" (3-8 short lowercase topical tags as a string array). JSON only, no prose.';

export async function suggestImageMetaFromUrl(
  imageDataUrl: string,
): Promise<VisionMeta | null> {
  const key = env.AI_VISION_API_KEY;
  if (!key) return null;
  const baseUrl = env.AI_VISION_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model = env.AI_VISION_MODEL ?? "google/gemini-2.0-flash-exp:free";

  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${key}`,
  };
  if (env.NEXT_PUBLIC_SITE_URL) headers["HTTP-Referer"] = env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 320,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: INSTRUCTION },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  return parseVisionResponse(content);
}
