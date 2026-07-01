export type ImageIssueKey = "missingAlt" | "tooSmall";

const MIN_EDGE = 800;

// Passive, AI-free review of a single item's publish-readiness. Kept pure so
// the panel (and later, the uploader) can surface the same signal.
export function analyzeImageIssues(input: {
  alt: string;
  width: number | null;
  height: number | null;
}): { key: ImageIssueKey }[] {
  const issues: { key: ImageIssueKey }[] = [];
  if (input.alt.trim().length === 0) issues.push({ key: "missingAlt" });
  const { width, height } = input;
  const small =
    (typeof width === "number" && width > 0 && width < MIN_EDGE) ||
    (typeof height === "number" && height > 0 && height < MIN_EDGE);
  if (small) issues.push({ key: "tooSmall" });
  return issues;
}
