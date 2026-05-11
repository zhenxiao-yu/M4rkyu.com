import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Singleton Resend client. Lazy so module evaluation doesn't fail in
 * test / lint contexts that haven't loaded the env. Server-only via
 * `import "server-only"` — a stray client import is a build error.
 */
let cached: Resend | null = null;

export function getResendClient(): Resend {
  if (!cached) {
    cached = new Resend(env.RESEND_API_KEY);
  }
  return cached;
}
