// Pure CSV ↔ JSON conversion shared by the csv-json tool. No React, no DOM —
// unit-tested in tests/unit/tools/csv-json.test.ts.
//
// Both directions return a typed discriminated union and NEVER throw: the UI
// renders `{ ok: false, reason }` as a localized destructive error and treats
// `{ ok: true, empty: true }` as the neutral "nothing yet" state.

export type CsvJsonError = "non-array" | "malformed-json";

export type CsvJsonResult =
  | { ok: true; output: string; empty: boolean }
  | { ok: false; reason: CsvJsonError };

/**
 * RFC-4180-ish CSV tokenizer. Handles:
 *  - quoted fields containing commas and newlines,
 *  - escaped quotes inside a quoted field (`""` → `"`),
 *  - CRLF vs LF (and lone CR) line endings,
 *  - a trailing newline (no phantom empty row),
 *  - ragged rows (rows are returned as-is; the caller pads/trims).
 *
 * Returns the raw grid. Fully-empty rows (a single empty cell from a blank
 * line) are dropped so a trailing newline or blank separator line doesn't
 * become a `{}` record.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let sawCell = false; // distinguishes a real (possibly empty) field from "no field yet"

  const endCell = () => {
    row.push(cell);
    cell = "";
    sawCell = false;
  };
  const endRow = () => {
    endCell();
    // Drop blank lines: a row that is a single empty, unquoted cell.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
      sawCell = true;
    } else if (ch === ",") {
      endCell();
      sawCell = true; // a trailing comma implies a following (empty) field
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else {
      cell += ch;
      sawCell = true;
    }
  }
  // Flush a final unterminated row (no trailing newline).
  if (sawCell || cell !== "" || row.length > 0) endRow();

  return rows;
}

/**
 * Serialize a JS value into a single CSV cell, escaping per RFC 4180. Objects
 * and arrays are JSON-stringified; null/undefined become an empty cell.
 */
function escapeCsvCell(value: unknown): string {
  const s =
    value === undefined || value === null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * CSV → JSON. First non-empty row is the header; each following row becomes an
 * object keyed by the header. Missing trailing cells in ragged rows fill with
 * `""`. Empty input is a valid empty state, not an error.
 */
export function csvToJson(text: string): CsvJsonResult {
  if (text.trim() === "") return { ok: true, output: "", empty: true };
  const rows = parseCsv(text);
  if (rows.length === 0) return { ok: true, output: "", empty: true };

  const [header, ...body] = rows;
  // A header with only one empty column is effectively no header.
  if (header.length === 0 || (header.length === 1 && header[0] === "")) {
    return { ok: true, output: "[]", empty: false };
  }

  const records = body.map((cells) => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => {
      obj[key] = cells[i] ?? "";
    });
    return obj;
  });
  return { ok: true, output: JSON.stringify(records, null, 2), empty: false };
}

/**
 * JSON → CSV. Input must be a JSON array (of objects/values). The header is the
 * union of every object's keys, in first-seen order, so ragged objects keep
 * every column. Non-array JSON → `{ ok: false, reason: "non-array" }`; invalid
 * JSON → `{ ok: false, reason: "malformed-json" }`. Empty array → empty output.
 */
export function jsonToCsv(text: string): CsvJsonResult {
  if (text.trim() === "") return { ok: true, output: "", empty: true };

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: "malformed-json" };
  }

  if (!Array.isArray(data)) return { ok: false, reason: "non-array" };
  if (data.length === 0) return { ok: true, output: "", empty: false };

  // Union of keys across all object rows, preserving first-seen order. Scalar
  // rows are tolerated under a single "value" column.
  const keys: string[] = [];
  const seen = new Set<string>();
  let hasScalarRow = false;
  for (const row of data) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
    } else {
      hasScalarRow = true;
    }
  }
  if (keys.length === 0 && hasScalarRow) {
    const VALUE = "value";
    keys.push(VALUE);
    seen.add(VALUE);
  }

  const lines = [keys.map(escapeCsvCell).join(",")];
  for (const row of data) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const record = row as Record<string, unknown>;
      lines.push(keys.map((k) => escapeCsvCell(record[k])).join(","));
    } else {
      // Scalar/array row: place it under the synthetic "value" column.
      lines.push(keys.map((_, i) => (i === 0 ? escapeCsvCell(row) : "")).join(","));
    }
  }
  return { ok: true, output: lines.join("\n"), empty: false };
}
