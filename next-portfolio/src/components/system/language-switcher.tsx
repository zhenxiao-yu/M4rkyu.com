"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const nextLocale: Locale = locale === "en" ? "zh" : "en";
  const rest = pathname.replace(/^\/(en|zh)/, "") || "/";

  return (
    <Button asChild variant="outline" size="sm">
      <Link
        href={rest}
        locale={nextLocale}
        aria-label={`Switch language to ${nextLocale}`}
        data-testid="language-switcher"
      >
        <Languages className="size-4" />
        {nextLocale === "zh" ? "中文" : "EN"}
      </Link>
    </Button>
  );
}
