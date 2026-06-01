import { describe, expect, it } from "vitest";

import {
  assembleFeed,
  firstLine,
  toIso,
  FEED_LIMIT,
} from "@/lib/feed/assemble";
import type { Note, Post } from "@/content/schemas";

const note = (over: Partial<Note>): Note =>
  ({
    slug: "n",
    title: "",
    body: "first line\nsecond line",
    publishedAt: "2026-01-01T00:00:00.000Z",
    tags: ["ideas"],
    ...over,
  }) as unknown as Note;

const post = (over: Partial<Post>): Post =>
  ({
    slug: "p",
    title: "A Post",
    excerpt: "summary",
    publishedAt: "2026-02-01T00:00:00.000Z",
    date: "Feb 1",
    tags: ["css"],
    ...over,
  }) as unknown as Post;

describe("firstLine", () => {
  it("returns the first non-empty line", () => {
    expect(firstLine("\n\n  hello \nworld")).toBe("hello");
  });
});

describe("toIso", () => {
  it("normalizes parseable dates and rejects junk", () => {
    expect(toIso("2026-02-01")).toBe("2026-02-01T00:00:00.000Z");
    expect(toIso("not a date")).toBeUndefined();
    expect(toIso(undefined)).toBeUndefined();
  });
});

describe("assembleFeed", () => {
  it("merges notes + posts newest-first", () => {
    const feed = assembleFeed({
      notes: [note({ slug: "old", publishedAt: "2026-01-01T00:00:00.000Z" })],
      posts: [post({ slug: "new", publishedAt: "2026-03-01T00:00:00.000Z" })],
    });
    expect(feed.map((i) => i.id)).toEqual(["log:new", "note:old"]);
  });

  it("falls back to the first body line when a note has no title", () => {
    const feed = assembleFeed({
      notes: [note({ title: "", body: "untitled thought\nmore" })],
      posts: [],
    });
    expect(feed[0].title).toBe("untitled thought");
  });

  it("passes through a post cover image; notes carry none", () => {
    const feed = assembleFeed({
      notes: [note({ slug: "n" })],
      posts: [
        post({
          slug: "p",
          coverImage: { src: "https://img/cover.jpg", alt: "x" },
        } as Partial<Post>),
      ],
    });
    expect(feed.find((i) => i.id === "log:p")?.image).toBe(
      "https://img/cover.jpg",
    );
    expect(feed.find((i) => i.id === "note:n")?.image).toBeUndefined();
  });

  it("caps the feed at FEED_LIMIT items", () => {
    const posts = Array.from({ length: FEED_LIMIT + 5 }, (_, i) =>
      post({
        slug: `p${i}`,
        publishedAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      }),
    );
    expect(assembleFeed({ notes: [], posts })).toHaveLength(FEED_LIMIT);
  });
});
