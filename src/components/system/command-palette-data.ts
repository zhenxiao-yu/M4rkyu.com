import {
  Briefcase,
  Camera,
  Clock3,
  FileText,
  Gamepad2,
  Hash,
  ListChecks,
  Mail,
  Moon,
  NotebookPen,
  Search,
  ShoppingBag,
  Sun,
  User,
  Wrench,
} from "lucide-react";

/**
 * Static command-palette data — page routes, search aliases, and the
 * light/dark theme entries. Pulled out of the component so the render
 * body reads as wiring, not a wall of literals. Pure data, no hooks.
 */

export const PAGES: { key: string; href: string; icon: typeof Briefcase }[] = [
  { key: "search", href: "/search", icon: Search },
  { key: "work", href: "/work", icon: Briefcase },
  { key: "games", href: "/games", icon: Gamepad2 },
  { key: "gallery", href: "/archive", icon: Camera },
  { key: "shop", href: "/shop", icon: ShoppingBag },
  { key: "blog", href: "/logs", icon: FileText },
  { key: "notes", href: "/notes", icon: NotebookPen },
  { key: "topics", href: "/topics", icon: Hash },
  { key: "resources", href: "/resources", icon: Wrench },
  { key: "latest", href: "/latest", icon: Clock3 },
  { key: "changelog", href: "/changelog", icon: ListChecks },
  { key: "colophon", href: "/colophon", icon: FileText },
  { key: "about", href: "/about", icon: User },
  { key: "contact", href: "/contact", icon: Mail },
];

export const PAGE_ALIASES: Record<string, string> = {
  gallery: "archive photos frames contact sheet images",
  blog: "logs writing posts articles devlog",
  work: "projects case studies portfolio",
  resources: "tools links bookmarks utilities",
  latest: "new recent updates feed timeline",
  changelog: "release notes changes ship log updates",
  colophon: "about this site stack technology credits build",
};

export const THEMES = [
  { value: "light", icon: Sun, key: "themeLight" },
  { value: "dark", icon: Moon, key: "themeDark" },
] as const;
