"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Status {
  code: number;
  name: string;
  description: string;
}

const STATUSES: Status[] = [
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

function classOf(code: number) {
  if (code < 200) return { label: "1xx · informational", tone: "outline" as const };
  if (code < 300) return { label: "2xx · success", tone: "success" as const };
  if (code < 400) return { label: "3xx · redirection", tone: "outline" as const };
  if (code < 500) return { label: "4xx · client error", tone: "warning" as const };
  return { label: "5xx · server error", tone: "destructive" as const };
}

export function HttpStatus() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATUSES;
    return STATUSES.filter(
      (s) => String(s.code).startsWith(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="grid gap-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search code, name, or description…"
        aria-label="Search HTTP status codes"
        className="font-mono"
      />
      <ul className="grid gap-1.5">
        {filtered.map((status) => {
          const cls = classOf(status.code);
          return (
            <li key={status.code} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2">
              <code className="font-display text-xl tabular-nums">{status.code}</code>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{status.name}</p>
                <p className="truncate text-xs text-muted-foreground">{status.description}</p>
              </div>
              <Badge variant={cls.tone === "destructive" ? "outline" : cls.tone} className="font-mono text-[0.55rem]">
                {cls.label}
              </Badge>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="rounded-md border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
            No status code matches.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
