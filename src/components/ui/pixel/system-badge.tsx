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
  /**
   * Opt in to live-region semantics. When `true` AND `kind` is `"live"`
   * or `"now"`, the badge wears `role="status"` + `aria-live="polite"`
   * so AT users hear label changes. Defaults to `false` because most
   * call sites render a STATIC chip — a live region that never updates
   * just creates announcement noise on focus and SR navigation.
   *
   * Pass `live={true}` for chips whose `label` (or `kind`) actually
   * mutates at runtime — e.g. a session-clock chip ticking minutes, a
   * deploy-status chip flipping from `now` → `live`, or a polling
   * counter. Static decoration stays default-off.
   *
   * Phase 8 a11y fix — previously this was always-on for kind=live/now.
   */
  live?: boolean;
}

export function SystemBadge({
  status,
  kind,
  label,
  live = false,
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
  // The pulsing halo is purely a visual indicator that the tone is
  // "active"; it renders for any `live` / `now` kind regardless of the
  // `live` opt-in. The live-region attrs below are the part that needs
  // the opt-in (announcing a never-changing label is noise).
  const isPulsing = kind === "live" || kind === "now";

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-pixel", className)}
      role={live && isPulsing ? "status" : undefined}
      aria-live={live && isPulsing ? "polite" : undefined}
      {...rest}
    >
      {isPulsing ? (
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
