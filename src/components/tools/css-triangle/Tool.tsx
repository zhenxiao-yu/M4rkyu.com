"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import {
  buildTriangle,
  TRIANGLE_DIRECTIONS,
  type TriangleDirection,
} from "@/lib/tools/css-triangle";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// CSS triangle (border-trick) generator. The declarations are assembled by the
// pure, unit-tested buildTriangle in @/lib/tools/css-triangle so the preview
// and copy value never drift. Size is NaN-safe (clampInt) and the color falls
// back to currentColor, so the output is always a valid rule.

const SIZE = { min: 8, max: 200 } as const;
const INITIAL_SIZE = 48;
const INITIAL_COLOR = "#7c3aed";

export function CssTriangle() {
  const t = useTranslations("Tools.cssTriangle");
  const tc = useTranslations("Tools.common");
  const sizeId = useId();

  const [direction, setDirection] = useState<TriangleDirection>("up");
  const [size, setSize] = useState(INITIAL_SIZE);
  const [color, setColor] = useState(INITIAL_COLOR);
  // Local draft so a half-typed size (e.g. "" mid-edit) doesn't snap to the
  // clamped number on every keystroke; commit + clamp on change/blur only.
  const [sizeDraft, setSizeDraft] = useState<string | null>(null);

  const css = buildTriangle(direction, size, color);
  const rule = `.triangle {\n  ${css.replaceAll("; ", ";\n  ")}\n}`;

  const hexForPicker = /^#[0-9a-f]{6}$/i.test(color.trim())
    ? color.trim()
    : "#000000";

  function commitSize(raw: string) {
    setSize(clampInt(raw, SIZE.min, SIZE.max, size));
    setSizeDraft(null);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-5 rounded-md border border-border/60 bg-background/40 p-5 sm:p-8">
        <div
          role="img"
          aria-label={t("previewAria", { direction: t(`directions.${direction}`) })}
          className="grid min-h-40 place-items-center"
        >
          <span
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              ...inlineFromCss(css),
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs">
              {rule}
            </code>
            <CopyButton value={rule} label="CSS" className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <fieldset className="grid min-w-0 gap-1.5">
          <legend className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("direction")}
          </legend>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-2">
            {TRIANGLE_DIRECTIONS.map((d) => {
              const active = direction === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDirection(d)}
                  className={cn(
                    "flex min-h-9 items-center justify-center rounded-md border px-2.5 py-1 font-mono text-xs uppercase tracking-[0.12em] motion-safe:transition-colors",
                    active
                      ? "border-ring bg-card text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground motion-safe:hover:text-foreground",
                    FOCUS_RING_INSET,
                  )}
                >
                  {t(`directions.${d}`)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor={sizeId}
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t("size")}
            </label>
            <div className="flex items-baseline gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={sizeDraft ?? String(size)}
                onChange={(event) => setSizeDraft(event.target.value)}
                onBlur={(event) => commitSize(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                aria-label={t("size")}
                className={cn(
                  "w-12 rounded-sm bg-transparent text-right font-mono text-xs tabular-nums",
                  FOCUS_RING_INSET,
                )}
              />
              <span className="font-mono text-xs text-muted-foreground">px</span>
            </div>
          </div>
          <input
            id={sizeId}
            type="range"
            min={SIZE.min}
            max={SIZE.max}
            value={size}
            onChange={(event) =>
              setSize(clampInt(event.target.value, SIZE.min, SIZE.max, size))
            }
            aria-label={t("size")}
            className={cn(
              "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
              FOCUS_RING,
            )}
          />
        </div>

        <ColorField
          label={t("color")}
          value={color}
          hexForPicker={hexForPicker}
          onChange={setColor}
        />
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  hexForPicker,
  onChange,
}: {
  label: string;
  value: string;
  hexForPicker: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexForPicker}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className={cn(
            "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1",
            FOCUS_RING_INSET,
          )}
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label={label}
          className="min-w-0 font-mono text-xs"
        />
      </div>
    </div>
  );
}

/**
 * Map the builder's CSS string into a React inline-style object for the live
 * preview. Same source as the copy value, so the two can't drift; only the
 * border longhands the builder emits are read.
 */
function inlineFromCss(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const key = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!key || !val) continue;
    if (key === "width" || key === "height") continue;
    const camel = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  }
  return out as React.CSSProperties;
}
