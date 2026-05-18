import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { isSupabaseConfigured } from "./config";

/**
 * Server-only admin client. Uses the SERVICE_ROLE_KEY which bypasses
 * RLS and grants access to `auth.admin.*` endpoints (generateLink,
 * createUser, listUsers, etc).
 *
 * **Never import this file from a `"use client"` component.** The
 * `import "server-only"` guard above turns that into a build error,
 * but the comment is a backup — the key escaping into a client
 * bundle is a critical leak.
 *
 * Returns `null` when the service-role key is not configured. Every
 * caller checks for null and falls back to the cookie-bound user
 * client (which respects RLS, doesn't have admin powers, and goes
 * through Supabase's slower default email pipeline).
 */
let cachedAdmin: SupabaseClient | null = null;

export function getAdminSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  if (!cachedAdmin) {
    cachedAdmin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL as string,
      serviceRoleKey,
      {
        auth: {
          // Admin clients have no user session to refresh or persist
          // — these flags keep the SDK from creating a token-rotation
          // loop on the server.
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }
  return cachedAdmin;
}

/**
 * `true` when the fast-email pipeline (admin.generateLink + Resend)
 * is fully wired and the slow Supabase-default path can be skipped.
 * Both halves are required:
 *   - SERVICE_ROLE_KEY (to mint links without sending)
 *   - Resend (to actually send the email)
 *
 * Callers gate their fast/slow branch on this. When `false`, the
 * Supabase default email pipeline is used — slower (30–60s typical)
 * but functional with zero extra setup.
 */
export function isFastAuthEmailConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() &&
      env.SUPABASE_SERVICE_ROLE_KEY &&
      env.RESEND_API_KEY &&
      env.INQUIRY_FROM_EMAIL,
  );
}
