import { describe, expect, it } from "vitest";

import { parseCron } from "@/lib/tools/cron";

describe("parseCron — valid expressions", () => {
  it("parses every-minute `* * * * *` as all-wildcards", () => {
    const result = parseCron("* * * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.hasSeconds).toBe(false);
    expect(result.fields.minute.isWildcard).toBe(true);
    expect(result.fields.minute.terms).toEqual([{ kind: "all" }]);
    expect(result.fields.dayOfWeek.isWildcard).toBe(true);
    expect(result.fields.second).toBeUndefined();
  });

  it("parses a step `*/15 * * * *`", () => {
    const result = parseCron("*/15 * * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.minute.terms).toEqual([
      { kind: "step", from: null, to: null, step: 15 },
    ]);
  });

  it("parses `0 9 * * 1-5` with single values and a range", () => {
    const result = parseCron("0 9 * * 1-5");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.minute.terms).toEqual([{ kind: "value", value: 0 }]);
    expect(result.fields.hour.terms).toEqual([{ kind: "value", value: 9 }]);
    expect(result.fields.dayOfWeek.terms).toEqual([
      { kind: "range", from: 1, to: 5 },
    ]);
  });

  it("parses comma lists", () => {
    const result = parseCron("0,15,30,45 * * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.minute.terms).toEqual([
      { kind: "value", value: 0 },
      { kind: "value", value: 15 },
      { kind: "value", value: 30 },
      { kind: "value", value: 45 },
    ]);
  });

  it("parses combinations of range, list, and step in one field", () => {
    const result = parseCron("0 9-17/2,22 * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.hour.terms).toEqual([
      { kind: "step", from: 9, to: 17, step: 2 },
      { kind: "value", value: 22 },
    ]);
  });

  it("parses a value-base step `10/2`", () => {
    const result = parseCron("10/2 * * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.minute.terms).toEqual([
      { kind: "step", from: 10, to: null, step: 2 },
    ]);
  });

  it("resolves month and day-of-week name aliases (case-insensitive)", () => {
    const result = parseCron("0 0 * JAN-mar Mon");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.month.terms).toEqual([
      { kind: "range", from: 1, to: 3 },
    ]);
    expect(result.fields.dayOfWeek.terms).toEqual([
      { kind: "value", value: 1 },
    ]);
  });

  it("normalizes day-of-week 7 to 0 (both mean Sunday)", () => {
    const result = parseCron("0 0 * * 7");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.dayOfWeek.terms).toEqual([
      { kind: "value", value: 0 },
    ]);
  });

  it("parses a 6-field expression with a leading seconds field", () => {
    const result = parseCron("30 0 9 * * 1-5");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.hasSeconds).toBe(true);
    expect(result.fields.second?.terms).toEqual([{ kind: "value", value: 30 }]);
    expect(result.fields.minute.terms).toEqual([{ kind: "value", value: 0 }]);
    expect(result.fields.dayOfWeek.terms).toEqual([
      { kind: "range", from: 1, to: 5 },
    ]);
  });

  it("tolerates surrounding and irregular whitespace", () => {
    const result = parseCron("   0   9   *   *   1-5   ");
    expect(result.ok).toBe(true);
  });
});

describe("parseCron — invalid input never throws", () => {
  it("reports empty input", () => {
    expect(() => parseCron("")).not.toThrow();
    const result = parseCron("   ");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("empty");
  });

  it("reports the wrong field count", () => {
    const tooFew = parseCron("* * *");
    expect(tooFew.ok).toBe(false);
    if (!tooFew.ok) expect(tooFew.error).toEqual({ code: "fieldCount", count: 3 });

    const tooMany = parseCron("* * * * * * *");
    expect(tooMany.ok).toBe(false);
    if (!tooMany.ok) expect(tooMany.error.code).toBe("fieldCount");
  });

  it("reports out-of-range values per field", () => {
    const minute = parseCron("60 * * * *");
    expect(minute.ok).toBe(false);
    if (!minute.ok)
      expect(minute.error).toEqual({
        code: "outOfRange",
        field: "minute",
        value: 60,
      });

    const hour = parseCron("0 24 * * *");
    expect(hour.ok).toBe(false);
    if (!hour.ok) expect(hour.error.code).toBe("outOfRange");

    const dom = parseCron("0 0 32 * *");
    expect(dom.ok).toBe(false);
    if (!dom.ok) expect(dom.error.code).toBe("outOfRange");

    const month = parseCron("0 0 * 13 *");
    expect(month.ok).toBe(false);
    if (!month.ok) expect(month.error.code).toBe("outOfRange");

    const dow = parseCron("0 0 * * 8");
    expect(dow.ok).toBe(false);
    if (!dow.ok) expect(dow.error.code).toBe("outOfRange");
  });

  it("reports garbage and malformed tokens without throwing", () => {
    for (const expr of [
      "abc * * * *",
      "1.5 * * * *",
      "* * * * xyz",
      "1- * * * *",
      "-5 * * * *",
      "1/ * * * *",
      "*/0 * * * *",
      "*/-1 * * * *",
      "@@@ @@@ @@@ @@@ @@@",
    ]) {
      expect(() => parseCron(expr)).not.toThrow();
      expect(parseCron(expr).ok).toBe(false);
    }
  });

  it("reports an inverted range as badRange", () => {
    const result = parseCron("0 0 * * 5-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("badRange");
  });

  it("reports a zero or negative step as badStep", () => {
    const zero = parseCron("*/0 * * * *");
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.error.code).toBe("badStep");
  });
});
