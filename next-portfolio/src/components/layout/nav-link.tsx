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
        "relative transition-colors duration-[180ms] hover:text-foreground",
        isActive
          ? "text-foreground after:absolute after:-bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:content-['']"
          : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  )
}
