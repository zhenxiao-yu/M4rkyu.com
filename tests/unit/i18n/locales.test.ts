import { describe, expect, it } from "vitest";

import { stripLocale, getNextLocale } from "@/i18n/locales";

describe("stripLocale", () => {
  it("removes a leading locale prefix at a segment boundary", () => {
    expect(stripLocale("/en/work")).toBe("/work");
    expect(stripLocale("/zh/work/nimbus")).toBe("/work/nimbus");
  });

  it("maps a bare locale to root", () => {
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/zh")).toBe("/");
  });

  it("leaves non-locale paths untouched (locale must be a full segment)", () => {
    expect(stripLocale("/work")).toBe("/work");
    expect(stripLocale("/")).toBe("/");
    expect(stripLocale("/english")).toBe("/english");
  });
});

describe("getNextLocale", () => {
  it("cycles en <-> zh", () => {
    expect(getNextLocale("en")).toBe("zh");
    expect(getNextLocale("zh")).toBe("en");
  });
});
