import { describe, expect, it } from "vitest";

import { buildAlternates } from "@/lib/seo/alternates";

describe("buildAlternates", () => {
  it("sets canonical to the active-locale path", () => {
    expect(buildAlternates("en", "/work/nimbus").canonical).toBe(
      "/en/work/nimbus",
    );
    expect(buildAlternates("zh", "").canonical).toBe("/zh");
  });

  it("emits a self-referential hreflang for every locale", () => {
    const { languages } = buildAlternates("en", "/notes");
    expect(languages).toEqual({ en: "/en/notes", zh: "/zh/notes" });
  });

  it("includes the RSS + JSON feed alternates", () => {
    const { types } = buildAlternates("en", "");
    expect(types["application/rss+xml"]).toBe("/feed.xml");
    expect(types["application/feed+json"]).toBe("/feed.json");
  });
});
