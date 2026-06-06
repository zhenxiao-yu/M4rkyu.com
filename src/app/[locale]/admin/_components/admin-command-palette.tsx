"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderGit2,
  Gamepad2,
  Clapperboard,
  Images,
  BookMarked,
  StickyNote,
  ShoppingBag,
  UserCog,
  MessageSquare,
  Users,
  Plus,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
import { rankCommand } from "@/lib/search/rank";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Entry = {
  key:
    | "overview"
    | "projects"
    | "games"
    | "media"
    | "gallery"
    | "resources"
    | "notes"
    | "shop"
    | "profile"
    | "comments"
    | "users";
  href: string;
  icon: LucideIcon;
};

// Every admin section — the "jump to" group.
const SECTIONS: Entry[] = [
  { key: "overview", href: "/admin", icon: LayoutDashboard },
  { key: "projects", href: "/admin/projects", icon: FolderGit2 },
  { key: "games", href: "/admin/games", icon: Gamepad2 },
  { key: "media", href: "/admin/media", icon: Clapperboard },
  { key: "gallery", href: "/admin/gallery", icon: Images },
  { key: "resources", href: "/admin/resources", icon: BookMarked },
  { key: "notes", href: "/admin/notes", icon: StickyNote },
  { key: "shop", href: "/admin/shop", icon: ShoppingBag },
  { key: "profile", href: "/admin/profile", icon: UserCog },
  { key: "comments", href: "/admin/comments", icon: MessageSquare },
  { key: "users", href: "/admin/users", icon: Users },
];

// Content types that support a "New …" action (singletons like profile and
// the moderation views are excluded).
const CREATE: Entry[] = [
  { key: "projects", href: "/admin/projects/new", icon: FolderGit2 },
  { key: "games", href: "/admin/games/new", icon: Gamepad2 },
  { key: "media", href: "/admin/media/new", icon: Clapperboard },
  { key: "gallery", href: "/admin/gallery/new", icon: Images },
  { key: "resources", href: "/admin/resources/new", icon: BookMarked },
  { key: "notes", href: "/admin/notes/new", icon: StickyNote },
  { key: "shop", href: "/admin/shop/new", icon: ShoppingBag },
];

/**
 * Admin ⌘K palette — jump to any section or start a new entry. Mounted only
 * inside the admin layout; the global site palette deliberately yields ⌘K on
 * admin routes (see CommandPaletteProvider) so the two never both fire. Also
 * opens on a window `admin:command` event so a touch trigger in the nav can
 * raise it without keyboard.
 */
export function AdminCommandPalette() {
  const t = useTranslations("Admin");
  const tp = useTranslations("CommandPalette");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.defaultPrevented) return;
      if (
        typeof event.key === "string" &&
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    function onTrigger() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("admin:command", onTrigger);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("admin:command", onTrigger);
    };
  }, []);

  const filter = useCallback(
    (value: string, query: string) => rankCommand(value, query),
    [],
  );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        hideCloseButton
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          "md:max-w-xl md:max-h-[min(70dvh,34rem)]",
          "max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto",
          "max-md:h-[80dvh] max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0",
          "max-md:rounded-b-none max-md:rounded-t-2xl",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{tp("title")}</DialogTitle>
          <DialogDescription>{tp("description")}</DialogDescription>
        </VisuallyHidden>

        <div
          aria-hidden="true"
          className="grid shrink-0 place-items-center pb-1 pt-2.5 md:hidden"
        >
          <span className="h-1.5 w-12 rounded-full bg-border" />
        </div>

        <Command
          label={tp("title")}
          filter={filter}
          className="flex min-h-0 flex-1 flex-col rounded-md max-md:rounded-b-none"
        >
          <CommandInput
            placeholder={tp("searchPlaceholder")}
            value={search}
            onValueChange={setSearch}
            className="h-12 text-base sm:h-11 sm:text-sm"
          />
          <CommandList>
            <CommandEmpty>
              <div className="grid place-items-center gap-3 py-10 text-center text-muted-foreground">
                <SearchX aria-hidden="true" className="size-5 opacity-60" />
                <span className="text-sm">{tp("noResults")}</span>
              </div>
            </CommandEmpty>

            <CommandGroup heading={t("palette.jump")}>
              {SECTIONS.map((entry) => {
                const Icon = entry.icon;
                const label = t(entry.key);
                return (
                  <CommandItem
                    key={`go-${entry.href}`}
                    value={`${label} ${entry.key} ${entry.href}`}
                    onSelect={() => go(entry.href)}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 opacity-70"
                    />
                    <span className="truncate">{label}</span>
                    <span
                      aria-hidden="true"
                      className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70"
                    >
                      {entry.href}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={t("palette.create")}>
              {CREATE.map((entry) => {
                const label = `${t("manageNew")} · ${t(entry.key)}`;
                return (
                  <CommandItem
                    key={`new-${entry.href}`}
                    value={`${t("manageNew")} ${t(entry.key)} ${entry.key} create add`}
                    onSelect={() => go(entry.href)}
                  >
                    <Plus
                      aria-hidden="true"
                      className="size-4 shrink-0 opacity-70"
                    />
                    <span className="truncate">{label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          <div className="hidden shrink-0 items-center gap-3 border-t px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">↑↓</kbd>
              {tp("hintNavigate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">↵</kbd>
              {tp("hintSelect")}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5">esc</kbd>
              {tp("hintClose")}
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
