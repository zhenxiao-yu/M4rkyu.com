"use client";

import { useEffect, useState } from "react";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { PostHeading } from "./post-body";

interface PostTocProps {
  headings: PostHeading[];
  /** i18n'd rail label, e.g. "On this page". */
  label: string;
}

/**
 * Sticky reading-outline for the long-form post layout — lives in the left
 * gutter on wide screens (the page grid gates visibility + the sticky
 * offset). Scroll-spy highlights the section currently near the top via an
 * IntersectionObserver; it only changes link colour, so it's inert under
 * reduced motion. Anchors are native `#id` jumps (headings carry matching
 * ids + `scroll-mt` from PostBody).
 */
export function PostToc({ headings, label }: PostTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The topmost (document-order) heading inside the reading band wins.
        const current = headings.find((h) => visible.has(h.id));
        if (current) setActiveId(current.id);
      },
      // Bottom edge pulled up so a heading activates as it nears the top
      // rather than the moment it first peeks into the viewport.
      { rootMargin: "-72px 0px -68% 0px", threshold: 0 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={label}>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground/70">
        {label}
      </p>
      <ul className="mt-4 border-l border-border/50">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "-ml-px block border-l-2 py-1 font-mono text-[0.72rem] leading-snug transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                  h.depth === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-ring text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
