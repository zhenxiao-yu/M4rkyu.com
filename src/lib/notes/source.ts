import "server-only";

import { cache } from "react";
import { notes as staticNotes } from "@/content/notes";
import { dbNoteRowToNote, getDbNotes } from "@/lib/notes/db";
import type { Note } from "@/content/schemas";

// Unified read of the /notes feed — DB first, static src/content/notes.ts
// as zero-downtime fallback. The public surface only ever sees published
// (status = 'ready') notes, newest first; admin surfaces read getDbNotes
// directly to see every status.
//
// Cutover: as soon as the notes table has ≥1 row, the public feed flips
// to DB-backed reads. Until then, the static array is authoritative.

export const getNotesSource = cache(async (): Promise<Note[]> => {
  const rows = await getDbNotes();
  const all = rows.length === 0 ? staticNotes : rows.map(dbNoteRowToNote);
  return all.filter((note) => note.status === "ready");
});
