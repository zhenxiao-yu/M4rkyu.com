"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { NavDropdownGroup, NavFlatLink } from "./nav-structure";

interface DesktopNavProps {
  locale: Locale;
  groups: NavDropdownGroup[];
  flatLinks: NavFlatLink[];
  ariaLabel: string;
}

const PILL_BASE =
  "relative inline-flex h-9 items-center rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
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
      className="hidden min-w-0 flex-1 justify-center px-4 lg:flex"
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

              {/* Hover/focus-within popover. `pt-2` lives inside the
               * absolute wrapper so the gap between trigger and panel
               * is a continuous hover target — moving the cursor down
               * does not collapse the menu. */}
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-(--motion-fast) ease-(--ease-premium) group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
                <ul
                  role="menu"
                  aria-label={group.label}
                  className="flex w-56 flex-col rounded-md border border-border/80 bg-popover p-1 text-popover-foreground shadow-xl shadow-black/15 dark:shadow-black/40"
                >
                  {group.items.map((item) => (
                    <li key={item.id} role="none">
                      <Link
                        role="menuitem"
                        href={item.href}
                        locale={locale}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground",
                          isActive(item.href)
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span
                          aria-hidden="true"
                          className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/70"
                        >
                          {item.href}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
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
