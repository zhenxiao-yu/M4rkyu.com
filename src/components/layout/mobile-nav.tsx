"use client";

import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useCommandPalette } from "@/components/system/command-palette-provider";

const navItems = [
  ["projects", "/work"],
  ["games", "/games"],
  ["gallery", "/archive"],
  ["blog", "/logs"],
  ["media", "/media"],
  ["resources", "/resources"],
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
        <button
          type="button"
          aria-label={t("menu")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Menu aria-hidden="true" className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent className="top-0 flex h-dvh translate-y-0 flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-mono text-sm tracking-wide">
            M4rkyu.com
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => {
                // Sheet close runs an exit animation + focus-trap detach.
                // Defer the palette open until two animation frames after
                // the click so Radix has fully released focus before
                // we mount a new dialog.
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => setPaletteOpen(true)),
                );
              }}
              className="inline-flex h-10 w-full items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={tPalette("title")}
            >
              <Search aria-hidden="true" className="size-4" />
              <span>{tPalette("trigger")}</span>
            </button>
          </SheetClose>

          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("navigateLabel")}
          </p>
          <nav aria-label="Mobile navigation" className="mt-3 grid gap-1">
            {navItems.map(([key, href]) => (
              <SheetClose asChild key={key}>
                <Link
                  href={href}
                  locale={locale}
                  className="flex items-center justify-between rounded-md border border-transparent px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>{t(key)}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {href}
                  </span>
                </Link>
              </SheetClose>
            ))}
            <SheetClose asChild>
              <Link
                href="/portal"
                locale={locale}
                className="mt-3 flex items-center justify-between rounded-md border border-ring/40 bg-ring/5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:bg-ring/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span>{t("portal")}</span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ring"
                >
                  /portal
                </span>
              </Link>
            </SheetClose>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {locale.toUpperCase()} · m4rkyu
          </span>
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
