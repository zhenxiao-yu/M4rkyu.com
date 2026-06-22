// Pure cron-parsing logic shared by the cron-explainer tool. No React, no DOM,
// no English — the parser returns a *structured* field model and the component
// turns it into localized prose. Unit-tested in tests/unit/tools/cron.test.ts.
//
// Parsing is total: any malformed input (wrong field count, out-of-range value,
// garbage) returns `{ ok: false, error }` with a typed, translatable error code
// rather than throwing, so the UI can render a localized message instead of
// crashing.

/** The five (or six, with seconds) positional fields of a cron expression. */
export type CronFieldName =
  | "second"
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

/** One parsed term inside a field, in structured (non-localized) form. */
export type CronTerm =
  | { kind: "all" } // *
  | { kind: "value"; value: number } // 5
  | { kind: "range"; from: number; to: number } // 1-5
  // step e.g. "* / 15" (no spaces), "1-30/5", "10/2"
  | { kind: "step"; from: number | null; to: number | null; step: number };

/** A fully parsed field: its name plus the terms in a comma list. */
export interface CronField {
  name: CronFieldName;
  /** The raw text of this field, preserved for display. */
  raw: string;
  /** `true` when the field is exactly `*` (i.e. a single "all" term). */
  isWildcard: boolean;
  terms: CronTerm[];
}

/** Structured, locale-free result of parsing a cron expression. */
export interface CronFields {
  /** Present only for 6-field expressions (leading seconds field). */
  second?: CronField;
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  /** `true` when a leading seconds field was supplied (6-field form). */
  hasSeconds: boolean;
}

/** Typed, translatable parse-error codes. `field` scopes a range error. */
export type CronError =
  | { code: "empty" }
  | { code: "fieldCount"; count: number }
  | { code: "badField"; field: CronFieldName; raw: string }
  | { code: "outOfRange"; field: CronFieldName; value: number }
  | { code: "badRange"; field: CronFieldName; raw: string }
  | { code: "badStep"; field: CronFieldName; raw: string };

export type CronParseResult =
  | { ok: true; fields: CronFields }
  | { ok: false; error: CronError };

/** Inclusive numeric bounds for each field. */
const BOUNDS: Record<CronFieldName, { min: number; max: number }> = {
  second: { min: 0, max: 59 },
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  // 1–12 with named aliases (jan…dec). 0 is rejected.
  month: { min: 1, max: 12 },
  // 0–6 (Sun=0). 7 is accepted as an alias for Sunday and normalized to 0.
  dayOfWeek: { min: 0, max: 6 },
};

const MONTH_ALIASES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DOW_ALIASES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/**
 * Parse a single atom (a value, or one side of a range) into a number, applying
 * field-specific named aliases. Returns `null` if it is not a recognized
 * value/alias. Does NOT range-check — the caller does that so it can attribute
 * an out-of-range error to the field and value.
 */
function parseAtom(raw: string, field: CronFieldName): number | null {
  const text = raw.trim().toLowerCase();
  if (text === "") return null;
  if (field === "month" && text in MONTH_ALIASES) return MONTH_ALIASES[text];
  if (field === "dayOfWeek" && text in DOW_ALIASES) return DOW_ALIASES[text];
  // Strict integer only — reject "1.5", "1px", "", "+1", "0x1", etc.
  if (!/^\d+$/.test(text)) return null;
  return Number.parseInt(text, 10);
}

/** Normalize day-of-week 7 → 0 (both mean Sunday). */
function normalizeDow(field: CronFieldName, value: number): number {
  if (field === "dayOfWeek" && value === 7) return 0;
  return value;
}

function inRange(field: CronFieldName, value: number): boolean {
  const { min, max } = BOUNDS[field];
  // Allow 7 for day-of-week before normalization.
  if (field === "dayOfWeek" && value === 7) return true;
  return value >= min && value <= max;
}

type TermResult =
  | { ok: true; term: CronTerm }
  | { ok: false; error: CronError };

