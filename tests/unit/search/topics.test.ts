import { describe, expect, it } from "vitest";

import {
  buildTopicIndex,
  slugifyTag,
  MIN_TOPIC_SIZE,
} from "@/lib/search/topics";
import type { SearchDoc } from "@/lib/search/catalog";

const doc = (id: string, tags: string[]): SearchDoc => ({
  id,
  type: "note",
  title: id,
  description: id,
  href: `/notes#${id}`,
  tags,
});

describe("slugifyTag", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyTag("React Server Components")).toBe(
      "react-server-components",
    );
  });

  it("collapses punctuation and trims stray hyphens", () => {
    expect(slugifyTag("  C++ / Rust!  ")).toBe("c-rust");
    expect(slugifyTag("web-app")).toBe("web-app");
  });
});

describe("buildTopicIndex", () => {
  it("drops tags below MIN_TOPIC_SIZE", () => {
    const topics = buildTopicIndex([
      doc("a", ["solo"]),
      doc("b", ["shared"]),
      doc("c", ["shared"]),
    ]);
    expect(MIN_TOPIC_SIZE).toBe(2);
    expect(topics.map((t) => t.slug)).toEqual(["shared"]);
    expect(topics[0].docs).toHaveLength(2);
  });

  it("merges case/format variants under one slug, keeping first-seen label", () => {
    const topics = buildTopicIndex([
      doc("a", ["React"]),
      doc("b", ["react"]),
    ]);
    expect(topics).toHaveLength(1);
    expect(topics[0].slug).toBe("react");
    expect(topics[0].label).toBe("React");
    expect(topics[0].docs).toHaveLength(2);
  });

  it("never lists a doc twice even if two of its tags collide on a slug", () => {
    const topics = buildTopicIndex([
      doc("a", ["AI", "a.i."]),
      doc("b", ["AI"]),
    ]);
    const ai = topics.find((t) => t.slug === "ai");
    expect(ai?.docs).toHaveLength(2);
  });

  it("sorts by size desc then label", () => {
    const topics = buildTopicIndex([
      doc("a", ["big", "zeta"]),
      doc("b", ["big", "zeta"]),
      doc("c", ["big"]),
      doc("d", ["alpha"]),
      doc("e", ["alpha"]),
    ]);
    expect(topics.map((t) => t.slug)).toEqual(["big", "alpha", "zeta"]);
  });
});
