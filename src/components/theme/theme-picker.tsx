"use client";

import { useTranslations } from "next-intl";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePalette, type Palette, type PaletteMeta } from "./palette-provider";
import { useTheme, type Theme } from "./theme-provider";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

/**
 * The Appearance studio. The header control is a compact square swatch button
 * — matched to the bell / theme-toggle footprint beside it — that opens a
 * modal gallery: a Light/Dark/System mode control (this is where the
 * otherwise-hidden "System" option surfaces) plus three live-preview poster
 * tiles, each rendered in its own theme's tokens with its signature texture
 * and SVG motif. On open the tiles settle from a skeleton; picking one fires
 * an "applying" sweep so the swap reads as deliberate, not a silent flash.
 */
const HUD_TRIGGER =
  "group inline-flex size-9 pointer-coarse:size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0";

const MODES: { value: Theme; icon: LucideIcon; key: string }[] = [
  { value: "light", icon: Sun, key: "modeLight" },
  { value: "dark", icon: Moon, key: "modeDark" },
  { value: "system", icon: Monitor, key: "modeSystem" },
];

/**
 * Per-theme signature SVG motif — real iconography in each theme's voice,
 * replacing the old plain accent dot. Risograph = an overprint of two
 * misregistered rings; Terminal = a prompt chevron + caret; Editorial =
 * stacked masthead rules. `currentColor` inherits the tile's accent ink, so
 * one component themes itself. Always decorative → `aria-hidden`.
 */
function ThemeMotif({
  palette,
  className,
  style,
}: {
  palette: Palette;
  className?: string;
  style?: CSSProperties;
}) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    "aria-hidden": true as const,
    className,
    style,
  };
  if (palette === "risograph") {
    return (
      <svg {...common} strokeWidth={1.4}>
        <circle cx={6} cy={8} r={4} />
        <circle cx={10} cy={8} r={4} />
      </svg>
    );
  }
  if (palette === "terminal") {
    return (
      <svg
        {...common}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4l4 4-4 4" />
        <path d="M9 12h4" />
      </svg>
    );
  }
  if (palette === "blueprint") {
    // Drafting registration crosshair — a technical-drawing target mark.
    return (
      <svg {...common} strokeWidth={1.4} strokeLinecap="round">
        <circle cx={8} cy={8} r={3.1} />
        <path d="M8 1.5v2.6M8 11.9v2.6M1.5 8h2.6M11.9 8h2.6" />
      </svg>
    );
  }
  return (
    <svg {...common} strokeWidth={1.6} strokeLinecap="round">
      <path d="M2 4h12" />
      <path d="M2 8h8" />
      <path d="M2 12h12" />
    </svg>
  );
}

/**
 * The header chip reads the *live* theme tokens, not the JS palette state.
 * `data-palette` is set before paint by the bootstrap, so these CSS vars
 * resolve to the active theme during SSR and on the client identically — no
 * hydration mismatch — and the chip tracks light/dark for free. (Reading the
 * stored palette in render would diverge: server renders the default, client
 * renders localStorage.)
 */
const LIVE_SWATCH = [
  "var(--surface-paper)",
  "var(--foreground)",
  "var(--ring)",
] as const;

