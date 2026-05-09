"use client";

import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useCommandPalette } from "@/components/system/command-palette-provider";

const navItems = [
  ["projects", "/projects"],
  ["games", "/games"],
  ["gallery", "/gallery"],
  ["blog", "/blog"],
  ["media", "/media"],
  ["resources", "/resources"],
  ["tools", "/tools"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export function MobileNav({ locale }: { locale: Locale }) {
  const t = useTranslations("Navigation");
  const tPalette = useTranslations("CommandPalette");
  const { setOpen: setPaletteOpen } = useCommandPalette();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="xl:hidden" aria-label={t("menu")}>
          <Menu aria-hidden="true" className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="top-0 h-dvh translate-y-0 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>M4rkyu.com</SheetTitle>
        </SheetHeader>

        <SheetClose asChild>
          <button
            type="button"
            onClick={() => {
              // Sheet close fires before this; defer palette open to next tick
              // so focus management doesn't fight.
              window.setTimeout(() => setPaletteOpen(true), 0);
            }}
            className="mt-6 inline-flex h-10 w-full items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] ease-[var(--ease-premium)] hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tPalette("title")}
          >
            <Search aria-hidden="true" className="size-4" />
            <span>{tPalette("trigger")}</span>
          </button>
        </SheetClose>

        <nav aria-label="Mobile navigation" className="mt-6 grid gap-3">
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
