import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  RESEND_EVENT_TYPES,
  verifyResendWebhook,
  type ResendEventType,
  type ResendWebhookPayload,
} from "@/lib/server/webhooks/resend";

/**
 * Resend webhook receiver.
 *
 * Authenticity is verified via Svix-format HMAC-SHA256 (see
 * `src/lib/server/webhooks/resend.ts`). Unsigned, expired, or
 * mismatched payloads are rejected with 401 — Resend's retries treat
 * 401 as "give up" rather than "retry", which is what we want for
 * permanent-failure cases.
 *
 * Today this endpoint is observability-only: structured `console.*`
 * lines land in Vercel's runtime logs, which already power our
 * inbound-mail audit trail. A future revision can persist events to
 * Vercel KV / Postgres + emit Analytics custom events.
 *
 * Force the Node runtime — `node:crypto` (used by the signature
 * verifier) isn't available in the Edge runtime.
 */
export const runtime = "nodejs";

/** Tell Next to always render fresh — webhook handlers must never be
 *  cached by the framework. */
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  if (!env.RESEND_WEBHOOK_SECRET) {
    // Endpoint is unconfigured — emit a 503 so Resend's UI flags the
    // misconfig and the monitor surfaces it instead of silently
    // accepting events.
    return NextResponse.json(
      { ok: false, reason: "webhook-not-configured" },
      { status: 503 },
    );
  }

  // Read raw text BEFORE JSON.parse — Svix signs the byte string, not
  // the re-serialised object.
  const rawBody = await req.text();

  const verify = verifyResendWebhook({
    secret: env.RESEND_WEBHOOK_SECRET,
    rawBody,
    headers: {
      "svix-id": req.headers.get("svix-id"),
      "svix-timestamp": req.headers.get("svix-timestamp"),
      "svix-signature": req.headers.get("svix-signature"),
    },
  });

  if (!verify.ok) {
    console.warn("[resend-webhook] rejected", { reason: verify.reason });
    return NextResponse.json({ ok: false, reason: verify.reason }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 });
  }

  const type = payload.type;
  const known = (RESEND_EVENT_TYPES as readonly string[]).includes(type);

  // Single structured log line per event so a downstream log query
  // (Vercel Observability filter on "[resend-webhook]") can group +
  // chart event rates by type.
  console.info("[resend-webhook] event", {
    type: known ? (type as ResendEventType) : `unknown:${type}`,
    emailId: payload.data?.email_id,
    to: payload.data?.to,
    from: payload.data?.from,
    subject: payload.data?.subject,
    createdAt: payload.created_at,
  });

  return NextResponse.json({ ok: true });
}

/** Reject everything else loudly so a misconfigured monitor probing
 *  with GET doesn't think the endpoint is healthy. */
export function GET() {
  return new NextResponse("method-not-allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
