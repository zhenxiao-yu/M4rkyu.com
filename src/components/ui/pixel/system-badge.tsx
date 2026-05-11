import * as React from "react";
import type { z } from "zod";
import { Badge } from "../badge";
import { StatusPulse } from "./status-pulse";
import { cn } from "@/lib/utils";
import { contentStatusSchema } from "@/content/schemas";

type ContentStatus = z.infer<typeof contentStatusSchema>;
type SystemKind = "live" | "now" | "wip" | "archive" | "info";
type Tone = "success" | "warning" | "signal" | "muted";

const STATUS_TONE: Record<ContentStatus, Tone> = {
  ready: "success",
  draft: "warning",
  placeholder: "muted",
  "coming-soon": "muted",
};

const KIND_TONE: Record<SystemKind, Tone> = {
  live: "signal",
  now: "success",
  wip: "warning",
  archive: "muted",
  info: "muted",
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  ready: "Ready",
  draft: "Draft",
  placeholder: "Pending",
  "coming-soon": "Soon",
};

const KIND_LABEL: Record<SystemKind, string> = {
  live: "Live",
  now: "Now",
  wip: "WIP",
  archive: "Archive",
  info: "Info",
};

const DOT_CLASS: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  signal: "bg-signal",
  muted: "bg-muted-foreground",
};

export interface SystemBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Content schema status — drives the dot tone and default label. */
  status?: ContentStatus;
  /** System kind — alternative to `status` for non-content surfaces. */
  kind?: SystemKind;
  /** Override the auto-derived label (e.g. version tag, custom tag). */
  label?: string;
}

export function SystemBadge({
  status,
  kind,
  label,
  className,
  ...rest
}: SystemBadgeProps) {
  const tone: Tone = status
    ? STATUS_TONE[status]
    : kind
      ? KIND_TONE[kind]
      : "muted";
  const resolved =
    label ??
    (status ? STATUS_LABEL[status] : kind ? KIND_LABEL[kind] : "Info");
  // `live` and `now` render a pulsing halo via the StatusPulse primitive
  // (Phase 6). The outer Badge carries role="status" + aria-live="polite"
  // so AT users hear updates; the pulse itself is purely decorative.
  const isLive = kind === "live" || kind === "now";

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-pixel", className)}
      role={isLive ? "status" : undefined}
      aria-live={isLive ? "polite" : undefined}
      {...rest}
    >
      {isLive ? (
        <StatusPulse tone={kind === "live" ? "live" : "now"} />
      ) : (
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", DOT_CLASS[tone])}
        />
      )}
      <span>{resolved}</span>
    </Badge>
  );
}
