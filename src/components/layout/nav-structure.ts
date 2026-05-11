/**
 * Shared navigation structure for desktop dropdowns + mobile sheet.
 *
 * URLs intentionally point at the CURRENT routes (`/projects`, `/gallery`,
 * `/blog`). The vocabulary swap to `/work`, `/archive`, `/logs` lands in
 * PR #59 — until then, the labels live in the new shape but the hrefs
 * still resolve to the existing pages. Sub-items that depend on URL
 * params (e.g. `/projects?category=ai-tool`) ride on the in-page filter
 * already wired up in `app/[locale]/projects/_client.tsx`.
 */

export interface NavDropdownItem {
  /** Key used for React iteration only — not user-visible. */
  id: string;
  label: string;
  href: string;
}

export interface NavDropdownGroup {
  id: string;
  label: string;
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

/**
 * Label bag the header passes in. Splitting Navigation vs Categories
 * keeps each side free of cross-namespace `t()` calls.
 */
export interface NavLabels {
  work: string;
  archive: string;
  logs: string;
  allWork: string;
  visualArchive: string;
  writing: string;
  games: string;
  media: string;
  resources: string;
  about: string;
  contact: string;
  // Categories namespace — used for /projects?category= deep links.
  categoryWebApp: string;
  categoryAiTool: string;
  categoryExperiment: string;
}

export function buildNavStructure(labels: NavLabels): NavStructure {
  return {
    groups: [
      {
        id: "work",
        label: labels.work,
        items: [
          { id: "all-work", label: labels.allWork, href: "/projects" },
          { id: "games", label: labels.games, href: "/games" },
          // Project filters ride on `?category=` already parsed by
          // app/[locale]/projects/_client.tsx — safe to deep-link.
          {
            id: "software",
            label: labels.categoryWebApp,
            href: "/projects?category=web-app",
          },
          {
            id: "ai-tools",
            label: labels.categoryAiTool,
            href: "/projects?category=ai-tool",
          },
          {
            id: "experiments",
            label: labels.categoryExperiment,
            href: "/projects?category=experiment",
          },
        ],
      },
      {
        id: "archive",
        label: labels.archive,
        items: [
          { id: "visual-archive", label: labels.visualArchive, href: "/gallery" },
          { id: "media", label: labels.media, href: "/media" },
        ],
      },
      {
        id: "logs",
        label: labels.logs,
        items: [
          { id: "writing", label: labels.writing, href: "/blog" },
          { id: "resources", label: labels.resources, href: "/resources" },
        ],
      },
    ],
    flatLinks: [
      { id: "about", label: labels.about, href: "/about" },
      { id: "contact", label: labels.contact, href: "/contact" },
    ],
  };
}
