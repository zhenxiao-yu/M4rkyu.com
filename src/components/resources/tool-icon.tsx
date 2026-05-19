import {
  Binary,
  Braces,
  Code2,
  Contrast,
  FileText,
  Fingerprint,
  Hash,
  KeyRound,
  Link2,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Type as TypeIcon,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Static mapping — keeps the bundle tree-shakable. Add new entries here
// when a new tool's iconKey is set in src/content/resources.ts.
const ICONS: Record<string, LucideIcon> = {
  Binary,
  Braces,
  Code2,
  Contrast,
  FileText,
  Fingerprint,
  Hash,
  KeyRound,
  Link2,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Type: TypeIcon,
  Wrench,
};

interface ToolIconProps {
  iconKey?: string;
  /** Falls back to a tag-derived guess, then to Wrench. */
  tags?: string[];
  className?: string;
}

// Tag-to-icon fallback when an iconKey isn't set. Ordered by precedence —
// first matching tag wins.
const TAG_FALLBACK: [string, LucideIcon][] = [
  ["color", Palette],
  ["css", Palette],
  ["crypto", ShieldCheck],
  ["security", ShieldCheck],
  ["encode", Code2],
  ["decode", Code2],
  ["format", Braces],
  ["json", Braces],
  ["text", TypeIcon],
  ["string", TypeIcon],
  ["url", Link2],
  ["hash", Fingerprint],
  ["binary", Binary],
  ["math", Binary],
  ["placeholder", Sparkles],
  ["units", Ruler],
];

export function ToolIcon({ iconKey, tags = [], className }: ToolIconProps) {
  const Icon =
    (iconKey && ICONS[iconKey]) ||
    TAG_FALLBACK.find(([tag]) => tags.includes(tag))?.[1] ||
    Wrench;
  return <Icon aria-hidden="true" className={className ?? "size-5"} />;
}
