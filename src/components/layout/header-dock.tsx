"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HeaderDock({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.scrollY > 10;
        setScrolled((current) => (current === next ? current : next));
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "pointer-events-auto relative mx-auto flex h-12 w-full max-w-7xl items-center gap-2 rounded-2xl border px-2 backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow,transform] duration-(--motion-medium) ease-(--ease-premium) sm:gap-3 sm:px-3",
        scrolled
          ? "border-ring/35 bg-background/88 shadow-xl shadow-black/10 dark:shadow-black/35"
          : "border-border/70 bg-background/70 shadow-lg shadow-black/5 dark:shadow-black/20",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent transition-opacity duration-(--motion-medium)",
          scrolled ? "opacity-90" : "opacity-55",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-ring/45 to-transparent transition-opacity duration-(--motion-medium)",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      {children}
    </div>
  );
}
