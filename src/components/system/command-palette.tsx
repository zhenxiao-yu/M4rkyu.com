"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Camera,
  Clock3,
  FileText,
  Gamepad2,
  Headphones,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Languages,
  Layers,
  ListChecks,
  Mail,
  Moon,
  NotebookPen,
  SearchX,
  ShoppingBag,
  Sun,
  User,
  Wrench,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "@/components/theme/theme-provider";
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
import { notes } from "@/content/notes";
import { resources } from "@/content/resources";
import { getShopProducts } from "@/content/shop";
import { openAudioPlayer } from "@/lib/audio/player-events";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/**
 * Slim post shape the palette indexes — keeps the prop payload
 * dependency-free and avoids leaking the full `Post` schema down
 * from the server boundary.
 */
export interface PalettePost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posts?: PalettePost[];
}

const PAGES: { key: string; href: string; icon: typeof Briefcase }[] = [
  { key: "projects", href: "/work", icon: Briefcase },
  { key: "games", href: "/games", icon: Gamepad2 },
  { key: "gallery", href: "/archive", icon: Camera },
  { key: "shop", href: "/shop", icon: ShoppingBag },
  { key: "blog", href: "/logs", icon: FileText },
  { key: "notes", href: "/notes", icon: NotebookPen },
  { key: "media", href: "/media", icon: ImageIcon },
  { key: "resources", href: "/resources", icon: Wrench },
  { key: "latest", href: "/latest", icon: Clock3 },
  { key: "changelog", href: "/changelog", icon: ListChecks },
  { key: "colophon", href: "/colophon", icon: FileText },
  { key: "about", href: "/about", icon: User },
  { key: "contact", href: "/contact", icon: Mail },
];

const PAGE_ALIASES: Record<string, string> = {
  gallery: "archive photos frames contact sheet images",
  blog: "logs writing posts articles devlog",
  projects: "work case studies portfolio",
  resources: "tools links bookmarks utilities",
  latest: "new recent updates feed timeline",
  changelog: "release notes changes ship log updates",
  colophon: "about this site stack technology credits build",
};

const THEMES = [
  { value: "light", icon: Sun, key: "themeLight" },
  { value: "dark", icon: Moon, key: "themeDark" },
] as const;

/**
 * Tiered scoring filter. Beats cmdk's default substring match by
 * promoting exact prefix and word-boundary hits ahead of mid-string
 * substrings, then falls back to in-order fuzzy as a last resort.
 * Returning 0 hides the row — cmdk re-runs this for every keystroke
 * across the full item set, so it stays a pure function.
 */
