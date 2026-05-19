// Shared nav structure for desktop dropdowns + mobile sheet. Each
// group has its own `href` so the parent label navigates to its
// primary destination; the dropdown is secondary disclosure.
// `iconKey` resolves to a lucide icon via the static map in
// `nav-dropdown-icon.tsx` — keeps the import graph tree-shakable.

export interface NavDropdownItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  iconKey?: string;
}

export interface NavDropdownGroup {
  id: string;
  label: string;
  // Primary destination when the group's label is clicked.
  href: string;
  items: NavDropdownItem[];
}

export interface NavFlatLink {
  id: string;
  label: string;
  href: string;
}

export interface NavStructure {
  groups: NavDropdownGroup[];
  flatLinks: NavFlatLink[];
}

// Label bag passed in by the header — desktop/mobile/palette stay free of next-intl `t()` plumbing.
export interface NavLabels {
  projects: string;
  work: string;
  workDescription: string;
  games: string;
  gamesDescription: string;
  gallery: string;
  archive: string;
  archiveDescription: string;
  shop: string;
  shopDescription: string;
  logs: string;
  blogs: string;
  blogsDescription: string;
  notes: string;
  notesDescription: string;
  resources: string;
  tools: string;
  toolsDescription: string;
  links: string;
  linksDescription: string;
  about: string;
  contact: string;
}

export function buildNavStructure(labels: NavLabels): NavStructure {
  return {
    groups: [
      {
        id: "projects",
        label: labels.projects,
        href: "/work",
        items: [
          {
            id: "work",
            label: labels.work,
            href: "/work",
            description: labels.workDescription,
            iconKey: "Briefcase",
          },
          {
            id: "games",
            label: labels.games,
            href: "/games",
            description: labels.gamesDescription,
            iconKey: "Gamepad2",
          },
        ],
      },
      {
        id: "gallery",
        label: labels.gallery,
        href: "/archive",
        items: [
          {
            id: "archive",
            label: labels.archive,
            href: "/archive",
            description: labels.archiveDescription,
            iconKey: "Image",
          },
          {
            id: "shop",
            label: labels.shop,
            href: "/shop",
            description: labels.shopDescription,
            iconKey: "Store",
          },
        ],
      },
      {
        id: "logs",
        label: labels.logs,
        href: "/logs",
        items: [
          {
            id: "blogs",
            label: labels.blogs,
            href: "/logs",
            description: labels.blogsDescription,
            iconKey: "BookOpen",
          },
          {
            id: "notes",
            label: labels.notes,
            href: "/notes",
            description: labels.notesDescription,
            iconKey: "StickyNote",
          },
        ],
      },
      {
        id: "resources",
        label: labels.resources,
        href: "/resources",
        items: [
          {
            id: "tools",
            label: labels.tools,
            href: "/resources/tools",
            description: labels.toolsDescription,
            iconKey: "Wrench",
          },
          {
            id: "links",
            label: labels.links,
            href: "/resources/links",
            description: labels.linksDescription,
            iconKey: "Link2",
          },
        ],
      },
    ],
    flatLinks: [
      { id: "about", label: labels.about, href: "/about" },
      { id: "contact", label: labels.contact, href: "/contact" },
    ],
  };
}
