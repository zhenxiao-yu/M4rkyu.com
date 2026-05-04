import { cn } from "@/lib/utils"

const speeds: Record<string, string> = {
  slow:   "50s",
  normal: "28s",
  fast:   "14s",
}

interface MarqueeProps {
  items: string[]
  speed?: "slow" | "normal" | "fast"
  separator?: string
  className?: string
}

export function Marquee({
  items,
  speed = "normal",
  separator = "·",
  className,
}: MarqueeProps) {
  const text = items.join(` ${separator} `) + ` ${separator} `

  return (
    <div className={cn("group overflow-hidden", className)} aria-hidden="true">
      <div
        className="flex w-max group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee ${speeds[speed]} linear infinite` }}
      >
        <span className="whitespace-nowrap">{text}</span>
        <span className="whitespace-nowrap">{text}</span>
      </div>
    </div>
  )
}
