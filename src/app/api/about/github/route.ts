import { NextResponse } from "next/server";
import { profile } from "@/content/profile";

// GitHub stats + charts proxy — public REST API, no auth needed.
// ISR-cached 30 min. Returns null on any failure so cards render a
// graceful empty state instead of breaking the page.
//
// Per-window request budget:
//   1 user + 1 repos + up to 10 language fetches + 1 events page
//   = ~13 req / 30 min → ~26 / hr peak. Well under the unauth 60 / hr / IP.
export const revalidate = 1800;

const CHART_REPO_LIMIT = 10;
const ACTIVITY_WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface LanguageByteSlice {
  name: string;
  bytes: number;
}

export interface GithubStats {
  handle: string;
  url: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  topLanguages: string[];
  latestActivityAt?: string;
  recentCommitCount: number;
  recentlyActiveRepos: string[];
  // Trailing 8-week commit totals across recent public PushEvent
  // activity. Index 0 = oldest of the 8, index 7 = the current week.
  weeklyCommits: number[];
  // Top 6 languages by total bytes across the most-recently updated
  // own repos.
  languageBytes: LanguageByteSlice[];
}

interface PushEvent {
  type?: string;
  created_at?: string;
  repo?: { name?: string };
  payload?: { commits?: unknown[] };
}

export async function GET(): Promise<NextResponse<GithubStats | null>> {
  const handle = profile.githubHandle;
  if (!handle) return NextResponse.json(null);

  try {
    const userResponse = await fetch(`https://api.github.com/users/${handle}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 1800 },
    });
    if (!userResponse.ok) return NextResponse.json(null);
    const user = (await userResponse.json()) as {
      public_repos?: number;
      followers?: number;
      html_url?: string;
    };

    const reposResponse = await fetch(
      `https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 1800 },
      },
    );
    const repos = reposResponse.ok
      ? ((await reposResponse.json()) as {
          name?: string;
          stargazers_count?: number;
          language?: string | null;
          fork?: boolean;
          owner?: { login?: string };
        }[])
      : [];

    const ownRepos = repos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce(
      (sum, r) => sum + (r.stargazers_count ?? 0),
      0,
    );

    const languageCounts = new Map<string, number>();
    for (const r of ownRepos) {
      if (!r.language) continue;
      languageCounts.set(
        r.language,
        (languageCounts.get(r.language) ?? 0) + 1,
      );
    }
    const topLanguages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    const chartRepos = ownRepos
      .filter((r): r is { name: string; owner: { login: string } } =>
        Boolean(r.name && r.owner?.login),
      )
      .slice(0, CHART_REPO_LIMIT);

    // Languages and events fetched in parallel. Events comes from the
    // public-events endpoint (single request, no async-202 dance like
    // /stats/commit-activity has).
    const [langResults, events] = await Promise.all([
      Promise.all(
        chartRepos.map((r) =>
          fetch(
            `https://api.github.com/repos/${r.owner.login}/${r.name}/languages`,
            {
              headers: { Accept: "application/vnd.github+json" },
              next: { revalidate: 1800 },
            },
          )
            .then((res) =>
              res.ok
                ? (res.json() as Promise<Record<string, number>>)
                : ({} as Record<string, number>),
            )
            .catch(() => ({}) as Record<string, number>),
        ),
      ),
      fetch(
        `https://api.github.com/users/${handle}/events/public?per_page=100`,
        {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 1800 },
        },
      )
        .then((res) =>
          res.ok ? (res.json() as Promise<PushEvent[]>) : ([] as PushEvent[]),
        )
        .catch(() => [] as PushEvent[]),
    ]);

    const langTotals = new Map<string, number>();
    for (const langs of langResults) {
      for (const [name, bytes] of Object.entries(langs)) {
        langTotals.set(name, (langTotals.get(name) ?? 0) + bytes);
      }
    }
    const languageBytes: LanguageByteSlice[] = Array.from(langTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, bytes]) => ({ name, bytes }));

    // Bucket PushEvent commits into the trailing 8 weeks.
    const now = Date.now();
    const weeklyCommits = Array.from({ length: ACTIVITY_WEEKS }, () => 0);
    const recentlyActiveRepos: string[] = [];
    let latestActivityAt: string | undefined;
    for (const e of events) {
      if (!latestActivityAt && e.created_at) {
        latestActivityAt = e.created_at;
      }
      const repoName = e.repo?.name?.replace(`${handle}/`, "");
      if (
        repoName &&
        e.repo?.name?.startsWith(`${handle}/`) &&
        !recentlyActiveRepos.includes(repoName)
      ) {
        recentlyActiveRepos.push(repoName);
      }
      if (e.type !== "PushEvent" || !e.created_at) continue;
      const ts = Date.parse(e.created_at);
      if (Number.isNaN(ts)) continue;
      const weeksAgo = Math.floor((now - ts) / WEEK_MS);
      if (weeksAgo < 0 || weeksAgo >= ACTIVITY_WEEKS) continue;
      const idx = ACTIVITY_WEEKS - 1 - weeksAgo;
      const commitCount = Array.isArray(e.payload?.commits)
        ? e.payload.commits.length
        : 0;
      weeklyCommits[idx] += commitCount;
    }
    const recentCommitCount = weeklyCommits.reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      handle,
      url: user.html_url ?? `https://github.com/${handle}`,
      publicRepos: user.public_repos ?? 0,
      followers: user.followers ?? 0,
      totalStars,
      topLanguages,
      latestActivityAt,
      recentCommitCount,
      recentlyActiveRepos: recentlyActiveRepos.slice(0, 3),
      weeklyCommits,
      languageBytes,
    });
  } catch {
    return NextResponse.json(null);
  }
}
