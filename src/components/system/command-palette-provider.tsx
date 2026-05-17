"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PalettePost } from "./command-palette";

// Dynamic import keeps cmdk + Radix Dialog + the lucide icon set +
// the gallery content payload out of the initial JS bundle on every
// route. The dialog body is only fetched the first time the user
// opens the palette (Cmd+K or trigger button).
const CommandPalette = dynamic(
  () => import("./command-palette").then((mod) => mod.CommandPalette),
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
  // Latch flips the first time the palette opens so the dynamic
  // import is initiated only on demand — we keep the chunk mounted
  // afterwards so subsequent opens are instant.
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

  const value = useMemo(
    () => ({ open, setOpen: handleSetOpen, toggle }),
    [open, handleSetOpen, toggle],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {hasOpened ? (
        <CommandPalette open={open} onOpenChange={handleSetOpen} posts={posts} />
      ) : null}
    </CommandPaletteContext.Provider>
  );
}