function rankCommand(value: string, search: string): number {
  const needle = search.trim().toLowerCase();
  if (!needle) return 1;
  const haystack = value.toLowerCase();
  if (haystack.startsWith(needle)) return 1;
  for (const word of haystack.split(/\s+/)) {
    if (word.startsWith(needle)) return 0.85;
  }
  if (haystack.includes(needle)) return 0.6;
  // Fuzzy: every needle char appears in order somewhere in haystack.
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length ? 0.3 : 0;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return <>{text}</>;
  const before = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const after = text.slice(index + needle.length);
  return (
    <>
      {before}
      <mark className="rounded-sm bg-ring/20 px-0.5 text-foreground">
        {match}
      </mark>
      {after}
    </>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  posts,
}: CommandPaletteProps) {
  const tNav = useTranslations("Navigation");
  const tPalette = useTranslations("CommandPalette");
  const tBlog = useTranslations("Blog");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { setTheme } = useTheme();
  const [search, setSearch] = useState("");

  const recentFrames = useMemo(
    () => galleryItems.filter((item) => item.status === "ready").slice(0, 6),
    [],
  );

  const writingItems = useMemo(() => (posts ?? []).slice(0, 20), [posts]);
  const noteItems = useMemo(
    () =>
      notes
        .filter((note) => note.status === "ready")
        .slice(0, 16),
    [],
  );
  const resourceItems = useMemo(
    () =>
      resources
        .filter((resource) => resource.status === "ready")
        .slice(0, 18),
    [],
  );
  const shopItems = useMemo(() => getShopProducts().slice(0, 8), []);

  const filter = useCallback(
    (value: string, search: string) => rankCommand(value, search),
    [],
  );

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function pickTheme(value: "light" | "dark") {
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

  function openAudio() {
    onOpenChange(false);
    window.setTimeout(() => {
      const trigger = document.querySelector<HTMLButtonElement>(
        'button[data-audio-settings-trigger="true"]',
      );
      if (trigger) {
        trigger.click();
        return;
      }
      openAudioPlayer();
    }, 0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          // Shared frame — flex column so CommandList can fill remaining
          // vertical space after the input + (mobile) drag handle.
          "flex flex-col gap-0 overflow-hidden p-0",
          // Desktop modal — wider list, capped height so very tall
          // viewports don't waste space.
          "md:max-w-2xl md:max-h-[min(70dvh,38rem)]",
          // Mobile bottom sheet — anchored to the bottom of the screen
          // with rounded top corners, leaving a sliver of overlay above
          // so the user can tap-to-dismiss. Cancel DialogContent's
          // centered transforms via translate-x/y-0. `w-full` overrides
          // the base `w-[calc(100vw-2rem)]` so the sheet spans edge to
          // edge instead of leaving a 32px gutter that lets background
          // chrome poke through.
          "max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto",
          "max-md:h-[88dvh] max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0",
          "max-md:rounded-b-none max-md:rounded-t-2xl",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{tPalette("title")}</DialogTitle>
          <DialogDescription>{tPalette("description")}</DialogDescription>
        </VisuallyHidden>

        {/* Drag handle — mobile only. Purely visual cue that this is a
         * sheet; Radix Dialog doesn't implement swipe-to-close, so
         * dismissal stays via overlay tap or the Esc key. */}
        <div
          aria-hidden="true"
          className="grid shrink-0 place-items-center pb-1 pt-2.5 md:hidden"
        >
          <span className="h-1.5 w-12 rounded-full bg-border" />
        </div>

        <Command
          label={tPalette("title")}
          filter={filter}
          className="flex min-h-0 flex-1 flex-col rounded-md max-md:rounded-b-none"
        >
          <CommandInput
            placeholder={tPalette("searchPlaceholder")}
            value={search}
            onValueChange={setSearch}
            // The input is the natural autofocus target — cmdk handles
            // this for us, but we ensure the CSS height stays large
            // enough for a tappable surface on touch.
            className="h-12 text-base sm:h-11 sm:text-sm"
          />
          <CommandList>
            <CommandEmpty>
              <div className="grid place-items-center gap-3 py-10 text-center text-muted-foreground">
                <SearchX aria-hidden="true" className="size-5 opacity-60" />
                <span className="text-sm">{tPalette("noResults")}</span>
              </div>
            </CommandEmpty>

            <CommandGroup heading={tPalette("pagesGroup")}>
              {PAGES.map((page) => {
                const Icon = page.icon;
                const label = tNav(page.key);
                return (
                  <CommandItem
                    key={page.href}
                    value={`${label} ${page.key} ${page.href} ${PAGE_ALIASES[page.key] ?? ""}`}
                    onSelect={() => go(page.href)}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 opacity-70"
                    />
                    <span className="truncate">
                      <HighlightedText text={label} query={search} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                    >
                      {page.href}
                    </span>
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
                      onSelect={() => go(`/archive?frame=${item.slug}`)}
                    >
                      <Layers
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70"
                      />
                      <span className="truncate">
                        <HighlightedText text={item.title} query={search} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        {item.collection}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {writingItems.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={tBlog("paletteHeading")}>
                  {writingItems.map((post) => (
                    <CommandItem
                      key={post.slug}
                      value={`${post.title} ${post.category} ${post.tags.join(" ")}`}
                      onSelect={() => go(`/logs/${post.slug}`)}
                    >
                      <BookOpen
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70"
                      />
                      <span className="truncate">
                        <HighlightedText text={post.title} query={search} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        {post.category}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {noteItems.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={tPalette("notesGroup")}>
                  {noteItems.map((note) => (
                    <CommandItem
                      key={note.slug}
                      value={`${note.title ?? note.body} ${note.kind} ${note.tags.join(" ")}`}
                      onSelect={() => go(`/notes#${note.slug}`)}
                    >
                      <NotebookPen
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70"
                      />
                      <span className="truncate">
                        <HighlightedText
                          text={note.title ?? note.body.split("\n")[0] ?? note.slug}
                          query={search}
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        {note.kind}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {resourceItems.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={tPalette("resourcesGroup")}>
                  {resourceItems.map((resource) => (
                    <CommandItem
                      key={resource.slug}
                      value={`${resource.name} ${resource.category} ${resource.tags.join(" ")} ${resource.type}`}
                      onSelect={() => go(`/resources/${resource.slug}`)}
                    >
                      <Wrench
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70"
                      />
                      <span className="truncate">
                        <HighlightedText text={resource.name} query={search} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        {resource.category}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {shopItems.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={tPalette("shopGroup")}>
                  {shopItems.map((product) => (
                    <CommandItem
                      key={product.slug}
                      value={`${product.title} ${product.category} ${product.tags.join(" ")}`}
                      onSelect={() => go(`/shop/${product.slug}`)}
                    >
                      <ShoppingBag
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70"
                      />
                      <span className="truncate">
                        <HighlightedText text={product.title} query={search} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        {product.category}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            <CommandSeparator />

            <CommandGroup heading={tPalette("quickActionsGroup")}>
              <CommandItem
                value={`audio music sound player ${tPalette("openAudio")}`}
                onSelect={openAudio}
              >
                <Headphones
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-70"
                />
                <span className="truncate">{tPalette("openAudio")}</span>
              </CommandItem>
              <CommandItem
                value={`saved bookmarks favorites ${tPalette("openSaved")}`}
                onSelect={() => go("/account/saved")}
              >
                <Heart
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-70"
                />
                <span className="truncate">{tPalette("openSaved")}</span>
              </CommandItem>
              <CommandItem
                value={`keyboard shortcuts help command palette ${tPalette("shortcutsHelp")}`}
                onSelect={() => setSearch("shortcut")}
              >
                <HelpCircle
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-70"
                />
                <span className="truncate">{tPalette("shortcutsHelp")}</span>
                <span
                  aria-hidden="true"
                  className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                >
                  ⌘K · ↑↓ · ↵ · esc
                </span>
              </CommandItem>
            </CommandGroup>

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
                      className="size-4 shrink-0 opacity-70"
                    />
                    <span className="truncate">{tPalette(entry.key)}</span>
                  </CommandItem>
                );
              })}
              <CommandItem
                value={`language ${locale === "en" ? "中文" : "English"}`}
                onSelect={() => pickLocale(locale === "en" ? "zh" : "en")}
              >
                <Languages
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-70"
                />
                <span className="truncate">{tPalette("toggleLocale")}</span>
                <span
                  aria-hidden="true"
                  className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                >
                  {locale === "en" ? "中文" : "EN"}
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          {/* Keyboard hint strip — hidden on touch / small screens since
           * the kbd shortcuts don't apply there. */}
          <div className="hidden shrink-0 items-center gap-3 border-t px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">↑↓</kbd>
              {tPalette("hintNavigate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">↵</kbd>
              {tPalette("hintSelect")}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">
                esc
              </kbd>
              {tPalette("hintClose")}
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
