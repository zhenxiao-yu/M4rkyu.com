// Pure timestamp conversion + relative-time logic shared by the timestamp
// tool. No React, no DOM, no `Date.now()` — callers pass an explicit `now`
// so the relative formatter is deterministic and unit-testable
// (tests/unit/tools/timestamp.test.ts).
//
// CRITICAL: `new Date(Number(unix) * 1000)` yields an Invalid Date for any
// non-numeric input, and an Invalid Date silently renders as the literal
// strings "Invalid Date" / "NaN" downstream. Every entry point here returns
// a typed `{ ok: false }` result instead, so the UI shows a localized error
// rather than leaking NaN.

export interface TimestampFields {
  /** Whole seconds since the Unix epoch. */
  seconds: number;
  /** Milliseconds since the Unix epoch. */
  millis: number;
  /** ISO 8601, always UTC (the trailing `Z`). */
  iso: string;
  /** RFC-1123 UTC string, e.g. "Sun, 21 Jun 2026 …". */
  utc: string;
  /** Locale + timezone of the runtime — explicitly the *local* wall clock. */
  local: string;
}

export type TimestampResult =
  | { ok: true; fields: TimestampFields }
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "invalid" };

/** A digit-only (optionally signed) string — i.e. a raw epoch number. */
const EPOCH_RE = /^[+-]?\d+$/;

/**
 * Heuristic seconds-vs-milliseconds detection for a raw epoch *number*.
 * 13+ significant digits is milliseconds territory (year ~2001+ in ms);
 * anything shorter is treated as seconds. Mirrors the common dev habit of
 * pasting either `1700000000` or `1700000000000`.
 */
export function detectEpochUnit(raw: string): "seconds" | "millis" {
  const digits = raw.replace(/^[+-]/, "").replace(/^0+(?=\d)/, "");
  return digits.length >= 13 ? "millis" : "seconds";
}

function fieldsFromDate(date: Date): TimestampFields {
  const millis = date.getTime();
  return {
    seconds: Math.floor(millis / 1000),
    millis,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
  };
}

/**
 * Parse a raw epoch string (seconds or milliseconds, auto-detected) into the
 * full field set. Empty → `{ reason: "empty" }`; non-numeric or out-of-range
 * → `{ reason: "invalid" }` (never an Invalid Date).
 */
export function fieldsFromEpoch(raw: string): TimestampResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };
  if (!EPOCH_RE.test(trimmed)) return { ok: false, reason: "invalid" };

  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { ok: false, reason: "invalid" };

  const millis = detectEpochUnit(trimmed) === "millis" ? n : n * 1000;
  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) return { ok: false, reason: "invalid" };

  return { ok: true, fields: fieldsFromDate(date) };
}

/**
 * Parse a date/ISO-8601 string into the full field set. `Date` parses a bare
 * `YYYY-MM-DDTHH:mm:ss` (no zone) as *local* time and a `…Z` suffix as UTC —
 * the tool labels each field so the user always knows which is which. Empty →
 * `empty`; unparseable → `invalid` (guarded by `Number.isNaN(getTime())`).
 */
export function fieldsFromDateString(raw: string): TimestampResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { ok: false, reason: "invalid" };

  return { ok: true, fields: fieldsFromDate(date) };
}

interface RelativeUnit {
  /** Upper bound (exclusive) in seconds for using `divisor`. */
  limit: number;
  divisor: number;
  unit: Intl.RelativeTimeFormatUnit;
}

const RELATIVE_UNITS: readonly RelativeUnit[] = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 2592000, divisor: 86400, unit: "day" },
  { limit: 31536000, divisor: 2592000, unit: "month" },
  { limit: Infinity, divisor: 31536000, unit: "year" },
];

/**
 * Human relative time between `targetMs` and an explicit `nowMs` (e.g.
 * "in 3 hours", "2 days ago"). `now` is a parameter, never `Date.now()`, so
 * the output is deterministic and testable. `locale` is forwarded to
 * `Intl.RelativeTimeFormat`; omit for the runtime default.
 */
export function formatRelative(
  targetMs: number,
  nowMs: number,
  locale?: string,
): string {
  if (!Number.isFinite(targetMs) || !Number.isFinite(nowMs)) return "";
  const deltaSeconds = (targetMs - nowMs) / 1000;
  const abs = Math.abs(deltaSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const { limit, divisor, unit } of RELATIVE_UNITS) {
    if (abs < limit) {
      return rtf.format(Math.round(deltaSeconds / divisor), unit);
    }
  }
  return rtf.format(Math.round(deltaSeconds / 31536000), "year");
}
