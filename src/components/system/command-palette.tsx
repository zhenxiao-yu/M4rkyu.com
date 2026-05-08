"use client";

import { useMemo } from "react";
import {
  Briefcase,
  Camera,
  CircleDot,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Languages,
  Layers,
  Mail,
  Moon,
  Sun,
  Terminal,
  User,
  Wrench,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { galleryItems } from "@/content/gallery";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGES: { key: string; href: string; icon: typeof Briefcase }[] = [
  { key: "projects", href: "/projects", icon: Briefcase },
  { key: "games", href: "/games", icon: Gamepad2 },
  { key: "gallery", href: "/gallery", icon: Camera },
  { key: "blog", href: "/blog", icon: FileText },
  { key: "media", href: "/media", icon: ImageIcon },
  { key: "resources", href: "/resources", icon: Wrench },
  { key: "about", href: "/about", icon: User },
  { key: "contact", href: "/contact", icon: Mail },
  { key: "portal", href: "/portal", icon: Terminal },
];

const THEMES = [
  { value: "light", icon: Sun, key: "themeLight" },
  { value: "dark", icon: Moon, key: "themeDark" },
  { value: "monochrome", icon: CircleDot, key: "themeMono" },
] as const;

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const tNav = useTranslations("Navigation");
  const tPalette = useTranslations("CommandPalette");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { setTheme } = useTheme();

  const recentFrames = useMemo(
    () =>
      galleryItems
        .filter((item) => item.status === "ready")
        .slice(0, 6),
    [],
  );

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function pickTheme(value: string) {
    setTheme(value);
    onOpenChange(false);
  }

  function pickLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      onOpenChange(false);
      return;
    }
    onOpenChange(false);
    const rest = pathname.replace(/^\/(en|zh)/, "") || "/";
    router.replace(rest, { locale: nextLocale });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-xl gap-0 overflow-hidden p-0"
      >
        <VisuallyHidden>
          <DialogTitle>{tPalette("title")}</DialogTitle>
          <DialogDescription>{tPalette("description")}</DialogDescription>
        </VisuallyHidden>
        <Command label={tPalette("title")} className="rounded-md">
          <CommandInput placeholder={tPalette("searchPlaceholder")} />
          <CommandList>
            <CommandEmpty>{tPalette("noResults")}</CommandEmpty>

            <CommandGroup heading={tPalette("pagesGroup")}>
              {PAGES.map((page) => {
                const Icon = page.icon;
                return (
                  <CommandItem
                    key={page.href}
                    value={`${tNav(page.key)} ${page.key}`}
                    onSelect={() => go(page.href)}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span>{tNav(page.key)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {recentFrames.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={tPalette("recentGroup")}>
                  {recentFrames.map((item) => (
                    <CommandItem
                      key={item.slug}
                      value={`${item.title} ${item.collection} ${item.tags.join(" ")}`}
                      onSelect={() => go(`/gallery?frame=${item.slug}`)}
                    >
                      <Layers
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      <span className="truncate">{item.title}</span>
                      <span className="ml-auto truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.collection}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            <CommandSeparator />

            <CommandGroup heading={tPalette("settingsGroup")}>
              {THEMES.map((entry) => {
                const Icon = entry.icon;
                return (
                  <CommandItem
                    key={entry.value}
                    value={`theme ${entry.value} ${tPalette(entry.key)}`}
                    onSelect={() => pickTheme(entry.value)}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span>{tPalette(entry.key)}</span>
                  </CommandItem>
                );
              })}
              <CommandItem
                value={`language ${locale === "en" ? "中文" : "English"}`}
                onSelect={() => pickLocale(locale === "en" ? "zh" : "en")}
              >
                <Languages
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                <span>{tPalette("toggleLocale")}</span>
                <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {locale === "en" ? "中文" : "EN"}
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          <div className="flex items-center justify-end gap-2 border-t px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{tPalette("hintNavigate")}</span>
            <kbd className="rounded border px-1.5 py-0.5">↑↓</kbd>
            <span>{tPalette("hintSelect")}</span>
            <kbd className="rounded border px-1.5 py-0.5">↵</kbd>
            <span>{tPalette("hintClose")}</span>
            <kbd className="rounded border px-1.5 py-0.5">esc</kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
