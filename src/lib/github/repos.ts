// Public GitHub repo reader for the projects sync flow. Same tokenless
// REST pattern as /api/about/github. No server-only import: the pure
// mapper (repoToProjectDraft) is unit-tested, and the fetchers just call
// `fetch`, so the whole module stays importable in a node test env. An
// optional GITHUB_TOKEN (passed by the caller) lifts rate limits.

const API = "https://api.github.com";

export interface GithubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  created_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  owner: { login: string };
}

function authHeaders(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * The owner's own repos (forks excluded — they aren't portfolio work),
 * most-recently-pushed first. Returns [] on any failure so the admin
 * screen degrades to an empty list rather than throwing.
 */
export async function fetchUserRepos(
  handle: string,
  token?: string,
): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `${API}/users/${handle}/repos?per_page=100&sort=pushed`,
      { headers: authHeaders(token), next: { revalidate: 900 } },
    );
    if (!res.ok) return [];
    const repos = (await res.json()) as GithubRepo[];
    return Array.isArray(repos) ? repos.filter((r) => !r.fork) : [];
  } catch {
    return [];
  }
}

/** Raw README markdown for a repo, or null when absent/unreadable. */
export async function fetchRepoReadme(
  owner: string,
  repo: string,
  token?: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: "application/vnd.github.raw+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** A repo mapped into editable project-draft fields (owner curates before publish). */
export interface ProjectDraft {
  title: string;
  slug: string;
  shortPitch: string;
  category: string;
  year: string;
  status: string;
  stack: string[];
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  stars: number;
}

const TODO = "TODO — replace with real copy before publishing.";

/** "my-cool-app" / "my_cool_app" → "My Cool App". */
function humanizeTitle(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pure mapping from a repo to a project draft. Only real, owner-authored
 * data is auto-filled (name, description, language, topics, links, year);
 * narrative case-study fields are left for the {@link createProjectAction}
 * defaults to mark TODO — nothing is fabricated. `contentStatus` is always
 * draft, so an imported project never goes public until curated.
 */
export function repoToProjectDraft(repo: GithubRepo): ProjectDraft {
  const created = new Date(repo.created_at);
  const homepage = repo.homepage?.trim();
  return {
    title: humanizeTitle(repo.name),
    slug: slugify(repo.name),
    shortPitch: repo.description?.trim() || TODO,
    category: "experiment",
    year: Number.isNaN(created.getTime())
      ? ""
      : String(created.getFullYear()),
    status: repo.archived ? "archived" : "development",
    stack: repo.language ? [repo.language] : [],
    tags: Array.isArray(repo.topics) ? repo.topics : [],
    liveUrl: homepage && /^https?:\/\//.test(homepage) ? homepage : "",
    githubUrl: repo.html_url,
    stars: repo.stargazers_count ?? 0,
  };
}
