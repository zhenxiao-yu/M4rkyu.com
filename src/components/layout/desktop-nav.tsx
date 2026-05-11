"use client";

import { usePathname, Link } from "@/i18n/navigation";
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

export function DesktopNav({ locale, groups, flatLinks, ariaLabel }: DesktopNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <NavigationMenu aria-label={ariaLabel} className="hidden flex-1 justify-center lg:flex">
      <NavigationMenuList>
        {groups.map((group) => {
          const groupActive = group.items.some((item) => isActive(item.href));
          return (
            <NavigationMenuItem key={group.id}>
              <NavigationMenuTrigger
                className={cn(groupActive && "text-foreground")}
              >
                {group.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[220px] gap-1 p-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          locale={locale}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-sm border border-transparent px-3 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
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
                  "relative inline-flex h-9 items-center rounded-md px-2.5 text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive(link.href)
                    ? "text-foreground after:absolute after:-bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:content-['']"
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
