import {
  AtSign,
  BookOpen,
  Braces,
  Briefcase,
  Camera,
  Code2,
  FileText,
  Gamepad2,
  Ghost,
  Hash,
  History,
  Image as ImageIcon,
  Link2,
  Mail,
  MessageCircle,
  Music2,
  PlaySquare,
  Rss,
  Search,
  Sparkles,
  SquareCode,
  StickyNote,
  Store,
  ThumbsUp,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Static map — keeps the bundle tree-shakable, mirroring the pattern in
// nav-dropdown-icon.tsx / resources/tool-icon.tsx. Add an entry here when a
// new `iconKey` is set on a footer link in footer.tsx.
const ICONS: Record<string, LucideIcon> = {
  AtSign,
  BookOpen,
  Braces,
  Briefcase,
  Camera,
  Code2,
  FileText,
  Gamepad2,
  Ghost,
  Hash,
  History,
  Image: ImageIcon,
  Link2,
  Mail,
  MessageCircle,
  Music2,
  PlaySquare,
  Rss,
  Search,
  Sparkles,
  SquareCode,
  StickyNote,
  Store,
  ThumbsUp,
  User,
  Wrench,
};

/**
 * Leading marginalia icon for a footer sitemap row. Renders nothing when the
 * link has no `iconKey` (or an unmapped one), so the component degrades to the
 * old text-only row instead of throwing. Always decorative — the text label
 * carries the meaning, so the icon is aria-hidden.
 */
export function FooterLinkIcon({
  iconKey,
  className,
}: {
  iconKey?: string;
  className?: string;
}) {
  const Icon = iconKey ? ICONS[iconKey] : undefined;
  if (!Icon) return null;
  return <Icon aria-hidden="true" className={className ?? "size-3.5"} />;
}
