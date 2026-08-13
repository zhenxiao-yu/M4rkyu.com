// Shared, framework-pure form-field parsers for the admin server actions.
//
// This module deliberately omits "use server": it exports plain synchronous
// helpers (not server actions), which a "use server" module is not allowed to
// export. The per-domain action modules (`lib/{shop,media,games,notes,
// resources}/admin.ts`) import from here instead of each re-declaring the same
// three parsers. Mirrors the pattern in `lib/gallery/admin/shared.ts`, which
// predates this and centralizes the same helpers for the gallery subtree.

/** A single text value from a FormData field, or "" when absent/non-string. */
export function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** A checkbox-style boolean: true when the field is "on" or "true". */
export function booleanField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/** Textarea arrays: one item per line, trimmed, empties dropped. */
export function arrayField(formData: FormData, key: string): string[] {
  return pickField(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
