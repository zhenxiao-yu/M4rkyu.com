import {
  BookOpen,
  Briefcase,
  Gamepad2,
  Image as ImageIcon,
  Link2,
  StickyNote,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Static map — keeps the bundle tree-shakable. Mirrors the pattern in
// src/components/resources/tool-icon.tsx. Add an entry here when a new
// `iconKey` is used in src/components/layout/nav-structure.ts.
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Briefcase,
  Gamepad2,
  Image: ImageIcon,
  Link2,
  StickyNote,
  Store,
  Wrench,
};

export function NavDropdownIcon({
  iconKey,
  className,
}: {
  iconKey?: string;
  className?: string;
}) {
  const Icon = (iconKey && ICONS[iconKey]) || Wrench;
  return <Icon aria-hidden="true" className={className ?? "size-4"} />;
}
