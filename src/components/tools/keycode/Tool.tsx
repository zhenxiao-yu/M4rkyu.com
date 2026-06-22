"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn, FOCUS_RING } from "@/lib/utils";

interface Captured {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  repeat: boolean;
}

const LOCATION_KEYS = ["standard", "left", "right", "numpad"] as const;

// The four modifier flags, in display order.
const MODIFIERS = ["ctrl", "alt", "shift", "meta"] as const;

// Keys that scroll/activate the page — swallowed only while the pad is
// focused so the capture works without the page jumping. Tab is intentionally
// NOT included: keyboard users must always be able to tab away (no focus trap).
const SWALLOW = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

export function Keycode() {
  const t = useTranslations("Tools.keycode");
  const tc = useTranslations("Tools.common");

  const [cap, setCap] = useState<Captured | null>(null);
  const [focused, setFocused] = useState(false);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Let the user tab away (and don't intercept browser shortcuts like
    // ⌘R / F5 / F12 that carry a non-Tab modifier). preventDefault is
    // reserved for the scroll/activation keys above.
    if (e.code === "Tab") return;
    if (SWALLOW.has(e.code)) e.preventDefault();
    setCap({
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      location: e.location,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      repeat: e.repeat,
    });
  }

  const mods = cap ? MODIFIERS.filter((m) => cap[m]) : [];
  const locationLabel = cap
    ? `${cap.location} · ${t(`location.${LOCATION_KEYS[cap.location] ?? "standard"}`)}`
    : "";

  // Plain-text payload for the copy button — every captured field on one line.
  const copyValue = cap
    ? [
        `event.key: ${cap.key}`,
        `event.code: ${cap.code}`,
        `keyCode: ${cap.keyCode}`,
        `which: ${cap.which}`,
        `location: ${locationLabel}`,
        `modifiers: ${mods.length ? mods.join(", ") : t("noModifiers")}`,
      ].join("\n")
    : "";

  // One spoken sentence so the live region reads naturally on capture.
  const announcement = cap
    ? `event.code ${cap.code}, event.key ${cap.key}`
    : "";

  return (
    <div className="grid gap-4">
      <div
        tabIndex={0}
        role="button"
        aria-label={t("padLabel")}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "grid min-h-44 place-items-center gap-3 overflow-hidden rounded-lg border border-dashed bg-card/40 p-6 text-center motion-safe:transition-colors motion-safe:duration-(--motion-fast)",
          focused ? "border-ring/60" : "border-border",
          FOCUS_RING,
        )}
      >
        {cap ? (
          <>
            <span className="max-w-full break-all font-display text-4xl font-black leading-none sm:text-5xl md:text-6xl">
              {cap.code || "—"}
            </span>
            <span className="max-w-full break-all font-mono text-sm text-muted-foreground">
              event.key ={" "}
              <span className="text-foreground">{JSON.stringify(cap.key)}</span>
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {mods.length > 0 ? (
                mods.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-ring/40 bg-ring/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ring"
                  >
                    {t(`modifier.${m}`)}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {t("noModifiers")}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="max-w-full wrap-break-word font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {focused ? t("focusedHint") : t("blurredHint")}
          </span>
        )}
      </div>

      {/* Result of the most recent capture, announced for assistive tech. */}
      <p className="sr-only" role="status" aria-live="polite">
        {cap ? announcement : tc("empty")}
      </p>

      {cap ? (
        <>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="event.code" value={cap.code} />
            <Field label="event.key" value={cap.key} />
            <Field label="keyCode" value={String(cap.keyCode)} deprecated />
            <Field label="which" value={String(cap.which)} deprecated />
            <Field label={t("fields.location")} value={locationLabel} />
            <Field
              label={t("fields.repeat")}
              value={cap.repeat ? t("boolean.true") : t("boolean.false")}
            />
          </dl>

          <p className="font-mono text-[0.6rem] leading-relaxed text-muted-foreground">
            {t("deprecatedNote")}
          </p>

          <div className="flex justify-end">
            <CopyButton value={copyValue} label={t("copyNoun")}>
              {tc("copy")}
            </CopyButton>
          </div>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground">
          {t("emptyHint")}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  deprecated,
}: {
  label: string;
  value: string;
  deprecated?: boolean;
}) {
  const t = useTranslations("Tools.keycode");
  return (
    <div className="grid min-w-0 gap-1 rounded-md border border-border bg-card/40 px-3 py-2">
      <dt className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="truncate">{label}</span>
        {deprecated ? (
          <span className="shrink-0 rounded-sm border border-warning/40 bg-warning/10 px-1 text-[0.5rem] tracking-[0.08em] text-warning">
            {t("deprecatedBadge")}
          </span>
        ) : null}
      </dt>
      <dd className="truncate font-mono text-sm">{value}</dd>
    </div>
  );
}
