"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import { NavDropdownIcon } from "./nav-dropdown-icon";
import type { NavDropdownGroup, NavFlatLink } from "./nav-structure";

interface DesktopNavProps {
  locale: Locale;
  groups: NavDropdownGroup[];
  flatLinks: NavFlatLink[];
  ariaLabel: string;
}

const PILL_BASE = cn(
  "relative inline-flex h-9 items-center rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
  FOCUS_RING,
);
const PILL_ACTIVE = "bg-background text-foreground shadow-sm shadow-black/5";
const PILL_INACTIVE = "text-muted-foreground";

export function DesktopNav({
  locale,
  groups,
  flatLinks,
  ariaLabel,
}: DesktopNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    // Strip query strings before comparing so /work?category=… still
    // highlights the Work entry.
    const path = pathname.split("?")[0] ?? pathname;
    return path === href || path.startsWith(`${href}/`);
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="hidden min-w-0 justify-center px-4 lg:flex lg:justify-self-center"
    >
      <ul className="flex items-center gap-0.5 rounded-full border border-border/55 bg-muted/25 p-1 shadow-inner shadow-black/5 dark:shadow-black/20">
        {groups.map((group) => {
          const parentActive =
            isActive(group.href) ||
            group.items.some((item) => isActive(item.href));
          return (
            <li key={group.id} className="group/menu relative">
              <Link
                href={group.href}
                locale={locale}
                aria-haspopup="true"
                className={cn(
                  PILL_BASE,
                  "gap-1.5",
                  parentActive ? PILL_ACTIVE : PILL_INACTIVE,
                )}
              >
                <span>{group.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-3 opacity-70 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover/menu:rotate-180 group-focus-within/menu:rotate-180"
                />
              </Link>

              {/* Hover/focus-within popover. `pt-3` lives inside the
               * absolute wrapper so the gap between trigger and panel
               * is a continuous hover target — moving the cursor down
               * does not collapse the menu. */}
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100 motion-safe:translate-y-1 motion-safe:group-hover/menu:translate-y-0 motion-safe:group-focus-within/menu:translate-y-0">
                <div
                  role="menu"
                  aria-label={group.label}
                  className="w-[20rem] overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl shadow-black/20 backdrop-blur-xl dark:shadow-black/50"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {group.label}
                    </span>
                    <Link
                      href={group.href}
                      locale={locale}
                      role="menuitem"
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
                        FOCUS_RING,
                      )}
                    >
                      <span>Overview</span>
                      <ArrowUpRight aria-hidden="true" className="size-2.5" />
                    </Link>
                  </div>
                  <ul className="grid gap-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.id} role="none">
                          <Link
                            role="menuitem"
                            href={item.href}
                            locale={locale}
                            className={cn(
                              "group/item flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none",
                              active && "bg-muted/50",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-border/70 bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover/item:border-ring/60 group-hover/item:text-foreground group-focus-visible/item:border-ring/60 group-focus-visible/item:text-foreground",
                                active && "border-ring/60 text-foreground",
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
                                  "flex items-center gap-2 text-sm font-medium leading-tight",
                                  active
                                    ? "text-foreground"
                                    : "text-foreground/95",
                                )}
                              >
                                {item.label}
                                <ArrowUpRight
                                  aria-hidden="true"
                                  className="size-3 text-muted-foreground/0 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-ring group-focus-visible/item:text-ring"
                                />
                              </span>
                              {item.description ? (
                                <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted-foreground">
                                  {item.description}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}

        {flatLinks.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              locale={locale}
              className={cn(
                PILL_BASE,
                isActive(link.href) ? PILL_ACTIVE : PILL_INACTIVE,
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
