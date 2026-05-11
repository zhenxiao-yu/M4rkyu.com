import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/system/language-switcher";
import { SoundToggle } from "@/components/system/sound-toggle";
import { CommandPaletteTrigger } from "@/components/system/command-palette-trigger";
import { CommandPaletteIconTrigger } from "@/components/system/command-palette-icon-trigger";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { buildNavStructure, type NavLabels } from "./nav-structure";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const tCategories = await getTranslations({ locale, namespace: "Categories" });

  const labels: NavLabels = {
    work: t("work"),
    archive: t("archive"),
    logs: t("logs"),
    allWork: t("allWork"),
    visualArchive: t("visualArchive"),
    writing: t("writing"),
    games: t("games"),
    media: t("media"),
    resources: t("resources"),
    about: t("about"),
    contact: t("contact"),
    categoryWebApp: tCategories("web-app"),
    categoryAiTool: tCategories("ai-tool"),
    categoryExperiment: tCategories("experiment"),
  };

  const structure = buildNavStructure(labels);

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
          <span className="hidden tracking-wide sm:inline">M4RKYU.SYS</span>
        </Link>

        <DesktopNav
          locale={locale}
          groups={structure.groups}
          flatLinks={structure.flatLinks}
          ariaLabel="Main navigation"
        />

        {/* Desktop right rail (lg+): full Cmd-K pill + lang + theme + sound. */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <CommandPaletteTrigger />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <SoundToggle />
        </div>

        {/* Compact rail (<lg): icon search + theme + menu. */}
        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <CommandPaletteIconTrigger />
          <ThemeSwitcher />
          <MobileNav locale={locale} groups={structure.groups} flatLinks={structure.flatLinks} />
        </div>
      </div>
    </header>
  );
}
