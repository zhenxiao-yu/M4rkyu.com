"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownGroup {
  id: string;
  label: string;
  items: DropdownItem[];
}

interface FlatLink {
  id: string;
  label: string;
  href: string;
}

interface DesktopNavProps {
  locale: Locale;
  groups: DropdownGroup[];
  flatLinks: FlatLink[];
  ariaLabel: string;
}

export function DesktopNav({
  locale,
  groups,
  flatLinks,
  ariaLabel,
}: DesktopNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <NavigationMenu
      aria-label={ariaLabel}
      className="hidden min-w-0 flex-1 justify-center px-4 lg:flex"
    >
      <NavigationMenuList className="rounded-full border border-border/55 bg-muted/25 p-1 shadow-inner shadow-black/5 dark:shadow-black/20">
        {groups.map((group) => {
          const groupActive = group.items.some((item) => isActive(item.href));
          return (
            <NavigationMenuItem key={group.id}>
              <NavigationMenuTrigger
                className={cn(
                  "rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]",
                  groupActive &&
                    "bg-background text-foreground shadow-sm shadow-black/5",
                )}
              >
                {group.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <div className="w-[min(34rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border/70 bg-popover text-popover-foreground shadow-2xl shadow-black/12 dark:shadow-black/40">
                  <div className="flex items-center justify-between border-b border-border/70 bg-muted/25 px-4 py-3">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
                      {group.label}
                    </p>
                    <span
                      aria-hidden="true"
                      className="h-px w-16 bg-linear-to-r from-transparent to-ring/70"
                    />
                  </div>
                  <ul className="grid gap-1 p-2 sm:grid-cols-2">
                    <li className="hidden border-r border-border/60 px-3 py-3 sm:block">
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted-foreground">
                        /{group.id}
                      </p>
                      <div aria-hidden="true" className="mt-4 grid gap-1.5">
                        {group.items.slice(0, 4).map((item, index) => (
                          <span
                            key={item.href}
                            className="h-1 rounded-full bg-muted"
                            style={{
                              width: `${72 - index * 12}%`,
                            }}
                          />
                        ))}
                      </div>
                    </li>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            locale={locale}
                            className={cn(
                              "group flex min-h-12 items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:-translate-y-px hover:border-ring/35 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isActive(item.href)
                                ? "border-ring/35 bg-ring/5 text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium">
                                {item.label}
                              </span>
                              <span className="mt-1 block truncate font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/75">
                                {item.href}
                              </span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="grid size-7 shrink-0 place-items-center rounded-sm border border-border/70 text-muted-foreground transition-colors group-hover:border-ring/45 group-hover:text-foreground"
                            >
                              <ArrowUpRight className="size-3.5" />
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}

        {flatLinks.map((link) => (
          <NavigationMenuItem key={link.id}>
            <NavigationMenuLink asChild>
              <Link
                href={link.href}
                locale={locale}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive(link.href)
                    ? "bg-background text-foreground shadow-sm shadow-black/5"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
