"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const tLang = useTranslations("Language");
  const nextLocale: Locale = locale === "en" ? "zh" : "en";
  const rest = pathname.replace(/^\/(en|zh)/, "") || "/";
  const label =
    nextLocale === "zh" ? tLang("zh") : tLang("en");
  const ariaLabel = tLang("switchTo", { target: label });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={rest}
          locale={nextLocale}
          aria-label={ariaLabel}
          data-testid="language-switcher"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background/70 px-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {nextLocale === "zh" ? "中文" : "EN"}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{ariaLabel}</TooltipContent>
    </Tooltip>
  );
}
