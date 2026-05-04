"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

const navItems = [
  ["projects", "/projects"],
  ["gallery", "/gallery"],
  ["blog", "/blog"],
  ["resources", "/resources"],
  ["tools", "/tools"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export function MobileNav({ locale }: { locale: Locale }) {
  const t = useTranslations("Navigation");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label={t("menu")}>
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="top-0 h-dvh translate-y-0 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>M4rkyu.com</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="mt-8 grid gap-3">
          {navItems.map(([key, href]) => (
            <Link
              key={key}
              href={href}
              locale={locale}
              className="rounded-md border px-4 py-3 text-sm font-medium"
            >
              {t(key)}
            </Link>
          ))}
          <Link
            href="/portal"
            locale={locale}
            className="rounded-md border border-ring px-4 py-3 text-sm font-medium"
          >
            {t("portal")}
          </Link>
        </nav>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
