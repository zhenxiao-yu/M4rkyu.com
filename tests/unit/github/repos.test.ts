import { describe, expect, it } from "vitest";

import { repoToProjectDraft, type GithubRepo } from "@/lib/github/repos";

const repo = (over: Partial<GithubRepo>): GithubRepo =>
  ({
    name: "my-cool-app",
    full_name: "zhenxiao-yu/my-cool-app",
    description: "A cool app",
    html_url: "https://github.com/zhenxiao-yu/my-cool-app",
    homepage: "https://cool.app",
    language: "TypeScript",
    topics: ["nextjs", "react"],
    created_at: "2025-03-01T00:00:00Z",
    pushed_at: "2026-01-01T00:00:00Z",
    fork: false,
    archived: false,
    stargazers_count: 7,
    owner: { login: "zhenxiao-yu" },
    ...over,
  }) as GithubRepo;

describe("repoToProjectDraft", () => {
  it("maps real repo metadata into draft fields", () => {
    const d = repoToProjectDraft(repo({}));
    expect(d.title).toBe("My Cool App");
    expect(d.slug).toBe("my-cool-app");
    expect(d.shortPitch).toBe("A cool app");
    expect(d.year).toBe("2025");
    expect(d.stack).toEqual(["TypeScript"]);
    expect(d.tags).toEqual(["nextjs", "react"]);
    expect(d.liveUrl).toBe("https://cool.app");
    expect(d.githubUrl).toBe("https://github.com/zhenxiao-yu/my-cool-app");
    expect(d.status).toBe("development");
  });

  it("never fabricates a pitch — falls back to a TODO marker", () => {
    const d = repoToProjectDraft(repo({ description: null }));
    expect(d.shortPitch).toMatch(/^TODO/);
  });

  it("drops a non-http homepage", () => {
    expect(repoToProjectDraft(repo({ homepage: "" })).liveUrl).toBe("");
    expect(repoToProjectDraft(repo({ homepage: "not-a-url" })).liveUrl).toBe(
      "",
    );
  });

  it("marks archived repos as archived", () => {
    expect(repoToProjectDraft(repo({ archived: true })).status).toBe(
      "archived",
    );
  });

  it("handles a language-less repo and missing topics", () => {
    const d = repoToProjectDraft(
      repo({ language: null, topics: undefined as unknown as string[] }),
    );
    expect(d.stack).toEqual([]);
    expect(d.tags).toEqual([]);
  });
});
