"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
import { MusicToggle } from "@/components/system/music-toggle";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
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
  const reduceMotion = useReducedMotion();
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

  const allEntries = [
    ...groups.map((group) => ({ type: "group" as const, group })),
    ...flatLinks.map((link) => ({ type: "link" as const, link })),
  ];
  const itemMotion = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.34, ease: [0.2, 0.7, 0.2, 1] as const },
      };

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
      <SheetContent
        hideCloseButton
        className="!fixed !inset-0 !left-0 !top-0 flex !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden !rounded-none !border-0 bg-background/95 p-0 text-foreground backdrop-blur-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>M4RKYU.SYS</SheetTitle>
          <SheetDescription className="sr-only">
            {t("menuDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-15" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-background/94 to-muted/35" />

        <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4 sm:px-6">
          <Link
            href="/"
            locale={locale}
            onClick={() => setSheetOpen(false)}
            className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-8 place-items-center rounded-md border bg-foreground font-mono text-xs font-bold text-background">
              M4
            </span>
            <span className="font-mono text-sm uppercase tracking-[0.2em]">
              M4RKYU.SYS
            </span>
          </Link>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </SheetClose>
        </div>

        <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <motion.div
            {...itemMotion}
            transition={
              itemMotion ? { ...itemMotion.transition, delay: 0.03 } : undefined
            }
          >
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => {
                  // Defer until Radix releases the menu focus trap, then
                  // mount the command palette without focus contention.
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => setPaletteOpen(true)),
                  );
                }}
                className="inline-flex h-12 w-full items-center justify-between rounded-md border border-border bg-background/80 px-4 text-sm text-muted-foreground shadow-sm transition-[background-color,border-color,color] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={tPalette("title")}
              >
                <span className="inline-flex items-center gap-2">
                  <Search aria-hidden="true" className="size-4" />
                  <span>{tPalette("trigger")}</span>
                </span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em]">
                  ⌘K
                </kbd>
              </button>
            </SheetClose>
          </motion.div>

          <nav
            aria-label="Mobile navigation"
            className="mt-6 flex flex-col gap-2"
          >
            {allEntries.map((entry, index) => {
              if (entry.type === "link") {
                const { link } = entry;
                return (
                  <motion.div
                    key={link.id}
                    {...itemMotion}
                    transition={
                      itemMotion
                        ? {
                            ...itemMotion.transition,
                            delay: 0.08 + index * 0.045,
                          }
                        : undefined
                    }
                  >
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        locale={locale}
                        className={cn(
                          "group flex min-h-16 items-center justify-between rounded-md border border-border/70 bg-background/65 px-4 py-3 transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/45 hover:bg-muted/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive(link.href)
                            ? "border-ring/45 text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="font-display text-3xl font-black leading-none tracking-normal">
                          {link.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </SheetClose>
                  </motion.div>
                );
              }

              const { group } = entry;
              const open = openGroup === group.id;
              const groupActive = group.items.some((item) =>
                isActive(item.href),
              );

              return (
                <motion.div
                  key={group.id}
                  {...itemMotion}
                  transition={
                    itemMotion
                      ? {
                          ...itemMotion.transition,
                          delay: 0.08 + index * 0.045,
                        }
                      : undefined
                  }
                >
                  <Collapsible
                    open={open}
                    onOpenChange={(next) =>
                      setOpenGroup(next ? group.id : null)
                    }
                  >
                    {/* Split row: the label is a Link that navigates
                     * to the group's primary destination; the chevron
                     * on the right is a separate button that toggles
                     * the submenu. Two distinct affordances, one row. */}
                    <div
                      className={cn(
                        "flex min-h-16 items-stretch rounded-md border border-border/70 bg-background/65 transition-[background-color,border-color,color] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/45 focus-within:border-ring/45",
                        groupActive
                          ? "border-ring/45 text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <SheetClose asChild>
                        <Link
                          href={group.href}
                          locale={locale}
                          className="flex flex-1 items-center px-4 py-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="font-display text-3xl font-black leading-none tracking-normal">
                            {group.label}
                          </span>
                        </Link>
                      </SheetClose>
                      <button
                        type="button"
                        aria-label={
                          open
                            ? `Collapse ${group.label}`
                            : `Expand ${group.label}`
                        }
                        aria-expanded={open}
                        onClick={() => setOpenGroup(open ? null : group.id)}
                        className="flex w-14 shrink-0 items-center justify-center border-l border-border/60 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 transition-transform duration-(--motion-fast) ease-(--ease-premium)",
                            open && "rotate-180",
                          )}
                        />
                      </button>
                    </div>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none">
                      <ul className="mt-1 grid gap-1 rounded-md border border-border/60 bg-background/45 p-2">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <SheetClose asChild>
                              <Link
                                href={item.href}
                                locale={locale}
                                className={cn(
                                  "flex min-h-11 items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  isActive(item.href)
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                <span className="font-medium">
                                  {item.label}
                                </span>
                                <span className="truncate font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/75">
                                  {item.href}
                                </span>
                              </Link>
                            </SheetClose>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              );
            })}

            <SheetClose asChild>
              <Link
                href="/portal"
                locale={locale}
                className="mt-2 flex min-h-13 items-center justify-between rounded-md border border-ring/40 bg-ring/5 px-4 py-3 text-sm font-medium text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:bg-ring/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <div className="relative flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-background/80 px-4 py-4 sm:px-6">
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            {locale.toUpperCase()} · m4rkyu
          </span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <SoundToggle />
            <MusicToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
