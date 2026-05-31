import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIpFromHeaders } from "@/lib/auth/error-classify";
import { buildSearchCatalog } from "@/lib/search/catalog";
import { rankCatalog } from "@/lib/search/rank";

const bodySchema = z.object({
  query: z.string().trim().min(2).max(200),
});

// Best-effort in-memory sliding-window limiter. On Vercel Fluid Compute each
// instance keeps its own map, so this throttles casual abuse per instance —
// durable cross-instance limiting would need Vercel KV / Upstash. Paired with
// the 200-char input cap + Sonnet + 600 output-token cap to bound per-call cost.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const requestLog = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  // Bound the map so a churn of unique IPs can't grow it without limit.
  if (requestLog.size > 5_000) requestLog.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers) ?? "anon";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "rateLimited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  }

  try {
    const catalog = buildSearchCatalog();
    const hits = await rankCatalog(parsed.data.query, catalog);
    return NextResponse.json({
      results: hits.map(({ doc, reason }) => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        href: doc.href,
        external: doc.external ?? false,
        subtitle: doc.subtitle,
        reason,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ai-search] ranking failed", error);
    }
    // Most likely cause: gateway auth missing (AI_GATEWAY_API_KEY unset and
    // no Vercel OIDC). The client renders a graceful "unavailable" state.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
