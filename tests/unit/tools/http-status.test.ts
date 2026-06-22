import { describe, expect, it } from "vitest";

import {
  HTTP_STATUSES,
  classOf,
  filterStatuses,
  groupByClass,
} from "@/lib/tools/http-status";

describe("filterStatuses", () => {
  it("returns the full list for empty / whitespace-only queries", () => {
    expect(filterStatuses(HTTP_STATUSES, "")).toHaveLength(HTTP_STATUSES.length);
    expect(filterStatuses(HTTP_STATUSES, "   ")).toHaveLength(HTTP_STATUSES.length);
  });

  it("returns a copy, never the original array reference", () => {
    const result = filterStatuses(HTTP_STATUSES, "");
    expect(result).not.toBe(HTTP_STATUSES);
    expect(result).toEqual([...HTTP_STATUSES]);
  });

  it("matches by code substring", () => {
    const result = filterStatuses(HTTP_STATUSES, "404");
    expect(result).toEqual([{ code: 404, name: "Not Found", description: expect.any(String) }]);
  });

  it("matches a leading code digit across a whole class", () => {
    const result = filterStatuses(HTTP_STATUSES, "5");
    expect(result.every((s) => String(s.code).includes("5"))).toBe(true);
    expect(result.some((s) => s.code === 500)).toBe(true);
  });

  it("is case-insensitive on name and description", () => {
    expect(filterStatuses(HTTP_STATUSES, "not found")).toContainEqual(
      expect.objectContaining({ code: 404 }),
    );
    expect(filterStatuses(HTTP_STATUSES, "NOT FOUND")).toContainEqual(
      expect.objectContaining({ code: 404 }),
    );
    expect(filterStatuses(HTTP_STATUSES, "teapot")).toContainEqual(
      expect.objectContaining({ code: 418 }),
    );
  });

  it("does not crash on regex-special input and matches it literally", () => {
    // None of these are valid in any code/name/description, so they yield [] —
    // the point is they must not throw the way new RegExp(query) would.
    for (const evil of ["(", "[", "*", "\\", "404)", "5{2}", "a[b", "(?:"]) {
      expect(() => filterStatuses(HTTP_STATUSES, evil)).not.toThrow();
      expect(filterStatuses(HTTP_STATUSES, evil)).toEqual([]);
    }
  });

  it("matches a literal apostrophe in a reason phrase", () => {
    // 418 "I'm a teapot" — a literal apostrophe substring, no regex escaping.
    expect(filterStatuses(HTTP_STATUSES, "i'm")).toContainEqual(
      expect.objectContaining({ code: 418 }),
    );
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterStatuses(HTTP_STATUSES, "definitely-not-a-status")).toEqual([]);
  });
});

describe("classOf", () => {
  it("maps each class to its key and tone", () => {
    expect(classOf(100)).toEqual({ key: "1xx", tone: "informational" });
    expect(classOf(200)).toEqual({ key: "2xx", tone: "success" });
    expect(classOf(301)).toEqual({ key: "3xx", tone: "redirection" });
    expect(classOf(404)).toEqual({ key: "4xx", tone: "clientError" });
    expect(classOf(503)).toEqual({ key: "5xx", tone: "serverError" });
  });
});

describe("groupByClass", () => {
  it("buckets the full list into classes in 1xx→5xx order", () => {
    const groups = groupByClass(HTTP_STATUSES);
    expect(groups.map((g) => g.meta.key)).toEqual(["1xx", "2xx", "3xx", "4xx", "5xx"]);
  });

  it("drops classes with no members", () => {
    const groups = groupByClass(filterStatuses(HTTP_STATUSES, "404"));
    expect(groups.map((g) => g.meta.key)).toEqual(["4xx"]);
  });

  it("preserves input order within each class", () => {
    const groups = groupByClass(HTTP_STATUSES);
    const twoXX = groups.find((g) => g.meta.key === "2xx");
    expect(twoXX?.statuses.map((s) => s.code)).toEqual([200, 201, 202, 204, 206]);
  });

  it("returns no groups for an empty filtered list", () => {
    expect(groupByClass([])).toEqual([]);
  });
});
