import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { CommandPaletteIconTrigger } from "@/components/system/command-palette-icon-trigger";
import { NavLink } from "./nav-link";
import { MobileNav } from "./mobile-nav";

const navItems = [
  ["projects", "/projects"],
  ["games", "/games"],
  ["gallery", "/gallery"],
  ["blog", "/blog"],
  ["media", "/media"],
  ["resources", "/resources"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          locale={locale}
          className="flex shrink-0 items-center gap-2.5 font-mono text-sm transition-opacity duration-(--motion-fast) ease-(--ease-premium) hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-8 place-items-center rounded-md border bg-foreground text-background text-xs font-bold tracking-tight">
            M4
          </span>
          <span className="hidden tracking-wide sm:inline">M4rkyu.com</span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-x-5 gap-y-1 text-sm xl:flex"
          aria-label="Main navigation"
        >
          {navItems.map(([key, href]) => (
            <NavLink key={key} href={href} locale={locale}>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right rail (xl+): full Cmd-K pill + theme + lang. */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <CommandPaletteTrigger />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        {/* Compact rail (sm → xl): icon search + theme + menu. */}
        <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
          <CommandPaletteIconTrigger />
          <ThemeSwitcher />
          <MobileNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
