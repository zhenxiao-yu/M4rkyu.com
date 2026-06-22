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
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The Appearance studio. The header control is a compact swatch button that
 * opens a modal gallery: a Light/Dark/System mode control (this is where the
 * otherwise-hidden "System" option surfaces) plus three live-preview poster
 * tiles, each rendered in its own theme's tokens with its signature texture.
 * Replaces the old plain Select — same trigger footprint, far more discovery.
 */
const HUD_CONTROL =
  "group inline-flex h-9 pointer-coarse:h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-background/70 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-[color,border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0";

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

export function ThemePicker() {
  const t = useTranslations("Theme");

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
          <Swatch swatch={LIVE_SWATCH} />
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
};

function ThemeGrid() {
  const t = useTranslations("Theme");
  const { palette, setPalette, palettes } = usePalette();
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-2">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {t("label")}
      </p>
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        variants={
          reduce ? undefined : { show: { transition: { staggerChildren: 0.07 } } }
        }
      >
        {palettes.map((meta) => (
          <motion.div
            key={meta.value}
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
  const character = THEME_CHARACTER[meta.value];
  const reduce = useReducedMotion();
  // One-shot accent bloom that confirms a palette switch. Fired only on a
  // real user selection (not on initial mount), and skipped under
  // reduced-motion — the border + check already signal the active tile.
  const [pulse, setPulse] = useState(false);
  const handleSelect = () => {
    onSelect();
    if (!reduce) setPulse(true);
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
        : undefined;

  return (
    <button
      type="button"
      onClick={handleSelect}
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
      {pulse ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--ring) 38%, transparent), transparent 68%)",
          }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          // Inline easing: motion can't read CSS vars in `transition.ease`,
          // so --ease-premium is mirrored here by hand. 0.45s keeps the
          // confirm flash inside the <500ms UI-feedback budget.
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          onAnimationComplete={() => setPulse(false)}
        />
      ) : null}

      {/* Poster — a type specimen rendered in the theme's own colours and
       * voice. The signature texture is drawn last so it overlays the type
       * (press grain / CRT scanlines) for the authentic look. */}
      <div
        className="relative isolate aspect-[5/4] overflow-hidden p-3.5"
        style={{ backgroundColor: c.paper, color: c.ink }}
      >
        {/* mini HUD strip */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-70">
            {character.tag}
          </span>
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: c.accent }}
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

        {textureStyle ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={textureStyle}
          />
        ) : null}
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
