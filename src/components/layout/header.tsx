import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
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
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" locale={locale} className="flex items-center gap-3 font-mono text-sm">
          <span className="grid size-8 place-items-center rounded-md border bg-foreground text-background text-xs font-bold tracking-tight">
            M4
          </span>
          <span className="hidden sm:inline tracking-wide">M4rkyu.com</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm xl:flex" aria-label="Main navigation">
          {navItems.map(([key, href]) => (
            <NavLink key={key} href={href} locale={locale}>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <CommandPaletteTrigger />
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Link
            href="/portal"
            locale={locale}
            className="rounded-md border border-ring/60 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ring transition-colors hover:border-ring hover:bg-ring/10"
          >
            {t("portal")}
          </Link>
        </div>

        <MobileNav locale={locale} />
      </div>
    </header>
  );
}