function Swatch({
  swatch,
}: {
  swatch: readonly [string, string, string];
}) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 overflow-hidden rounded-[3px] border border-border/60 shadow-sm transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:scale-105"
    >
      {swatch.map((color, i) => (
        <span key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export function ThemePicker() {
  const t = useTranslations("Theme");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t("appearance")}
          data-testid="theme-picker"
          className={cn(HUD_TRIGGER, FOCUS_RING)}
        >
          <Swatch swatch={LIVE_SWATCH} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-6 max-h-[85dvh] overflow-y-auto">
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
      <p className="hud-label text-muted-foreground">{t("mode")}</p>
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

/**
 * Per-palette typographic character. Each tile becomes a type specimen in its
 * theme's own voice — the editorial serif star for Risograph (with a riso
 * misregistered overprint), a phosphor console for Terminal (glow + blinking
 * block cursor over scanlines), and a bold grotesque for Editorial (with a
 * hard red rule) — rather than three identical mini-pages. The specimen
 * glyphs are language-neutral (like the existing hardcoded "M4RKYU" mark), so
 * this adds no new translatable copy.
 */
type ThemeCharacter = {
  font: string;
  tag: string;
  treatment: "overprint" | "phosphor" | "rule";
};

const THEME_CHARACTER: Record<Palette, ThemeCharacter> = {
  risograph: { font: "font-display", tag: "press", treatment: "overprint" },
  terminal: { font: "font-mono", tag: "sys", treatment: "phosphor" },
  editorial: { font: "font-wordmark", tag: "01", treatment: "rule" },
  blueprint: { font: "font-mono", tag: "ref", treatment: "rule" },
};

function ThemeGrid() {
  const t = useTranslations("Theme");
  const { palette, setPalette, palettes } = usePalette();
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-2">
      <p className="hud-label text-muted-foreground">{t("label")}</p>
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        variants={
          reduce ? undefined : { show: { transition: { staggerChildren: 0.07 } } }
        }
      >
        {palettes.map((meta) => (
          <motion.div
            key={meta.value}
            className="min-w-0"
            variants={
              reduce
                ? undefined
                : {
                    hidden: { opacity: 0, y: 10 },
                    // Inline easing: motion can't read CSS vars in
                    // `transition.ease`, so --ease-premium is mirrored by hand.
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.38, ease: [0.2, 0.7, 0.2, 1] },
                    },
                  }
            }
          >
            <ThemeTile
              meta={meta}
              mode={resolvedTheme}
              active={meta.value === palette}
              onSelect={() => setPalette(meta.value)}
              name={t(meta.key)}
              description={t(`description.${meta.key}`)}
              selectedLabel={t("selected")}
              applyingLabel={t("applying")}
            />
          </motion.div>
        ))}
      </motion.div>
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
  applyingLabel,
}: {
  meta: PaletteMeta;
  mode: "light" | "dark";
  active: boolean;
  onSelect: () => void;
  name: string;
  description: string;
  selectedLabel: string;
  applyingLabel: string;
}) {
  const c = meta.preview[mode];
  const character = THEME_CHARACTER[meta.value];
  const reduce = useReducedMotion();
  // One-shot "applying" sweep that confirms a palette switch. Fired only on a
  // real user selection (not on initial mount), and skipped under
  // reduced-motion — the border + check already signal the active tile.
  const [applying, setApplying] = useState(false);
  const handleSelect = () => {
    onSelect();
    if (!reduce) setApplying(true);
  };

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
        : meta.texture === "grid"
          ? {
              backgroundImage:
                "linear-gradient(currentColor 0.5px, transparent 0.5px), linear-gradient(90deg, currentColor 0.5px, transparent 0.5px)",
              backgroundSize: "9px 9px",
              opacity: 0.1,
            }
          : undefined;

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={active}
      aria-label={`${name}${active ? ` — ${selectedLabel}` : ""}`}
      className={cn(
        "group/tile relative block w-full overflow-hidden rounded-xl border-2 text-left transition-[border-color,transform,box-shadow] duration-(--motion-fast) ease-(--ease-premium) motion-safe:hover:-translate-y-0.5",
        FOCUS_RING_INSET,
        active
          ? "border-ring shadow-[0_0_0_1px_var(--ring)]"
          : "border-border hover:border-ring/55",
      )}
    >
      {/* Poster — a type specimen rendered in the theme's own colours and
       * voice. The signature texture is drawn last so it overlays the type
       * (press grain / CRT scanlines) for the authentic look. */}
      <div
        className="relative isolate aspect-[5/4] overflow-hidden p-3.5"
        style={{ backgroundColor: c.paper, color: c.ink }}
      >
        {/* mini HUD strip — tag + the theme's signature SVG motif */}
        <div className="flex items-center justify-between">
          <span className="hud-label text-[0.625rem] leading-none opacity-70">
            {character.tag}
          </span>
          <ThemeMotif
            palette={meta.value}
            className="size-3.5"
            style={{ color: c.accent }}
          />
        </div>

        {/* The specimen — the star of the tile, in each theme's own voice. */}
        <div className="mt-1.5 flex min-h-[2.9rem] items-end">
          {character.treatment === "overprint" ? (
            // Risograph: a misregistered two-ink overprint — the coral ghost
            // peeks out from behind the ink glyph, like a real riso pass.
            <span className="relative inline-block leading-none">
              <span
                aria-hidden="true"
                className={cn(
                  character.font,
                  "absolute left-0.5 top-0.5 text-[2.9rem] font-bold leading-none",
                )}
                style={{
                  color: c.accent,
                  mixBlendMode: mode === "dark" ? "screen" : "multiply",
                  opacity: 0.9,
                }}
              >
                Aa
              </span>
              <span
                className={cn(
                  character.font,
                  "relative text-[2.9rem] font-bold leading-none",
                )}
              >
                Aa
              </span>
            </span>
          ) : character.treatment === "phosphor" ? (
            // Terminal: glowing phosphor type + a blinking block cursor.
            <span className="inline-flex items-end leading-none">
              <span
                className={cn(
                  character.font,
                  "text-[2.55rem] font-bold leading-none",
                )}
                style={{ color: c.accent, textShadow: `0 0 10px ${c.accent}` }}
              >
                Aa
              </span>
              {reduce ? (
                <span
                  aria-hidden="true"
                  className="mb-1 ml-1 inline-block h-6 w-2.5"
                  style={{
                    backgroundColor: c.accent,
                    boxShadow: `0 0 8px ${c.accent}`,
                  }}
                />
              ) : (
                <motion.span
                  aria-hidden="true"
                  className="mb-1 ml-1 inline-block h-6 w-2.5"
                  style={{
                    backgroundColor: c.accent,
                    boxShadow: `0 0 8px ${c.accent}`,
                  }}
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1.05,
                    times: [0, 0.5, 0.5, 1],
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </span>
          ) : (
            // Editorial: a bold grotesque with a hard accent rule beneath.
            <span className="inline-block leading-none">
              <span
                className={cn(
                  character.font,
                  "block text-[2.9rem] font-bold leading-none tracking-tight",
                )}
              >
                Aa
              </span>
              <span
                aria-hidden="true"
                className="mt-1.5 block h-1 w-10 rounded-full"
                style={{ backgroundColor: c.accent }}
              />
            </span>
          )}
        </div>

        {/* faux body lines */}
        <div className="mt-2.5 space-y-1">
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
            className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[0.625rem] font-bold leading-none"
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

        {textureStyle ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={textureStyle}
          />
        ) : null}

        {/* Applying sweep + status — a single diagonal light pass with an
         * "applying…" chip, confirming the switch took. Self-clears on the
         * sweep's animationend. */}
        {applying ? (
          <>
            <span
              aria-hidden="true"
              className="m4-tile-sweep pointer-events-none absolute inset-0 z-10"
              onAnimationEnd={() => setApplying(false)}
            />
            <span
              className="hud-label absolute left-2 top-2 z-20 inline-flex items-center rounded px-1.5 py-0.5 text-[0.625rem] leading-none shadow-sm"
              style={{ backgroundColor: c.ink, color: c.paper }}
            >
              {applyingLabel}
            </span>
          </>
        ) : null}
      </div>

      {/* Footer label — on the dialog's own surface. */}
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight text-foreground">
            {name}
          </p>
          <p className="hud-label truncate text-muted-foreground">
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