/** Parse one comma-separated term of a field (wildcard, value, range, or step). */
function parseTerm(raw: string, field: CronFieldName): TermResult {
  const text = raw.trim();
  if (text === "") return { ok: false, error: { code: "badField", field, raw } };

  // Step form: <base>/<step>, where base is `*`, a value, or a range.
  const slash = text.indexOf("/");
  if (slash !== -1) {
    const baseText = text.slice(0, slash);
    const stepText = text.slice(slash + 1);
    if (!/^\d+$/.test(stepText.trim())) {
      return { ok: false, error: { code: "badStep", field, raw } };
    }
    const step = Number.parseInt(stepText.trim(), 10);
    if (step <= 0) return { ok: false, error: { code: "badStep", field, raw } };

    if (baseText.trim() === "*" || baseText.trim() === "") {
      return { ok: true, term: { kind: "step", from: null, to: null, step } };
    }
    // Range base: a-b/step
    if (baseText.includes("-")) {
      const range = parseRangeBounds(baseText, field);
      if (!range.ok) return range;
      return {
        ok: true,
        term: { kind: "step", from: range.from, to: range.to, step },
      };
    }
    // Single-value base: a/step → from a, no upper bound.
    const v = parseAtom(baseText, field);
    if (v === null) return { ok: false, error: { code: "badStep", field, raw } };
    if (!inRange(field, v)) {
      return { ok: false, error: { code: "outOfRange", field, value: v } };
    }
    return {
      ok: true,
      term: { kind: "step", from: normalizeDow(field, v), to: null, step },
    };
  }

  // Wildcard.
  if (text === "*") return { ok: true, term: { kind: "all" } };

  // Range form: a-b.
  if (text.includes("-")) {
    const range = parseRangeBounds(text, field);
    if (!range.ok) return range;
    return { ok: true, term: { kind: "range", from: range.from, to: range.to } };
  }

  // Single value.
  const v = parseAtom(text, field);
  if (v === null) return { ok: false, error: { code: "badField", field, raw } };
  if (!inRange(field, v)) {
    return { ok: false, error: { code: "outOfRange", field, value: v } };
  }
  return { ok: true, term: { kind: "value", value: normalizeDow(field, v) } };
}

type RangeResult =
  | { ok: true; from: number; to: number }
  | { ok: false; error: CronError };

function parseRangeBounds(raw: string, field: CronFieldName): RangeResult {
  const dash = raw.indexOf("-");
  const fromText = raw.slice(0, dash);
  const toText = raw.slice(dash + 1);
  const from = parseAtom(fromText, field);
  const to = parseAtom(toText, field);
  if (from === null || to === null) {
    return { ok: false, error: { code: "badRange", field, raw } };
  }
  if (!inRange(field, from)) {
    return { ok: false, error: { code: "outOfRange", field, value: from } };
  }
  if (!inRange(field, to)) {
    return { ok: false, error: { code: "outOfRange", field, value: to } };
  }
  const nf = normalizeDow(field, from);
  const nt = normalizeDow(field, to);
  if (nf > nt) return { ok: false, error: { code: "badRange", field, raw } };
  return { ok: true, from: nf, to: nt };
}

function parseField(raw: string, field: CronFieldName): CronField | CronError {
  const text = raw.trim();
  const isWildcard = text === "*";
  const terms: CronTerm[] = [];
  for (const part of text.split(",")) {
    const result = parseTerm(part, field);
    if (!result.ok) return result.error;
    terms.push(result.term);
  }
  return { name: field, raw: text, isWildcard, terms };
}

function isError(value: CronField | CronError): value is CronError {
  return "code" in value;
}

/**
 * Parse a 5-field (`min hr dom mon dow`) or 6-field (`sec min hr dom mon dow`)
 * cron expression into a structured, locale-free field model. Never throws.
 */
export function parseCron(expr: string): CronParseResult {
  const trimmed = expr.trim();
  if (trimmed === "") return { ok: false, error: { code: "empty" } };

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) {
    return { ok: false, error: { code: "fieldCount", count: parts.length } };
  }

  const hasSeconds = parts.length === 6;
  const offset = hasSeconds ? 1 : 0;

  const order: CronFieldName[] = [
    "minute",
    "hour",
    "dayOfMonth",
    "month",
    "dayOfWeek",
  ];

  const fields: Partial<CronFields> = { hasSeconds };

  if (hasSeconds) {
    const sec = parseField(parts[0], "second");
    if (isError(sec)) return { ok: false, error: sec };
    fields.second = sec;
  }

  for (let i = 0; i < order.length; i++) {
    const name = order[i];
    const field = parseField(parts[i + offset], name);
    if (isError(field)) return { ok: false, error: field };
    fields[name] = field;
  }

  return { ok: true, fields: fields as CronFields };
}
