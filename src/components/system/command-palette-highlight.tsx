/**
 * Highlights the matched substring of `text` against the current
 * `query`, wrapping it in a `<mark>` so search results show what
 * matched. Presentational and dependency-free.
 */
export function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return <>{text}</>;
  const before = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const after = text.slice(index + needle.length);
  return (
    <>
      {before}
      <mark className="rounded-sm bg-ring/20 px-0.5 text-foreground">
        {match}
      </mark>
      {after}
    </>
  );
}
