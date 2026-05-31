---
title: "Build a ⌘K command palette in Next.js (App Router)"
published: false
description: "A from-scratch, accessible, keyboard-driven command palette for Next.js 16 and React 19 — fuzzy search, focus trapping, and a platform-aware shortcut hint with no hydration mismatch."
tags: nextjs, react, typescript, webdev
cover_image: https://images.unsplash.com/photo-1560457079-9a6532ccb118?w=1000&q=80
---

A few months ago I was watching someone use my portfolio site over a screen share, and they kept reaching for the mouse to jump between pages. I had a perfectly good nav bar. They wanted ⌘K. That little Spotlight-style box has quietly become muscle memory — Linear, Raycast, Vercel, GitHub, Notion all ship one — and when it's missing, power users feel the gap before they can name it.

So I built one for my own site. Not a dependency, not a kitchen-sink modal library — a real, accessible, keyboard-driven palette in a few hundred lines, running on Next.js 16's App Router and React 19. This is the version that actually shipped, including the one detail nobody warns you about: the platform-aware shortcut hint that quietly breaks hydration if you do it the obvious way.

## What "good" actually means here

Before any code, the bar. A command palette is a tiny app with outsized accessibility expectations:

- Opens on **⌘K (macOS) or Ctrl+K (everywhere else)**, from anywhere on the page.
- **Fuzzy search** over commands — navigate routes, toggle theme, run actions.
- **Full keyboard nav**: arrows to move, Enter to run, Esc to close.
- **Screen-reader correct**: it's a dialog containing a listbox, and the active option is announced.
- **Focus is trapped** while open and **restored** to wherever you were when it closes.
- The shortcut hint reads `⌘K` on Apple hardware and `Ctrl K` elsewhere — without a hydration mismatch.

That last one is the trap. Let's get it out of the way first, because it shapes the rest.

## The platform hint that doesn't blow up hydration

The naive approach is `navigator.platform.includes("Mac")` inside the component. On the server, `navigator` doesn't exist, so you guard it — and now the server renders one thing and the client renders another. React 19 will scream about a hydration mismatch, and you'll see a flash of the wrong key.

The clean fix is [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), which exists precisely for reading browser-only values without breaking SSR. Its third argument, `getServerSnapshot`, gives React a *stable* value for the server render and the first client render, then swaps to the real value on a follow-up pass. No mismatch, just a correction.

```ts
// lib/use-is-apple.ts
import { useSyncExternalStore } from "react";

// The store never changes after load, so subscribe is a no-op.
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  // userAgentData is the modern path; userAgent is the fallback.
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

// Server + first client render: assume non-Apple. React reconciles after.
function getServerSnapshot(): boolean {
  return false;
}

export function useIsApple(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

> The rule that matters: `getServerSnapshot` must return the *exact same value* on the server and on the first client render. Returning `false` on both sides keeps hydration happy; React then re-renders with the true value once it's interactive. [TkDodo's write-up](https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store) is the clearest explanation I've found of why this beats the old `useEffect`-with-a-flag dance.

`navigator.platform` is technically deprecated, which is why I check `userAgentData.platform` first and only fall back. The hint component is then trivial:

```tsx
"use client";
import { useIsApple } from "@/lib/use-is-apple";

export function ShortcutHint() {
  const isApple = useIsApple();
  return (
    <kbd className="rounded border px-1.5 py-0.5 text-xs font-medium">
      {isApple ? "⌘" : "Ctrl"} K
    </kbd>
  );
}
```

## The provider: one global keydown, one open state

I want any component to open the palette and trigger it from a single keyboard shortcut. A small context provider is the right amount of structure — not a state-management library, just `useState` and an effect.

```tsx
// components/command-palette-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CommandPalette } from "./command-palette";

type PaletteContext = { open: boolean; setOpen: (open: boolean) => void };
const Ctx = createContext<PaletteContext | null>(null);

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette must be used within provider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // stop the browser's own ⌘K
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </Ctx.Provider>
  );
}
```

The `e.metaKey || e.ctrlKey` check is the whole cross-platform story for the listener — `metaKey` is ⌘ on macOS, `ctrlKey` covers Windows and Linux. `e.preventDefault()` matters because some browsers bind ⌘K to the address bar's search. Lowercasing `e.key` guards against a held Shift turning `k` into `K`.

In the App Router, this provider is a client component dropped into your root `layout.tsx`, wrapping `children`. The layout itself stays a server component:

```tsx
// app/layout.tsx  (server component)
import { CommandPaletteProvider } from "@/components/command-palette-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </body>
    </html>
  );
}
```

## Defining commands as data

Commands are just a list. Keeping them as data — not JSX — makes filtering and keyboard nav fall out naturally. Each one carries a search-friendly `keywords` string and a `run` callback.

```tsx
import type { useRouter } from "next/navigation";

export type Command = {
  id: string;
  label: string;
  keywords: string;
  group: "Navigation" | "Actions";
  run: (router: ReturnType<typeof useRouter>) => void;
};

