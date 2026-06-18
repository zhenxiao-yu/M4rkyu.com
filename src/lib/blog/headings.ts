import { slugifyTag } from "@/lib/search/topics";

export interface PostHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

const FENCE_RE = /^\s*(```|~~~)/;
const ATX_HEADING_RE = /^(#{2,3})\s+(.+?)\s*#*$/;

export function cleanMarkdownHeadingText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

export function createHeadingIdGenerator() {
  const seen = new Map<string, number>();

  return (text: string) => {
    const base = slugifyTag(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

/**
 * Pull the h2/h3 outline from raw markdown for the reading-page TOC rail.
 * ATX headings only (dev.to's format); fenced code is skipped so a
 * `## comment` inside a block never becomes a phantom section.
 */
export function extractMarkdownHeadings(markdown: string): PostHeading[] {
  const headings: PostHeading[] = [];
  const makeHeadingId = createHeadingIdGenerator();
  let inFence = false;

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = ATX_HEADING_RE.exec(line);
    if (!match) continue;

    const text = cleanMarkdownHeadingText(match[2]);
    if (!text) continue;

    headings.push({
      id: makeHeadingId(text),
      text,
      depth: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}
