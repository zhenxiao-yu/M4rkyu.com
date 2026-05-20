"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ToolBrandIcon } from "@/components/about/tool-brand-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Tool = {
  label: string;
  group: string;
};

type ToolGroup = [string, Tool[]];

export function ToolsCollapsibleCard({ groups }: { groups: ToolGroup[] }) {
  const t = useTranslations("About.refined");

  return (
    <Card className="h-full bg-card/85">
      <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1.5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("toolsEyebrow")}
          </p>
          <CardTitle className="text-base">{t("toolsTitle")}</CardTitle>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {t("toolsBody")}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {groups.map(([group, tools]) => (
          <ToolCategory key={group} group={group} tools={tools} />
        ))}
      </CardContent>
    </Card>
  );
}

function ToolCategory({ group, tools }: { group: string; tools: Tool[] }) {
  const t = useTranslations("About.refined");
  const [open, setOpen] = useState(false);
  const key = groupKey(group);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-md border border-border/60 bg-background/35"
    >
      <div className="grid gap-2 p-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t(`toolGroups.${key}`)}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t(`toolDescriptions.${key}`)}
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={open ? t("collapseTools") : t("expandTools")}
              aria-expanded={open}
              className="shrink-0"
            >
              <ChevronDown
                data-icon
                aria-hidden="true"
                className={cn(
                  "transition-transform duration-(--motion-fast) ease-(--ease-premium)",
                  open && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {!open && <LogoLoop tools={tools} />}
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3 sm:grid-cols-3 lg:grid-cols-4">
          {tools.map((tool) => (
            <div
              key={`${group}-${tool.label}`}
              className="flex min-w-0 items-center gap-2 rounded-md border border-border/50 bg-card/60 px-2.5 py-2"
            >
              <ToolBrandIcon label={tool.label} className="size-7" />
              <span className="min-w-0 text-xs font-medium leading-tight">
                {tool.label}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function LogoLoop({ tools }: { tools: Tool[] }) {
  const reduceMotion = useReducedMotion();
  const loopTools = useMemo(() => tools.slice(0, 12), [tools]);

  if (reduceMotion) {
    return (
      <div className="flex flex-wrap gap-1.5" aria-label={loopTools.map((tool) => tool.label).join(", ")}>
        {loopTools.map((tool) => (
          <CompactLogo key={tool.label} tool={tool} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="group relative overflow-hidden py-0.5"
      aria-label={loopTools.map((tool) => tool.label).join(", ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
      />
      <div className="flex w-max gap-1.5 motion-safe:animate-[marquee_52s_linear_infinite] group-hover:[animation-play-state:paused]">
        <LogoTrack tools={loopTools} />
        <LogoTrack tools={loopTools} hidden />
      </div>
    </div>
  );
}

function LogoTrack({ tools, hidden }: { tools: Tool[]; hidden?: boolean }) {
  return (
    <div className="flex shrink-0 gap-1.5 pr-1.5" aria-hidden={hidden}>
      {tools.map((tool) => (
        <CompactLogo key={`${tool.label}-${hidden ? "clone" : "base"}`} tool={tool} />
      ))}
    </div>
  );
}

function CompactLogo({ tool }: { tool: Tool }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-card/55 px-2 py-1 text-[0.68rem] text-muted-foreground"
      title={tool.label}
    >
      <ToolBrandIcon label={tool.label} className="size-5 rounded-sm border-0 bg-transparent" />
      <span className="whitespace-nowrap">{tool.label}</span>
    </span>
  );
}

function groupKey(group: string) {
  return group
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
