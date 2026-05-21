import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseTiers } from "@/lib/notes/tiers";
import type { Note } from "@/content/schemas";

// DB-backed reads for the /notes microblog. Wrapped in React cache() so
// multiple callers per render hit Supabase once. All return arrays /
// null — never throw — so callers fall back to src/content/notes.ts when
// the table is empty or there is no request context (build time).

export interface DbNoteRow {
  id: string;
  slug: string;
  kind: Note["kind"];
  title: string;
  body: string;
  status: Note["status"];
  tags: string[] | null;
  published_at: string;
  link_url: string | null;
  link_label: string | null;
  rating: number | null;
  tiers: string | null;
  sort_order: number;
}

const SELECT_COLUMNS =
  "id, slug, kind, title, body, status, tags, published_at, link_url, link_label, rating, tiers, sort_order";

export const getDbNotes = cache(async (): Promise<DbNoteRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("notes")
      .select(SELECT_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DbNoteRow[];
  } catch {
    return [];
  }
});

export const getDbNoteBySlug = cache(
  async (slug: string): Promise<DbNoteRow | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("notes")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as DbNoteRow;
    } catch {
      return null;
    }
  },
);

// Map a DB row to the public Note shape consumed by /notes. The DB
// CHECK constraints already gate kind/status/rating, so this stays a
// plain shape mapping (no Zod re-parse) — a stray row can't throw and
// blank the whole feed.
export function dbNoteRowToNote(row: DbNoteRow): Note {
  const link = row.link_url
    ? { url: row.link_url, label: row.link_label ?? "" }
    : undefined;
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    body: row.body,
    status: row.status,
    tags: row.tags ?? [],
    publishedAt: row.published_at,
    link,
    rating: row.rating ?? undefined,
    tiers: row.tiers ? parseTiers(row.tiers) : [],
  };
}
