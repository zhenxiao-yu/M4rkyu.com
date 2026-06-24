import { describe, expect, it } from "vitest";

import {
  contentStatusSchema,
  gameSchema,
  galleryCollectionSchema,
  galleryItemSchema,
  imageSchema,
  mediaItemSchema,
  noteSchema,
  postSchema,
  profileSchema,
  projectSchema,
  resourceSchema,
  seoSchema,
  serviceSchema,
} from "@/content/schemas";

// Characterization tests for the content-layer Zod schemas. These pin the
// current contract: which fields are required, which empty strings reject,
// which fields default, and which enums are closed. They are the safety net
// for edits to src/content/schemas.ts (TD-001).

describe("seoSchema", () => {
  it("accepts a populated card", () => {
    expect(seoSchema.safeParse({ title: "Hi", description: "There" }).success).toBe(true);
  });

  it("rejects empty strings (min(1) guards blank render)", () => {
    expect(seoSchema.safeParse({ title: "", description: "x" }).success).toBe(false);
  });
});

describe("imageSchema", () => {
  it("accepts src + alt with optional LQIP fields omitted", () => {
    expect(imageSchema.safeParse({ src: "/a.jpg", alt: "alt" }).success).toBe(true);
  });

  it("accepts intrinsic dimensions + blurDataURL when present", () => {
    const parsed = imageSchema.safeParse({
      src: "/a.jpg",
      alt: "alt",
      width: 1200,
      height: 800,
      blurDataURL: "data:image/png;base64,abc",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects non-positive / non-integer width", () => {
    expect(imageSchema.safeParse({ src: "/a.jpg", alt: "alt", width: 0 }).success).toBe(false);
    expect(imageSchema.safeParse({ src: "/a.jpg", alt: "alt", width: 1.5 }).success).toBe(false);
  });

  it("rejects a missing alt (a11y contract)", () => {
    expect(imageSchema.safeParse({ src: "/a.jpg" }).success).toBe(false);
  });
});

describe("contentStatusSchema", () => {
  it("is a closed enum", () => {
    expect(contentStatusSchema.safeParse("ready").success).toBe(true);
    expect(contentStatusSchema.safeParse("published").success).toBe(false);
  });
});

describe("projectSchema", () => {
  const valid = {
    title: "Demo",
    slug: "demo",
    shortPitch: "A demo project",
    category: "web-app",
    year: "2026",
    status: "ready",
    featured: true,
    problem: "p",
    solution: "s",
    role: "Solo",
    stack: ["Next.js"],
    features: ["one"],
    architectureNotes: ["note"],
    outcome: "shipped",
    lessonsLearned: ["learned"],
    nextSteps: ["next"],
    seo: { title: "Demo", description: "A demo" },
  };

  it("accepts a minimal valid project and applies defaults", () => {
    const parsed = projectSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      // Defaulted fields are filled in even when omitted from input.
      expect(parsed.data.contentStatus).toBe("draft");
      expect(parsed.data.tags).toEqual([]);
      expect(parsed.data.challenges).toEqual([]);
      expect(parsed.data.screenshots).toEqual([]);
      expect(parsed.data.decisions).toEqual([]);
    }
  });

  it("rejects an out-of-enum category", () => {
    expect(projectSchema.safeParse({ ...valid, category: "mobile-app" }).success).toBe(false);
  });

  it("rejects a non-URL liveUrl", () => {
    expect(projectSchema.safeParse({ ...valid, liveUrl: "not-a-url" }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const withoutOutcome: Record<string, unknown> = { ...valid };
    delete withoutOutcome.outcome;
    expect(projectSchema.safeParse(withoutOutcome).success).toBe(false);
  });
});

describe("profileSchema", () => {
  const valid = {
    name: "Mark",
    title: "Builder",
    location: "Earth",
    email: "mark@example.com",
    intro: "hi",
    timeline: [{ label: "Now", detail: "building", date: "2026" }],
    values: ["craft"],
  };

  it("accepts a minimal valid profile and defaults the optional collections", () => {
    const parsed = profileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.socials).toEqual({});
      expect(parsed.data.skills).toEqual([]);
      expect(parsed.data.cities).toEqual([]);
    }
  });

  it("rejects an invalid email", () => {
    expect(profileSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects out-of-range city coordinates", () => {
    const parsed = profileSchema.safeParse({
      ...valid,
      cities: [{ name: "X", country: "Y", lat: 200, lng: 0 }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("galleryCollectionSchema", () => {
  const valid = {
    title: "Roll 1",
    slug: "roll-1",
    description: "First roll",
    cover: { src: "/c.jpg", alt: "cover" },
    count: 12,
  };

  it("accepts a valid collection and defaults status to placeholder", () => {
    const parsed = galleryCollectionSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("placeholder");
      expect(parsed.data.cover.focal).toBe("center");
      expect(parsed.data.featured).toBe(false);
    }
  });

  it("rejects a cover image missing its alt", () => {
    expect(
      galleryCollectionSchema.safeParse({ ...valid, cover: { src: "/c.jpg" } }).success,
    ).toBe(false);
  });
});

describe("galleryItemSchema", () => {
  const valid = {
    title: "Frame",
    slug: "frame",
    collection: "roll-1",
    type: "image",
    status: "ready",
    caption: "A frame",
  };

  it("accepts a valid item and defaults aspect to 4/5", () => {
    const parsed = galleryItemSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.aspect).toBe("4/5");
  });

  it("rejects an unsupported aspect ratio", () => {
    expect(galleryItemSchema.safeParse({ ...valid, aspect: "5/4" }).success).toBe(false);
  });

  it("rejects an out-of-enum type", () => {
    expect(galleryItemSchema.safeParse({ ...valid, type: "gif" }).success).toBe(false);
  });
});

describe("resourceSchema", () => {
  const valid = {
    name: "Tool",
    slug: "tool",
    category: "Design",
    description: "Does things",
    why: "Useful",
    link: "https://example.com",
    pricing: "Free",
    tags: ["design"],
  };

  it("accepts a valid resource and defaults type to link", () => {
    const parsed = resourceSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("link");
      expect(parsed.data.status).toBe("placeholder");
    }
  });

  it("requires link to be a URL", () => {
    expect(resourceSchema.safeParse({ ...valid, link: "/relative" }).success).toBe(false);
  });
});

describe("postSchema", () => {
  const valid = {
    title: "Post",
    slug: "post",
    category: "Eng",
    excerpt: "Short",
    date: "2026-01-01",
    readingTime: "3 min",
    tags: ["eng"],
    status: "ready",
  };

  it("accepts a valid post and zero-defaults the engagement counts", () => {
    const parsed = postSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reactionsCount).toBe(0);
      expect(parsed.data.commentsCount).toBe(0);
      expect(parsed.data.pinned).toBe(false);
    }
  });

  it("rejects a negative reactionsCount", () => {
    expect(postSchema.safeParse({ ...valid, reactionsCount: -1 }).success).toBe(false);
  });

  it("rejects a non-URL canonicalUrl", () => {
    expect(postSchema.safeParse({ ...valid, canonicalUrl: "devto" }).success).toBe(false);
  });
});

describe("gameSchema", () => {
  const valid = {
    title: "Game",
    slug: "game",
    engine: "Unity",
    year: "2026",
    status: "ready",
    pitch: "Fun",
    role: "Dev",
    notes: ["note"],
  };

  it("accepts a valid game and defaults the optional arrays", () => {
    const parsed = gameSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.platforms).toEqual([]);
      expect(parsed.data.buildLinks).toEqual([]);
      expect(parsed.data.screenshots).toEqual([]);
      expect(parsed.data.decisions).toEqual([]);
    }
  });

  it("rejects a build link with a non-URL", () => {
    const parsed = gameSchema.safeParse({
      ...valid,
      buildLinks: [{ label: "itch", url: "itch.io" }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("mediaItemSchema", () => {
  const valid = {
    title: "Reel",
    slug: "reel",
    format: "reel",
    status: "ready",
    description: "A reel",
  };

  it("accepts a valid media item", () => {
    expect(mediaItemSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an out-of-enum format", () => {
    expect(mediaItemSchema.safeParse({ ...valid, format: "gif" }).success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("accepts a valid service", () => {
    const parsed = serviceSchema.safeParse({
      title: "Build",
      slug: "build",
      description: "I build",
      fit: ["startups"],
      status: "ready",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a missing fit array", () => {
    expect(
      serviceSchema.safeParse({ title: "B", slug: "b", description: "d", status: "ready" }).success,
    ).toBe(false);
  });
});

describe("noteSchema", () => {
  const valid = {
    slug: "note-1",
    publishedAt: "2026-01-01",
  };

  it("accepts a terse update with kind/title/body defaulted", () => {
    const parsed = noteSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.kind).toBe("note");
      expect(parsed.data.title).toBe("");
      expect(parsed.data.body).toBe("");
      expect(parsed.data.tiers).toEqual([]);
    }
  });

  it("rejects a rating outside 0–5", () => {
    expect(noteSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });

  it("rejects an out-of-enum kind", () => {
    expect(noteSchema.safeParse({ ...valid, kind: "poll" }).success).toBe(false);
  });

  it("requires publishedAt for feed ordering", () => {
    expect(noteSchema.safeParse({ slug: "x" }).success).toBe(false);
  });
});
