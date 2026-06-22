// Pure HTTP-status reference logic shared by the http-status tool. No React, no
// DOM — unit-tested in tests/unit/tools/http-status.test.ts.
//
// `filterStatuses` is total: it never throws and never builds a RegExp from user
// input (so regex-special characters like "(", "[", "*" are matched literally
// rather than crashing or mis-matching). Matching is case-insensitive plain
// substring across the code digits, the canonical reason phrase, and the
// editorial description. Empty / whitespace-only queries return the full list.
//
// The status DATA (code numbers + canonical reason phrases) is technical and
// stays in English verbatim — developers expect "Not Found", "Internal Server
// Error", etc. exactly. Only the surrounding UI chrome is localized.

export interface HttpStatus {
  code: number;
  /** Canonical reason phrase — English verbatim (technical). */
  name: string;
  /** Editorial one-liner — English for now (out of i18n scope). */
  description: string;
}

/** The five status classes, keyed by the leading digit. */
export type HttpStatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

/**
 * Visual tone for a class, expressed as a semantic-token role (never a hex /
 * palette literal). The component maps these to Tailwind semantic classes:
 *   informational → muted/outline, success → success, redirection → ring/accent,
 *   clientError → warning, serverError → destructive.
 */
export type HttpStatusTone =
  | "informational"
  | "success"
  | "redirection"
  | "clientError"
  | "serverError";

export interface HttpStatusClassMeta {
  /** Stable id used for the i18n label key under Tools.httpStatus.classes. */
  key: HttpStatusClass;
  tone: HttpStatusTone;
}

export const HTTP_STATUSES: HttpStatus[] = [
  { code: 100, name: "Continue", description: "Initial part of a request has been received; client should continue." },
  { code: 101, name: "Switching Protocols", description: "Server is switching protocols as requested." },
  { code: 200, name: "OK", description: "Standard success response." },
  { code: 201, name: "Created", description: "Request succeeded and a new resource was created." },
  { code: 202, name: "Accepted", description: "Request received but processing not completed." },
  { code: 204, name: "No Content", description: "Success with no response body." },
  { code: 206, name: "Partial Content", description: "Range request fulfilled." },
  { code: 301, name: "Moved Permanently", description: "Resource has a new permanent URI." },
  { code: 302, name: "Found", description: "Resource temporarily at another URI." },
  { code: 304, name: "Not Modified", description: "Cached version is still valid." },
  { code: 307, name: "Temporary Redirect", description: "Resource temporarily moved; preserve method." },
  { code: 308, name: "Permanent Redirect", description: "Resource permanently moved; preserve method." },
  { code: 400, name: "Bad Request", description: "Malformed syntax or invalid request framing." },
  { code: 401, name: "Unauthorized", description: "Authentication required." },
  { code: 403, name: "Forbidden", description: "Authenticated, but not authorized." },
  { code: 404, name: "Not Found", description: "Resource does not exist." },
  { code: 405, name: "Method Not Allowed", description: "Method known but not supported by the target resource." },
  { code: 408, name: "Request Timeout", description: "Server timed out waiting for the request." },
  { code: 409, name: "Conflict", description: "Conflict with the current state of the target resource." },
  { code: 410, name: "Gone", description: "Resource permanently removed." },
  { code: 413, name: "Payload Too Large", description: "Request entity exceeds server limits." },
  { code: 415, name: "Unsupported Media Type", description: "Media type rejected by the server." },
  { code: 418, name: "I'm a teapot", description: "Short, stout, and ceremonial." },
  { code: 422, name: "Unprocessable Entity", description: "Well-formed but semantically invalid." },
  { code: 429, name: "Too Many Requests", description: "Rate limit exceeded." },
  { code: 500, name: "Internal Server Error", description: "Generic server failure." },
  { code: 501, name: "Not Implemented", description: "Server lacks ability to fulfill the request." },
  { code: 502, name: "Bad Gateway", description: "Invalid response from upstream server." },
  { code: 503, name: "Service Unavailable", description: "Server temporarily overloaded or down." },
  { code: 504, name: "Gateway Timeout", description: "Upstream server didn't respond in time." },
];

/** Resolve the status class + tone for a numeric code. Total — clamps anything
 * outside 100–599 into the nearest sensible class (defends against bad data). */
export function classOf(code: number): HttpStatusClassMeta {
  if (code < 200) return { key: "1xx", tone: "informational" };
  if (code < 300) return { key: "2xx", tone: "success" };
  if (code < 400) return { key: "3xx", tone: "redirection" };
  if (code < 500) return { key: "4xx", tone: "clientError" };
  return { key: "5xx", tone: "serverError" };
}

/**
 * Case-insensitive plain-substring filter across code / name / description.
 *
 * Never builds a RegExp from `query`, so regex-special input ("404)", "5*",
 * "a[b") matches literally and cannot throw. Empty / whitespace-only queries
 * pass the whole list through unchanged.
 */
export function filterStatuses(list: readonly HttpStatus[], query: string): HttpStatus[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...list];
  return list.filter(
    (s) =>
      String(s.code).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q),
  );
}

export interface HttpStatusGroup {
  meta: HttpStatusClassMeta;
  statuses: HttpStatus[];
}

/**
 * Bucket a (already filtered) list into the five status classes, preserving
 * input order within each class and dropping classes with no members so the UI
 * only renders headings that have rows beneath them.
 */
export function groupByClass(list: readonly HttpStatus[]): HttpStatusGroup[] {
  const order: HttpStatusClass[] = ["1xx", "2xx", "3xx", "4xx", "5xx"];
  const buckets = new Map<HttpStatusClass, HttpStatusGroup>();
  for (const status of list) {
    const meta = classOf(status.code);
    const existing = buckets.get(meta.key);
    if (existing) existing.statuses.push(status);
    else buckets.set(meta.key, { meta, statuses: [status] });
  }
  return order.map((key) => buckets.get(key)).filter((g): g is HttpStatusGroup => g != null);
}
