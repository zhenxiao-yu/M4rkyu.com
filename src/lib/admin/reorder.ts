import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Shared reorder path for every admin list. Delegates the swap to the
// `admin_reorder` Postgres function (see
// supabase/migrations/20260812000000_admin_reorder_rpc.sql) so the whole
// operation is one atomic, race-free round-trip instead of a read-all +
// swap-in-memory + N parallel writes. NOT a "use server" module — it exports a
// plain server-only helper that the per-domain action modules call.

export type ReorderDirection = "up" | "down";

/** Restrict a reorder to a sub-list, e.g. gallery items within one collection. */
export interface ReorderScope {
  column: "collection_id" | "project_id";
  value: string;
}

export interface ReorderResult {
  ok: boolean;
  error?: string;
}

/**
 * Move one row a single step within its (optionally scoped) ordering. Returns
 * whether the swap succeeded; a failure is logged with structured context so it
 * is never silent. RLS still gates the underlying write to admins.
 */
export async function reorderRow(
  table: string,
  id: string,
  direction: ReorderDirection,
  scope?: ReorderScope,
): Promise<ReorderResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_reorder", {
    p_table: table,
    p_id: id,
    p_direction: direction,
    p_scope_col: scope?.column ?? null,
    p_scope_val: scope?.value ?? null,
  });
  if (error) {
    console.error("[admin] reorder failed", {
      table,
      id,
      direction,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
