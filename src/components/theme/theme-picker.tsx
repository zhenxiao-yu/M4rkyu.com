"use client";

import { useTranslations } from "next-intl";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePalette, type PaletteMeta } from "./palette-provider";
import { useTheme, type Theme } from "./theme-provider";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The Appearance studio. The header control is a compact swatch button that
 * opens a modal gallery: a Light/Dark/System mode control (this is where the
 * otherwise-hidden "System" option surfaces) plus three live-preview poster
 * tiles, each rendered in its own theme's tokens with its signature texture.
 * Replaces the old plain Select — same trigger footprint, far more discovery.
 */
const HUD_CONTROL =
  "group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-background/70 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-[color,border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0";

const MODES: { value: Theme; icon: LucideIcon; key: string }[] = [
  { value: "light", icon: Sun, key: "modeLight" },
  { value: "dark", icon: Moon, key: "modeDark" },
  { value: "system", icon: Monitor, key: "modeSystem" },
];

function ChannelEdge() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-0.5 shrink-0 rounded-full bg-ring/40 transition-[background-color,box-shadow] duration-(--motion-fast) ease-(--ease-premium) group-hover:bg-ring group-hover:shadow-[0_0_8px_var(--ring)] group-data-[state=open]:bg-ring group-data-[state=open]:shadow-[0_0_8px_var(--ring)]"
    />
  );
}

function Swatch({
  swatch,
}: {
  swatch: readonly [string, string, string];
}) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 overflow-hidden rounded-[3px] border border-border/50"
    >
      {swatch.map((color, i) => (
        <span key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export function ThemePicker() {
  const t = useTranslations("Theme");
  const { palette, palettes } = usePalette();
  const current = palettes.find((p) => p.value === palette) ?? palettes[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t("appearance")}
          data-testid="theme-picker"
          className={cn(HUD_CONTROL, "w-auto pl-2 pr-2.5", FOCUS_RING)}
        >
          <ChannelEdge />
          <Swatch swatch={current.swatch} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {t("appearance")}
          </DialogTitle>
          <DialogDescription>{t("appearanceDescription")}</DialogDescription>
        </DialogHeader>
        <ModeControl />
        <ThemeGrid />
      </DialogContent>
    </Dialog>
  );
}

function ModeControl() {
  const t = useTranslations("Theme");
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-2">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {t("mode")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("mode")}
        className="inline-flex w-fit rounded-lg border border-border bg-muted/40 p-1"
      >
        {MODES.map(({ value, icon: Icon, key }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                FOCUS_RING,
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {t(key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeGrid() {
  const t = useTranslations("Theme");
  const { palette, setPalette, palettes } = usePalette();
  const { resolvedTheme } = useTheme();

  return (
    <div className="grid gap-2">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {t("label")}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {palettes.map((meta) => (
          <ThemeTile
            key={meta.value}
            meta={meta}
            mode={resolvedTheme}
            active={meta.value === palette}
            onSelect={() => setPalette(meta.value)}
            name={t(meta.key)}
            description={t(`description.${meta.key}`)}
            selectedLabel={t("selected")}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeTile({
  meta,
  mode,
  active,
  onSelect,
  name,
  description,
  selectedLabel,
}: {
  meta: PaletteMeta;
  mode: "light" | "dark";
  active: boolean;
  onSelect: () => void;
  name: string;
  description: string;
  selectedLabel: string;
}) {
  const c = meta.preview[mode];

  // The signature texture, drawn as an inline overlay so the tile is fully
  // self-contained (no globals dependency). currentColor = the tile's ink.
  const textureStyle: CSSProperties | undefined =
    meta.texture === "grain"
      ? {
          backgroundImage:
            "radial-gradient(currentColor 0.5px, transparent 0.6px)",
          backgroundSize: "4px 4px",
          opacity: 0.16,
        }
      : meta.texture === "scanlines"
        ? {
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 1px, currentColor 1px 2px)",
            opacity: 0.12,
          }
        : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${name}${active ? ` — ${selectedLabel}` : ""}`}
      className={cn(
        "group/tile relative overflow-hidden rounded-xl border-2 text-left transition-[border-color,transform,box-shadow] duration-(--motion-fast) ease-(--ease-premium) motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
        active
          ? "border-ring shadow-[0_0_0_1px_var(--ring)]"
          : "border-border hover:border-ring/55",
      )}
    >
      {/* Poster — a miniature page rendered in the theme's own colours. */}
      <div
        className="relative isolate aspect-[5/4] overflow-hidden p-3"
        style={{ backgroundColor: c.paper, color: c.ink }}
      >
        {textureStyle ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={textureStyle}
          />
        ) : null}

        {/* mini HUD strip */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-70">
            M4RKYU
          </span>
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: c.accent }}
          />
        </div>

        {/* mini headline */}
        <div className="mt-2 font-display text-[1.7rem] font-bold leading-none tracking-tight">
          Aa
        </div>

        {/* faux body lines */}
        <div className="mt-2 space-y-1">
          <span
            className="block h-1 w-3/4 rounded-full"
            style={{ backgroundColor: c.muted }}
          />
          <span
            className="block h-1 w-1/2 rounded-full"
            style={{ backgroundColor: c.muted }}
          />
        </div>

        {/* accent chip + the second & third inks (the three-ink budget) */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[0.5rem] font-bold"
            style={{ backgroundColor: c.accent, color: c.paper }}
          >
            ›_
          </span>
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: c.accent2 }}
          />
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: c.accent3 }}
          />
        </div>
      </div>

      {/* Footer label — on the dialog's own surface. */}
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight text-foreground">
            {name}
          </p>
          <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
            {description}
          </p>
        </div>
        {active ? (
          <Check aria-hidden="true" className="size-4 shrink-0 text-ring" />
        ) : null}
      </div>
    </button>
  );
}
