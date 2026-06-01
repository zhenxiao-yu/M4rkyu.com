"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getNextLocale,
  LOCALE_LIST,
  stripLocale,
  type Locale,
} from "@/i18n/locales";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Shared "glass over cyber" HUD treatment for the locale control. Reads as
 * a channel strip in the system-status row: a single accent edge (the lone
 * --ring affordance) that ignites on hover, plus the same -0.5 lift its
 * ThemeSwitcher / SoundToggle siblings use. Mono uppercase, h-9 footprint —
 * cohesive with the trio it sits beside in GameHud.
 */
const HUD_CONTROL =
  "group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-background/70 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-[color,border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0";

/** The igniting accent edge — a 2px channel tick that blooms in --ring on hover. */
function ChannelEdge() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-0.5 shrink-0 rounded-full bg-ring/40 transition-[background-color,box-shadow] duration-(--motion-fast) ease-(--ease-premium) group-hover:bg-ring group-hover:shadow-[0_0_8px_var(--ring)] group-data-[state=open]:bg-ring group-data-[state=open]:shadow-[0_0_8px_var(--ring)]"
    />
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const tLang = useTranslations("Language");
  const rest = stripLocale(pathname);

  // 2 locales → instant, prefetched channel-flip toggle (no menu cost).
  if (LOCALE_LIST.length === 2) {
    const next = getNextLocale(locale);
    const meta = LOCALE_LIST.find((l) => l.code === next)!;
    const ariaLabel = tLang("switchTo", { target: tLang(next) });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={rest}
            locale={next}
            aria-label={ariaLabel}
            data-testid="language-switcher"
            className={cn(HUD_CONTROL, "pl-2 pr-3", FOCUS_RING)}
          >
            <ChannelEdge />
            {meta.short}
          </Link>
        </TooltipTrigger>
        <TooltipContent>{ariaLabel}</TooltipContent>
      </Tooltip>
    );
  }

  // 3+ locales → accessible picker on the existing Select primitive, wearing
  // the same channel-strip skin so both modes read as one component.
  return <LanguagePicker locale={locale} rest={rest} label={tLang("label")} />;
}

function LanguagePicker({
  locale,
  rest,
  label,
}: {
  locale: Locale;
  rest: string;
  label: string;
}) {
  const router = useRouter();
  const current = LOCALE_LIST.find((l) => l.code === locale)!;

  function onValueChange(next: string) {
    if (next === locale) return;
    router.replace(rest, { locale: next as Locale });
  }

  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        data-testid="language-switcher"
        className={cn(HUD_CONTROL, "w-auto pl-2 pr-2.5", FOCUS_RING)}
      >
        <ChannelEdge />
        <SelectValue>{current.short}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALE_LIST.map((l) => (
          <SelectItem key={l.code} value={l.code} trailing={l.short}>
            {l.native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
