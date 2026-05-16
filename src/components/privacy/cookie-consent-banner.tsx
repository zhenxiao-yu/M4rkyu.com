"use client";

import { useSyncExternalStore, useState } from "react";
import { Check, Cookie, Settings2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CONSENT,
  hasStoredConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/privacy/consent";
import { cn } from "@/lib/utils";

export function CookieConsentBanner() {
  const t = useTranslations("Privacy");
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(DEFAULT_CONSENT.analytics);
  const [personalization, setPersonalization] = useState(
    DEFAULT_CONSENT.personalization,
  );
  const stored = useSyncExternalStore(
    subscribeConsent,
    hasStoredConsent,
    () => true,
  );

  if (stored) return null;

  function acceptAll() {
    saveConsent({ analytics: true, personalization: true });
  }

  function essentialOnly() {
    saveConsent({ analytics: false, personalization: false });
  }

  function savePreferences() {
    saveConsent({ analytics, personalization });
  }

  return (
    <section
      aria-label={t("bannerLabel")}
      className="fixed inset-x-3 top-[4.5rem] z-50 mx-auto max-w-xl rounded-lg border border-border bg-background/95 p-3 shadow-2xl shadow-black/15 backdrop-blur-xl sm:inset-x-auto sm:right-4 sm:left-auto sm:mx-0 sm:max-w-lg sm:p-4 dark:shadow-black/40"
    >
      <div className="grid gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-base font-semibold tracking-normal text-foreground">
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
              <Cookie aria-hidden="true" className="size-4" />
            </span>
            {t("title")}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={acceptAll}>
            <Check aria-hidden="true" className="size-4" />
            {t("acceptAll")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={essentialOnly}
          >
            <X aria-hidden="true" className="size-4" />
            {t("essentialOnly")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <Settings2 aria-hidden="true" className="size-4" />
            {t("settings")}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-2 border-t border-border/70 pt-4 sm:grid-cols-2">
          <PreferenceToggle
            checked={analytics}
            onChange={setAnalytics}
            title={t("analyticsTitle")}
            description={t("analyticsDescription")}
          />
          <PreferenceToggle
            checked={personalization}
            onChange={setPersonalization}
            title={t("personalizationTitle")}
            description={t("personalizationDescription")}
          />
          <div className="sm:col-span-2">
            <Button type="button" size="sm" onClick={savePreferences}>
              {t("save")}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PreferenceToggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-24 items-start justify-between gap-4 rounded-lg border border-border bg-card/70 p-3 text-left transition-[border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/45 hover:bg-card motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors",
          checked
            ? "border-ring bg-ring/80"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full bg-background shadow-sm transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
