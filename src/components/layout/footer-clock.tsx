"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterClockProps {
  label: string;
  className?: string;
}

// Live local clock pinned to America/Toronto (where Mark works from).
// Renders a placeholder until mount so SSR + hydration agree.
export function FooterClock({ label, className }: FooterClockProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Toronto",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
      aria-label={label}
    >
      <Clock className="size-3 opacity-70" aria-hidden="true" />
      <span aria-live="off" className="tabular-nums">
        {time ?? "--:--:--"}
      </span>
      <span className="opacity-60">EST</span>
    </span>
  );
}
