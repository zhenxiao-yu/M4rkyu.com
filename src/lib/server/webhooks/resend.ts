import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Resend uses Svix-format webhook signatures. Each request carries:
 *   svix-id        — unique id for this delivery
 *   svix-timestamp — UTC seconds when Resend signed the payload
 *   svix-signature — space-separated list of "v1,<base64>" entries
 *
 * The HMAC payload is `${svixId}.${svixTimestamp}.${rawBody}`, signed
 * with the webhook signing secret (which Resend distributes in the
 * dashboard, prefixed `whsec_`). Multiple versions can ride on one
 * request — we match any `v1,…` entry to support key rotation
 * gracefully.
 *
 * Spec: https://docs.svix.com/receiving/verifying-payloads/how
 */

export type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing-headers"
        | "stale-timestamp"
        | "bad-signature"
        | "secret-not-configured";
    };

/** Maximum age of an accepted webhook, in seconds. Svix's default is
 *  300 seconds (5 minutes); we use the same so replay windows are
 *  small but DNS / queue hiccups don't cause false rejections. */
const MAX_AGE_SECONDS = 5 * 60;

export function verifyResendWebhook({
  secret,
  rawBody,
  headers,
}: {
  /** `whsec_…` value from the Resend dashboard. Pass undefined to
   *  return an explicit "not configured" result (the route maps that
   *  to a 503 so misconfig surfaces in monitoring). */
  secret: string | undefined;
  /** The exact bytes Resend POSTed. `await req.text()` — not a
   *  re-stringified JSON object, byte-for-byte. */
  rawBody: string;
  /** Lowercased header names → values. */
  headers: {
    "svix-id": string | null;
    "svix-timestamp": string | null;
    "svix-signature": string | null;
  };
}): VerifyResult {
  if (!secret) return { ok: false, reason: "secret-not-configured" };

  const id = headers["svix-id"];
  const ts = headers["svix-timestamp"];
  const sig = headers["svix-signature"];
  if (!id || !ts || !sig) return { ok: false, reason: "missing-headers" };

  // Reject far-future / far-past timestamps. Mitigates replay if the
  // signature ever leaks via mirror logs.
  const tsNum = Number.parseInt(ts, 10);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > MAX_AGE_SECONDS) {
    return { ok: false, reason: "stale-timestamp" };
  }

  // Resend's secret arrives prefixed `whsec_<base64>`. Svix HMACs use
  // the decoded raw bytes as the key, not the prefixed string.
  const secretBytes = decodeSecret(secret);
  if (!secretBytes) return { ok: false, reason: "secret-not-configured" };

  const expected = createHmac("sha256", secretBytes)
    .update(`${id}.${ts}.${rawBody}`)
    .digest("base64");

  // Header is a space-separated list of `vN,<sig>` entries. We accept
  // any v1 that matches — covers signing-secret rotation periods
  // where Resend signs with both old and new keys for a window.
  for (const entry of sig.split(/\s+/)) {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) continue;
    if (constantTimeEqualBase64(value, expected)) return { ok: true };
  }
  return { ok: false, reason: "bad-signature" };
}

function decodeSecret(secret: string): Buffer | null {
  // Strip `whsec_` prefix if present (Resend always includes it; some
  // dashboards omit it when shown). Anything else is treated as the
  // raw base64.
  const cleaned = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  try {
    return Buffer.from(cleaned, "base64");
  } catch {
    return null;
  }
}

function constantTimeEqualBase64(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "base64");
  const bBuf = Buffer.from(b, "base64");
  if (aBuf.length !== bBuf.length) return false;
  try {
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

/**
 * Event taxonomy. Resend documents these strings as stable; if they
 * add new ones, the route falls through to `email.unknown` and logs
 * the raw `type` so we know to extend this list.
 *
 * https://resend.com/docs/dashboard/webhooks/event-types
 */
export const RESEND_EVENT_TYPES = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.opened",
  "email.clicked",
  "email.failed",
  "contact.created",
  "contact.updated",
  "contact.deleted",
] as const;

export type ResendEventType = (typeof RESEND_EVENT_TYPES)[number];

export interface ResendWebhookPayload {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    [key: string]: unknown;
  };
}
