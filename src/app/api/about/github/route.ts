import { NextResponse } from "next/server";
import { profile } from "@/content/profile";

// GitHub stats proxy — public REST API, no auth needed at this volume.
// Cached 30 min via ISR so we burn ~2 calls/hour against the unauthed
// 60/hr rate budget. Returns null on any failure so the card renders a
// graceful empty state instead of breaking the page.
export const revalidate = 1800;

export interface GithubStats {
  handle: string;
  url: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  topLanguages: string[];
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

    // Pull the user's most-recent ~30 public repos to compute total stars
    // and top languages. One page is enough — at this scale the cost is
    // identical and the surface stays small.
    const reposResponse = await fetch(
      `https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 1800 },
      },
    );
    const repos = reposResponse.ok
      ? ((await reposResponse.json()) as {
          stargazers_count?: number;
          language?: string | null;
          fork?: boolean;
        }[])
      : [];

    const ownRepos = repos.filter((repo) => !repo.fork);
    const totalStars = ownRepos.reduce(
      (sum, repo) => sum + (repo.stargazers_count ?? 0),
      0,
    );
    const languageCounts = new Map<string, number>();
    for (const repo of ownRepos) {
      if (!repo.language) continue;
      languageCounts.set(
        repo.language,
        (languageCounts.get(repo.language) ?? 0) + 1,
      );
    }
    const topLanguages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    return NextResponse.json({
      handle,
      url: user.html_url ?? `https://github.com/${handle}`,
      publicRepos: user.public_repos ?? 0,
      followers: user.followers ?? 0,
      totalStars,
      topLanguages,
    });
  } catch {
    return NextResponse.json(null);
  }
}
