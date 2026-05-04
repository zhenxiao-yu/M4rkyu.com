import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { MobileNav } from "./mobile-nav";

const navItems = [
  ["projects", "/projects"],
  ["gallery", "/gallery"],
  ["blog", "/blog"],
  ["resources", "/resources"],
  ["tools", "/tools"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" locale={locale} className="flex items-center gap-3 font-mono text-sm">
          <span className="grid size-8 place-items-center rounded-md border bg-foreground text-background">
            M4
          </span>
          <span className="hidden sm:inline">M4rkyu.com</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex" aria-label="Main navigation">
          {navItems.map(([key, href]) => (
            <Link key={key} href={href} locale={locale} className="transition-colors hover:text-foreground">
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Link
            href="/portal"
            locale={locale}
            className="rounded-md border border-ring px-3 py-2 text-sm font-medium"
          >
            {t("portal")}
          </Link>
        </div>
        <MobileNav locale={locale} />
      </div>
    </header>
  );
}
