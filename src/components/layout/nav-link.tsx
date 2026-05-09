"use client"

import { usePathname, Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { Locale } from "@/i18n/routing"

interface NavLinkProps {
  href: string
  locale: Locale
  children: React.ReactNode
}

export function NavLink({ href, locale, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      locale={locale}
      className={cn(
        "relative transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
        isActive
          ? "text-foreground after:absolute after:-bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:content-['']"
          : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  )
}
