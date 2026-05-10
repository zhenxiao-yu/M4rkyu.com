"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CommandPalette, type PalettePost } from "./command-palette";

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

  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.defaultPrevented) return;
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
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} posts={posts} />
    </CommandPaletteContext.Provider>
  );
}
