import { describe, expect, it } from "vitest";

import { formatSql } from "@/lib/tools/sql-formatter";

describe("formatSql — empty / whitespace input", () => {
  it("flags empty input as empty, not an error", () => {
    const r = formatSql("");
    expect(r.empty).toBe(true);
    expect(r.fallback).toBe(false);
    expect(r.output).toBe("");
  });

  it("treats whitespace-only input as empty", () => {
    expect(formatSql("   \n\t ").empty).toBe(true);
  });
});

describe("formatSql — predictable SELECT with WHERE/JOIN", () => {
  const input =
    "select id, name from users u join posts p on p.user_id = u.id where u.active = true order by id desc limit 10;";
  const result = formatSql(input);

  it("does not fall back on well-formed SQL", () => {
    expect(result.fallback).toBe(false);
    expect(result.empty).toBe(false);
  });

  it("uppercases reserved keywords by default", () => {
    expect(result.output).toContain("SELECT");
    expect(result.output).toContain("FROM");
    expect(result.output).toContain("JOIN");
    expect(result.output).toContain("WHERE");
    expect(result.output).toContain("ORDER BY");
    // a non-keyword identifier keeps its original case
    expect(result.output).toContain("users");
  });

  it("breaks before major clauses onto their own lines", () => {
    const lines = result.output.split("\n");
    expect(lines.some((l) => l.startsWith("SELECT"))).toBe(true);
    expect(lines.some((l) => l.startsWith("FROM"))).toBe(true);
    expect(lines.some((l) => l.startsWith("JOIN"))).toBe(true);
    expect(lines.some((l) => l.startsWith("WHERE"))).toBe(true);
  });

  it("ends with exactly one terminating semicolon", () => {
    expect(result.output.endsWith(";")).toBe(true);
    expect(result.output.endsWith(";;")).toBe(false);
  });

  it("puts each comma-separated column on its own indented line", () => {
    expect(result.output).toContain(",\n  name");
  });
});

describe("formatSql — keyword case option", () => {
  it("lowercases keywords when keywordCase is lower", () => {
    const r = formatSql("SELECT 1", { keywordCase: "lower" });
    expect(r.output).toContain("select");
    expect(r.output).not.toContain("SELECT");
  });

  it("preserves original keyword case when keywordCase is preserve", () => {
    const r = formatSql("SeLeCt 1", { keywordCase: "preserve" });
    expect(r.output).toContain("SeLeCt");
  });
});

describe("formatSql — indent option", () => {
  it("honours a custom indent size for comma items", () => {
    const r = formatSql("select a, b from t", { indentSize: 4 });
    expect(r.output).toContain(",\n    b");
  });
});

describe("formatSql — literals and comments are preserved", () => {
  it("does not re-case keywords inside string literals", () => {
    const r = formatSql("select 'from where select' as label");
    expect(r.output).toContain("'from where select'");
  });

  it("keeps line comments verbatim", () => {
    const r = formatSql("select 1 -- pick from the table");
    expect(r.output).toContain("-- pick from the table");
  });

  it("keeps block comments verbatim", () => {
    const r = formatSql("select /* inner join note */ 1");
    expect(r.output).toContain("/* inner join note */");
  });
});

describe("formatSql — malformed / partial SQL never throws", () => {
  for (const sample of [
    "select * from",
    "(((",
    ")))",
    "select 'unterminated string",
    "/* unterminated block comment select from",
    "select , , , from where",
    "SELECT".repeat(2000),
    "你好 select from 世界",
    "😀 ; ;; ;;;",
  ]) {
    it(`does not throw on: ${JSON.stringify(sample.slice(0, 24))}…`, () => {
      expect(() => formatSql(sample)).not.toThrow();
      const r = formatSql(sample);
      expect(typeof r.output).toBe("string");
    });
  }
});
