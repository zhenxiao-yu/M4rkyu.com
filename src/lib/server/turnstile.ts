import "server-only";

import { env } from "@/lib/env";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true; bypassed: boolean }
  | { ok: false; reason: "missing-token" | "rejected" | "network" };

/**
 * Verify a Turnstile token with Cloudflare's siteverify endpoint.
 *
 * Local-dev ergonomics:
 *   When `TURNSTILE_SECRET_KEY` is unset (no Cloudflare account wired),
 *   this function short-circuits to `{ ok: true, bypassed: true }`.
 *   The form layer falls back to the honeypot check in that mode.
 *   Production deploys should always set the secret.
 *
 * Failure modes are folded into a small union so callers map them to
 * user-facing error toasts without inspecting fetch internals.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined,
): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: true, bypassed: true };
  }
  if (!token) {
    return { ok: false, reason: "missing-token" };
  }

  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      // Never cache verification responses.
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, reason: "network" };
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success
      ? { ok: true, bypassed: false }
      : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
