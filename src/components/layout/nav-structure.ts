// Shared nav structure for desktop dropdowns + mobile sheet. Each group has its own `href` so the parent label navigates to its primary destination; the dropdown is secondary disclosure.

export interface NavDropdownItem {
  id: string;
  label: string;
  href: string;
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
  games: string;
  gallery: string;
  archive: string;
  shop: string;
  logs: string;
  blogs: string;
  notes: string;
  resources: string;
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
          { id: "work", label: labels.work, href: "/work" },
          { id: "games", label: labels.games, href: "/games" },
        ],
      },
      {
        id: "gallery",
        label: labels.gallery,
        href: "/archive",
        items: [
          { id: "archive", label: labels.archive, href: "/archive" },
          { id: "shop", label: labels.shop, href: "/shop" },
        ],
      },
      {
        id: "logs",
        label: labels.logs,
        href: "/logs",
        items: [
          { id: "blogs", label: labels.blogs, href: "/logs" },
          { id: "notes", label: labels.notes, href: "/notes" },
        ],
      },
    ],
    flatLinks: [
      { id: "resources", label: labels.resources, href: "/resources" },
      { id: "about", label: labels.about, href: "/about" },
      { id: "contact", label: labels.contact, href: "/contact" },
    ],
  };
}
