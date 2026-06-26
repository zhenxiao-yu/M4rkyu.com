// How many static (built-in) items aren't in the DB yet — the count that
// drives the dashboard "not imported" indicator. Pure + standalone so the
// admin dashboard can call it without importing any server-only module.
export function countNotImported(staticSlugs: string[], dbSlugs: string[]): number {
  const inDb = new Set(dbSlugs);
  return staticSlugs.filter((slug) => !inDb.has(slug)).length;
}
