"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
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
  "group/pill relative inline-flex h-9 items-center rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
  FOCUS_RING,
);
// The raised background now lives in <ActivePill> (a shared-layout element)
// so it glides between sections on navigation; the link only owns its text.
const PILL_ACTIVE = "text-foreground";
const PILL_INACTIVE = "text-muted-foreground";

// The active highlight. A single `layoutId` is shared across every nav item,
// so when the route changes Motion slides the same pill from the old item to
// the new one. Reduced-motion users get a static (instant) pill.
function ActivePill({ animate }: { animate: boolean }) {
  const className =
    "pointer-events-none absolute inset-0 rounded-full bg-background shadow-sm shadow-black/5";
  if (!animate) {
    return <span aria-hidden="true" className={className} />;
  }
  return (
    <motion.span
      aria-hidden="true"
      layoutId="nav-active-pill"
      className={className}
      transition={{ type: "spring", stiffness: 460, damping: 40, mass: 0.8 }}
    />
  );
}

// Hover highlight — a soft accent capsule that glides under the cursor as it
// travels across nav items (one shared `layoutId`, so Motion slides a single
// element from item to item). Suppressed on the active item, where ActivePill
// already marks position, and skipped entirely for reduced-motion users.
function HoverGlide() {
  return (
    <motion.span
      aria-hidden="true"
      layoutId="nav-hover-pill"
      className="pointer-events-none absolute inset-0 rounded-full bg-ring/10"
      transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }}
    />
  );
}

// Nav label with a vertical roll on hover: the resting copy lifts out the top
// as an identical copy rolls up from below — a tactile, characterful swap.
// Falls back to plain static text when motion is reduced.
function NavLabel({ children, roll }: { children: string; roll: boolean }) {
  if (!roll) return <span className="relative z-10">{children}</span>;
  return (
    <span className="relative z-10 block overflow-hidden">
      <span className="block transition-transform duration-(--motion-base) ease-(--ease-premium) group-hover/pill:-translate-y-full group-focus-within/pill:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-(--motion-base) ease-(--ease-premium) group-hover/pill:translate-y-0 group-focus-within/pill:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export function DesktopNav({
  locale,
  groups,
  flatLinks,
  ariaLabel,
}: DesktopNavProps) {
  const pathname = usePathname();
  const animatePill = !useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      <ul
        onMouseLeave={() => setHoveredId(null)}
        className="flex items-center gap-0.5 rounded-full border border-border/55 bg-muted/25 p-1 shadow-inner shadow-black/5 dark:shadow-black/20"
      >
        {groups.map((group) => {
          const parentActive =
            isActive(group.href) ||
            group.items.some((item) => isActive(item.href));
          return (
            <li
              key={group.id}
              onMouseEnter={() => setHoveredId(group.id)}
              className="nav-group group/menu relative"
            >
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
                {parentActive ? <ActivePill animate={animatePill} /> : null}
                {animatePill && hoveredId === group.id && !parentActive ? (
                  <HoverGlide />
                ) : null}
                <NavLabel roll={animatePill}>{group.label}</NavLabel>
                <ChevronDown
                  aria-hidden="true"
                  className="relative z-10 size-3 opacity-70 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover/menu:rotate-180 group-focus-within/menu:rotate-180"
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

        {flatLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <li key={link.id} onMouseEnter={() => setHoveredId(link.id)}>
              <Link
                href={link.href}
                locale={locale}
                className={cn(
                  PILL_BASE,
                  active ? PILL_ACTIVE : PILL_INACTIVE,
                )}
              >
                {active ? <ActivePill animate={animatePill} /> : null}
                {animatePill && hoveredId === link.id && !active ? (
                  <HoverGlide />
                ) : null}
                <NavLabel roll={animatePill}>{link.label}</NavLabel>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