export const commands: Command[] = [
  {
    id: "home",
    label: "Go to Home",
    keywords: "home index landing start",
    group: "Navigation",
    run: (router) => router.push("/"),
  },
  {
    id: "work",
    label: "Go to Work",
    keywords: "work projects portfolio case studies",
    group: "Navigation",
    run: (router) => router.push("/work"),
  },
  {
    id: "theme",
    label: "Toggle theme",
    keywords: "dark light mode appearance",
    group: "Actions",
    run: () => document.documentElement.classList.toggle("dark"),
  },
];
```

> Note the import: in the App Router, `useRouter` comes from **`next/navigation`**, not `next/router`. That older path is Pages Router only and will throw if you reach for it here.

A small fuzzy matcher keeps the bundle lean — it checks that the query's characters appear in order, then ranks tighter matches higher. For a few hundred commands this is plenty; reach for a library only when you outgrow it.

```ts
// lib/fuzzy.ts
export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 1;
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak++;
      score += streak;       // consecutive hits are worth more
      qi++;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : 0; // 0 means "no match"
}
```

## The palette: filtering, keyboard nav, and ARIA

Now the component itself. The search input owns focus; the list is a `listbox`; each command is an `option`. I track the highlighted index in state and point `aria-activedescendant` at the active option's id — that's **roving virtual focus**, which lets the input keep real DOM focus (so typing works) while the listbox still announces the active row to screen readers.

```tsx
// components/command-palette.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commands } from "@/lib/commands";
import { fuzzyScore } from "@/lib/fuzzy";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    return commands
      .map((c) => ({ c, score: fuzzyScore(query, `${c.label} ${c.keywords}`) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ c }) => c);
  }, [query]);

  // Reset + manage focus when opening/closing.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setQuery("");
      setActive(0);
      // focus after paint so the element exists
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      previouslyFocused.current?.focus(); // restore focus on close
    }
  }, [open]);

  // Keep the highlighted index in range as results shrink.
  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) {
        onOpenChange(false);
        cmd.run(router);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-listbox"
          aria-activedescendant={
            results[active] ? `cmd-${results[active].id}` : undefined
          }
          placeholder="Type a command or search…"
          className="w-full border-b bg-transparent px-4 py-3 outline-none"
        />
        <ul id="cmd-listbox" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </li>
          )}
          {results.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`cmd-${cmd.id}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                onOpenChange(false);
                cmd.run(router);
              }}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                i === active ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              {cmd.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

A few decisions worth calling out:

- **Focus restore** uses a ref captured at open time, so closing the palette returns you to the button (or link) you came from. Skipping this is the most common a11y miss I see in homegrown palettes.
- **`aria-activedescendant`** points at the highlighted `option`'s id while the input keeps real focus — that's the pattern the [ARIA combobox/listbox practices](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) prescribe for exactly this UI.
- **Wrapping arrow nav** (`% results.length`) means ArrowDown past the last item loops to the first, which feels right in a short list.
- I render `null` when closed instead of toggling CSS, so there's nothing focusable behind the scenes when the palette is dismissed.

The one corner this hand-rolled version cuts: real focus *trapping* against Tab. With `role="dialog"` and `aria-modal="true"` plus a single text input, there's little to Tab to, but a production-grade version should still loop Tab within the dialog. That's also the moment I'd consider reaching for a library.

## When to reach for `cmdk` instead

I rolled my own because my command list is small and I wanted total control over the markup and motion. But [`cmdk`](https://github.com/pacocoursey/cmdk) (v1.1.1 as of early 2025) is the batteries-included answer, and it's excellent — it ships the fuzzy filtering, keyboard nav, and ARIA wiring, tested against VoiceOver, and stays fast into the low thousands of items.

| | Roll your own | `cmdk` |
|---|---|---|
| Bundle cost | ~0 (your code) | small dep |
| Fuzzy + a11y | you own it | done for you |
| Markup control | total | composable but opinionated |
| Best when | small/bespoke palette | many items, want it solid fast |

One honest caveat for React 19: `cmdk` still lists React 18 as its peer dependency, so a plain `npm install` may complain. With the App Router on React 19 you'll typically install via `npm i cmdk --legacy-peer-deps` (pnpm, yarn, and bun resolve it cleanly), and shadcn/ui — whose [`Command`](https://ui.shadcn.com/docs/components/command) component wraps `cmdk` — documents the same flag. It works fine at runtime; it's a metadata lag, not a real incompatibility.

```bash
npm i cmdk --legacy-peer-deps
```

## Takeaway

The palette itself is a weekend's work; the parts that separate "demo" from "shippable" are the unglamorous ones — restoring focus on close, getting `aria-activedescendant` right, and handling the platform hint through `useSyncExternalStore` so React doesn't trip over hydration. Start with the hand-rolled version to learn where the sharp edges are. When your command list grows past a couple hundred entries or you need bulletproof focus trapping, drop in `cmdk` and keep the same provider and shortcut listener you already wrote. The keybinding is the contract with your users; the implementation underneath is yours to swap.

---

*Cover photo by [Sam Albury](https://unsplash.com/photos/oA7MMRxTVzo) on [Unsplash](https://unsplash.com/).*
