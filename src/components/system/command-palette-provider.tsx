"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import type { PalettePost } from "./command-palette";

// The palette (cmdk + its icon set, ~127 KB) is a ⌘K modal — defer the
// download until first open instead of shipping it in First Load JS. The
// render is already gated behind `hasOpened`, so this only changes when the
// chunk is fetched, not when it shows.
const CommandPalette = dynamic(
  () => import("./command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used inside <CommandPaletteProvider>",
    );
  }
  return ctx;
}

interface CommandPaletteProviderProps {
  children: ReactNode;
  posts?: PalettePost[];
}

export function CommandPaletteProvider({
  children,
  posts,
}: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);
  const [loadedPosts, setLoadedPosts] = useState<PalettePost[] | undefined>(
    posts,
  );
  const postsRequestedRef = useRef(Boolean(posts));
  const [hasOpened, setHasOpened] = useState(false);

  const toggle = useCallback(() => {
    setOpen((value) => !value);
    setHasOpened(true);
  }, []);

  const handleSetOpen = useCallback((next: boolean) => {
    setOpen(next);
    if (next) setHasOpened(true);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.defaultPrevented) return;
      if (typeof event.key !== "string") return;
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  useEffect(() => {
    if (!hasOpened || postsRequestedRef.current) return;

    const controller = new AbortController();
    postsRequestedRef.current = true;

    fetch("/api/command-palette/posts", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { posts?: PalettePost[] } | null) => {
        if (Array.isArray(payload?.posts)) {
          setLoadedPosts(payload.posts);
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          console.warn("[command-palette] failed to load posts", error);
        }
      });

    return () => controller.abort();
  }, [hasOpened]);

  const value = useMemo(
    () => ({ open, setOpen: handleSetOpen, toggle }),
    [open, handleSetOpen, toggle],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {hasOpened ? (
        <CommandPalette
          open={open}
          onOpenChange={handleSetOpen}
          posts={loadedPosts}
        />
      ) : null}
    </CommandPaletteContext.Provider>
  );
}
