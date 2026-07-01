import { getCurrentUser } from "@/lib/auth/get-current-user";
import { clientIpFromHeaders } from "@/lib/auth/error-classify";
import { createRateLimiter } from "@/lib/server/rate-limit";
import { env } from "@/lib/env";
import { isVisionConfigured, suggestImageMetaFromUrl } from "@/lib/ai/vision";

export const maxDuration = 30;

// Vision calls are heavier than text; keep the per-operator budget modest.
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB decoded ceiling

// SSRF guard: only fetch our own gallery objects or a site-relative asset.
function resolveAllowedUrl(imageUrl: string, origin: string): string | null {
  if (imageUrl.startsWith("/")) {
    try {
      return new URL(imageUrl, origin).toString();
    } catch {
      return null;
    }
  }
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    base &&
    imageUrl.startsWith(`${base}/storage/v1/object/public/gallery-images/`)
  ) {
    return imageUrl;
  }
  return null;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return Response.json({ error: "forbidden" }, { status: 404 });
  }
  if (!isVisionConfigured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
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
  const imageUrl = (body as { imageUrl?: unknown })?.imageUrl;
  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    return Response.json({ error: "badRequest" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const allowed = resolveAllowedUrl(imageUrl, origin);
  if (!allowed) {
    return Response.json({ error: "badRequest" }, { status: 400 });
  }

  try {
    const imgRes = await fetch(allowed);
    if (!imgRes.ok) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return Response.json({ error: "badRequest" }, { status: 400 });
    }
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return Response.json({ error: "tooLarge" }, { status: 413 });
    }
    const dataUrl = `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;

    const meta = await suggestImageMetaFromUrl(dataUrl);
    if (!meta) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }
    return Response.json(meta);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/assist/vision] error", error);
    }
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
