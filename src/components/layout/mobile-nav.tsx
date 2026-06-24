"use client";

import { useState, type ReactNode } from "react";
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
import { SoundSettingsButton } from "@/components/system/sound-settings-button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ThemePicker } from "@/components/theme/theme-picker";
import { useCommandPalette } from "@/components/system/command-palette-provider";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { NavDropdownIcon } from "./nav-dropdown-icon";
import type { NavDropdownGroup, NavFlatLink } from "./nav-structure";

interface MobileNavProps {
  locale: Locale;
  groups: NavDropdownGroup[];
  flatLinks: NavFlatLink[];
  /**
   * Account control (UserMenu / SignInSheet). Lives in the sheet's
   * system tray on mobile — identity belongs in the menu hub, not on
   * the cramped top rail.
   */
  account?: ReactNode;
}

export function MobileNav({
  locale,
  groups,
  flatLinks,
  account,
}: MobileNavProps) {
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

  // Close the sheet on any route change. Adjusting state during render
  // by tracking the previous path (React's recommended alternative to a
  // setState-in-effect) — the relocated account control is a plain Link
  // to /account, not wrapped in SheetClose, so without this the menu
  // would linger over a freshly-navigated page. A nested sign-in dialog
  // doesn't change the path, so it won't trip this.
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (pathname !== trackedPath) {
    setTrackedPath(pathname);
    setSheetOpen(false);
  }

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
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground pointer-coarse:size-11",
          FOCUS_RING,
        )}
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
            className={cn(
              "inline-flex items-center gap-2 rounded-md",
              FOCUS_RING_INSET,
            )}
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
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground",
                FOCUS_RING_INSET,
              )}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </SheetClose>
        </div>

        <div
          data-lenis-prevent
          className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
        >
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
                className={cn(
                  "inline-flex h-12 w-full items-center justify-between rounded-md border border-border bg-background/80 px-4 text-sm text-muted-foreground shadow-sm transition-[background-color,border-color,color] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
                  FOCUS_RING_INSET,
                )}
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
                          "group flex min-h-16 items-center justify-between rounded-md border border-border/70 bg-background/65 px-4 py-3 transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/45 hover:bg-muted/35 hover:text-foreground",
                          FOCUS_RING_INSET,
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
                          className={cn(
                            "flex flex-1 items-center px-4 py-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/35 hover:text-foreground",
                            FOCUS_RING_INSET,
                          )}
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
                        className={cn(
                          "flex w-14 shrink-0 items-center justify-center border-l border-border/60 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/35 hover:text-foreground",
                          FOCUS_RING_INSET,
                        )}
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
                        {group.items.map((item) => {
                          const itemActive = isActive(item.href);
                          return (
                            <li key={item.id}>
                              <SheetClose asChild>
                                <Link
                                  href={item.href}
                                  locale={locale}
                                  className={cn(
                                    "group/sub flex min-h-14 items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50",
                                    FOCUS_RING_INSET,
                                    itemActive && "bg-muted/40",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "grid size-9 shrink-0 place-items-center rounded-md border border-border/70 bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover/sub:border-ring/55 group-hover/sub:text-foreground",
                                      itemActive &&
                                        "border-ring/55 text-foreground",
                                    )}
                                  >
                                    <NavDropdownIcon
                                      iconKey={item.iconKey}
                                      className="size-4"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span
                                      className={cn(
                                        "block text-sm font-medium leading-tight",
                                        itemActive
                                          ? "text-foreground"
                                          : "text-foreground/95",
                                      )}
                                    >
                                      {item.label}
                                    </span>
                                    {item.description ? (
                                      <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted-foreground">
                                        {item.description}
                                      </span>
                                    ) : null}
                                  </span>
                                  <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground/60 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover/sub:-translate-y-0.5 group-hover/sub:translate-x-0.5 group-hover/sub:text-ring"
                                  />
                                </Link>
                              </SheetClose>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              );
            })}

          </nav>
        </div>

        {/* System tray — identity on the left, environment controls on
            the right. The account control is relocated here from the top
            rail so sign-in / account lives in the menu hub. */}
        <div className="relative flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-background/80 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center">
            {account ?? (
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                {locale.toUpperCase()} · m4rkyu
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <ThemePicker />
            <ThemeSwitcher />
            <SoundSettingsButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
