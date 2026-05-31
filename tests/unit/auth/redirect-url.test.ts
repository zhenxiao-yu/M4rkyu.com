import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveSiteOrigin, sanitizeNextPath } from "@/lib/auth/redirect-url";

// Characterization tests for the auth redirect-safety helpers (TD-001,
// slice B). `sanitizeNextPath` is the open-redirect guard applied to every
// `?next=` value in the auth flow, so its contract is security-load-bearing
// — these tests pin exactly which targets it accepts and rejects.

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sanitizeNextPath", () => {
  it("passes through a same-origin absolute path", () => {
    expect(sanitizeNextPath("/en/account")).toBe("/en/account");
    expect(sanitizeNextPath("/work/demo?tab=spec")).toBe("/work/demo?tab=spec");
  });

  it("rejects protocol-relative URLs (//evil.example)", () => {
    expect(sanitizeNextPath("//evil.example")).toBe("/");
    expect(sanitizeNextPath("//evil.example/path")).toBe("/");
  });

  it("rejects backslash-prefixed paths (/\\evil.example)", () => {
    expect(sanitizeNextPath("/\\evil.example")).toBe("/");
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(sanitizeNextPath("https://evil.example")).toBe("/");
    expect(sanitizeNextPath("http://evil.example/login")).toBe("/");
  });

  it("rejects anything not starting with a slash", () => {
    expect(sanitizeNextPath("account")).toBe("/");
    expect(sanitizeNextPath("")).toBe("/");
    expect(sanitizeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("honors a custom fallback when the target is unsafe", () => {
    expect(sanitizeNextPath("//evil.example", "/en")).toBe("/en");
    expect(sanitizeNextPath("not-a-path", "/en/account")).toBe("/en/account");
  });
});

describe("resolveSiteOrigin", () => {
  it("prefers the request origin and strips a trailing slash", () => {
    expect(resolveSiteOrigin("https://m4rkyu.com/")).toBe("https://m4rkyu.com");
    expect(resolveSiteOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("derives an https origin from VERCEL_URL when no request origin is given", () => {
    vi.stubEnv("VERCEL_URL", "preview-abc.vercel.app");
    expect(resolveSiteOrigin()).toBe("https://preview-abc.vercel.app");
  });

  it("falls back to localhost when nothing is configured", () => {
    // NEXT_PUBLIC_SITE_URL is unset in the test env; null out VERCEL_URL too.
    vi.stubEnv("VERCEL_URL", "");
    expect(resolveSiteOrigin()).toBe("http://localhost:3000");
  });
});
