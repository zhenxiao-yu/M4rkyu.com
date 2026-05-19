import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  RESEND_EVENT_TYPES,
  verifyResendWebhook,
  type ResendEventType,
} from "@/lib/server/webhooks/resend";

// Loose shape check — full taxonomy lives in RESEND_EVENT_TYPES; unknown `type` values still log.
const webhookPayloadSchema = z.object({
  type: z.string().min(1),
  created_at: z.string().optional(),
  data: z
    .object({
      email_id: z.string().optional(),
      from: z.string().optional(),
      to: z.union([z.string(), z.array(z.string())]).optional(),
      subject: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

// Resend webhook — Svix HMAC verified; 401 on bad sig stops retries (treated as permanent). Node runtime for node:crypto.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  if (!env.RESEND_WEBHOOK_SECRET) {
    // 503 surfaces the misconfig in Resend's UI rather than silently accepting events.
    return NextResponse.json(
      { ok: false, reason: "webhook-not-configured" },
      { status: 503 },
    );
  }

  // Read raw text — Svix signs the byte string, not the re-serialised object.
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

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 });
  }

  const parsed = webhookPayloadSchema.safeParse(parsedBody);
  if (!parsed.success) {
    console.warn("[resend-webhook] bad shape", { issues: parsed.error.issues });
    return NextResponse.json({ ok: false, reason: "bad-shape" }, { status: 400 });
  }

  const payload = parsed.data;
  const type = payload.type;
  const known = (RESEND_EVENT_TYPES as readonly string[]).includes(type);

  // Single structured log line per event — filter on "[resend-webhook]" in Vercel Observability.
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

// 405 on GET so a misconfigured monitor doesn't mistake this for a health endpoint.
export function GET() {
  return new NextResponse("method-not-allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
