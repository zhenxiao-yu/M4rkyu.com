"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

interface FooterBackToTopProps {
  label: string;
}

// Appears at full opacity once the user has scrolled past 600px; sits
// at 60% opacity above the fold so it doesn't disappear entirely on
// short pages. Honors prefers-reduced-motion by skipping smooth scroll.
export function FooterBackToTop({ label }: FooterBackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollUp() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-[opacity,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground motion-safe:hover:-translate-y-0.5",
        visible ? "opacity-100" : "opacity-50",
        FOCUS_RING,
      )}
    >
      <ArrowUp className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
