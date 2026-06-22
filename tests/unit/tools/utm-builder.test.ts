import { describe, expect, it } from "vitest";

import { buildUtmUrl } from "@/lib/tools/utm-builder";

describe("buildUtmUrl", () => {
  it("appends UTM params to a bare base URL", () => {
    const result = buildUtmUrl("https://m4rkyu.com/work", {
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const url = new URL(result.url);
    expect(url.searchParams.get("utm_source")).toBe("newsletter");
    expect(url.searchParams.get("utm_medium")).toBe("email");
    expect(url.searchParams.get("utm_campaign")).toBe("spring");
  });

  it("percent-encodes special characters in param values", () => {
    const result = buildUtmUrl("https://m4rkyu.com/", {
      utm_campaign: "summer sale & more",
      utm_term: "a=b?c#d",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Spaces, &, ?, # must be escaped — never leak into the raw query.
    expect(result.url).not.toContain("summer sale & more");
    expect(result.url).toContain("utm_campaign=summer+sale+%26+more");
    expect(result.url).toContain("utm_term=a%3Db%3Fc%23d");
    // Round-trips back to the original value.
    expect(new URL(result.url).searchParams.get("utm_campaign")).toBe(
      "summer sale & more",
    );
  });

  it("merges UTM params into an existing query string without a double ?", () => {
    const result = buildUtmUrl("https://m4rkyu.com/work?ref=abc", {
      utm_source: "twitter",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.url.match(/\?/g)).toHaveLength(1);
    const url = new URL(result.url);
    expect(url.searchParams.get("ref")).toBe("abc");
    expect(url.searchParams.get("utm_source")).toBe("twitter");
  });

  it("overwrites a colliding UTM key instead of duplicating it (idempotent)", () => {
    const result = buildUtmUrl("https://m4rkyu.com/?utm_source=old", {
      utm_source: "new",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const matches = result.url.match(/utm_source=/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(new URL(result.url).searchParams.get("utm_source")).toBe("new");
  });

  it("omits empty and whitespace-only params, and trims values", () => {
    const result = buildUtmUrl("https://m4rkyu.com/", {
      utm_source: "  google  ",
      utm_medium: "",
      utm_campaign: "   ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const url = new URL(result.url);
    expect(url.searchParams.get("utm_source")).toBe("google");
    expect(url.searchParams.has("utm_medium")).toBe(false);
    expect(url.searchParams.has("utm_campaign")).toBe(false);
  });

  it("drops a cleared UTM key already present on the base URL", () => {
    const result = buildUtmUrl("https://m4rkyu.com/?utm_medium=email", {
      utm_medium: "",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.url).searchParams.has("utm_medium")).toBe(false);
  });

  it("returns ok with no params (passes the base through, normalized)", () => {
    const result = buildUtmUrl("https://m4rkyu.com/work");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.url).toBe("https://m4rkyu.com/work");
  });

  it("rejects invalid, relative, and non-http(s) bases", () => {
    expect(buildUtmUrl("")).toEqual({ ok: false });
    expect(buildUtmUrl("not a url")).toEqual({ ok: false });
    expect(buildUtmUrl("/work")).toEqual({ ok: false });
    expect(buildUtmUrl("m4rkyu.com/work")).toEqual({ ok: false });
    expect(buildUtmUrl("mailto:hi@m4rkyu.com")).toEqual({ ok: false });
    expect(buildUtmUrl("javascript:alert(1)")).toEqual({ ok: false });
  });
});
