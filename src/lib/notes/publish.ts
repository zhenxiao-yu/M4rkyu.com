import type { Note } from "@/content/schemas";

/**
 * A note is publicly visible when it's marked `ready` AND its `publishedAt`
 * is not in the future. Setting a future date in the admin editor therefore
 * *schedules* a note: it stays out of the public feed + RSS until its date
 * passes (surfaced on the next ISR revalidation — hourly). Admin surfaces
 * read getDbNotes directly and bypass this, so drafts/scheduled notes stay
 * visible there. Fail-open on an unparseable date so a typo never silently
 * buries an otherwise-ready note.
 *
 * Pure (takes `now`) so it stays deterministically testable.
 */
export function isPublishedNote(
  note: Pick<Note, "status" | "publishedAt">,
  now: number,
): boolean {
  if (note.status !== "ready") return false;
  const at = Date.parse(note.publishedAt);
  return Number.isNaN(at) ? true : at <= now;
}
