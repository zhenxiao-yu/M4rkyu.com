"use client";

import { useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
import { MusicToggle } from "@/components/system/music-toggle";
import { useCommandPalette } from "@/components/system/command-palette-provider";
import { cn } from "@/lib/utils";
import type { NavDropdownGroup, NavFlatLink } from "./nav-structure";

interface MobileNavProps {
  locale: Locale;
  groups: NavDropdownGroup[];
  flatLinks: NavFlatLink[];
}

export function MobileNav({ locale, groups, flatLinks }: MobileNavProps) {
  const t = useTranslations("Navigation");
  const tPalette = useTranslations("CommandPalette");
  const { setOpen: setPaletteOpen } = useCommandPalette();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Default-open the group containing the active route so the user
  // lands on their current location without an extra tap. Falls back
  // to the first group ID if no match.
  const initialOpenGroup =
    groups.find((group) =>
      group.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href),
      ),
    )?.id ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(initialOpenGroup);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <button
        type="button"
        aria-label={t("menu")}
        onClick={() => setSheetOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Menu aria-hidden="true" className="size-4" />
      </button>
      <SheetContent className="top-0 flex h-dvh translate-y-0 flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-mono text-sm tracking-wide">
            M4RKYU.SYS
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("menuDescription")}
          </SheetDescription>
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

          <nav
            aria-label="Mobile navigation"
            className="mt-3 flex flex-col gap-1"
          >
            {groups.map((group) => {
              const open = openGroup === group.id;
              const groupActive = group.items.some((item) =>
                isActive(item.href),
              );
              return (
                <Collapsible
                  key={group.id}
                  open={open}
                  onOpenChange={(next) => setOpenGroup(next ? group.id : null)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2.5 text-sm font-medium transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      groupActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 transition-transform duration-(--motion-fast) ease-(--ease-premium)",
                        open && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none">
                    <ul className="mt-1 flex flex-col gap-1 border-l border-border/60 pl-3">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <SheetClose asChild>
                            <Link
                              href={item.href}
                              locale={locale}
                              className={cn(
                                "flex items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                isActive(item.href)
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              <span>{item.label}</span>
                              <span
                                aria-hidden="true"
                                className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70"
                              >
                                {item.href}
                              </span>
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {flatLinks.map((link) => (
              <SheetClose asChild key={link.id}>
                <Link
                  href={link.href}
                  locale={locale}
                  className={cn(
                    "flex items-center justify-between rounded-md border border-transparent px-3 py-2.5 text-sm font-medium transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground/70"
                  >
                    {link.href}
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
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <SoundToggle />
            <MusicToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
