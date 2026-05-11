import * as React from "react";
import { PixelPanel } from "@/components/ui/pixel/pixel-panel";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface CommandHeroStatus {
  /** Short label shown next to the live dot (e.g. project title). */
  label: string;
  /** Optional internal href the label links to. */
  href?: string;
  /** Optional accessible label override. Defaults to `Open ${label}`. */
  accessibleLabel?: string;
}

interface CommandHeroProps {
  /** Optional live data point — typically the latest shipping project. */
  status?: CommandHeroStatus;
  /**
   * ASCII / VT323 brand mark rendered in the panel body. Defaults to a
   * static M4RKYU.SYS readout. Pass a React node to swap in a custom mark.
   */
  markGlyph?: React.ReactNode;
  /** Version label rendered in the title bar. */
  versionLabel?: string;
  className?: string;
}

const DEFAULT_MARK = `> M4RKYU
> SYSTEM ONLINE
> ENGINEER · ARTIST · DEV`;

export function CommandHero({
  status,
  markGlyph,
  versionLabel = "v2027",
  className,
}: CommandHeroProps) {
  return (
    <BlurFade className={cn("h-full", className)}>
      <PixelPanel
        eyebrow="m4rkyu.sys"
        title={versionLabel}
        // The hero owns the page <h1>; this panel header belongs at h3.
        headingLevel={3}
        className="relative h-full overflow-hidden"
      >
        {/* atmospheric grid substrate, masked to the panel body */}
        <div
          aria-hidden="true"
          className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"
        />
        <div className="relative flex min-h-[16rem] flex-col justify-between gap-8 py-4 text-center">
          <pre
            aria-hidden="true"
            className="font-pixel select-none text-base leading-tight text-foreground/85"
          >
            {markGlyph ?? DEFAULT_MARK}
          </pre>
          {status ? (
            <div className="flex items-center justify-center gap-3">
              <SystemBadge kind="now" />
              {status.href ? (
                <Link
                  href={status.href}
                  aria-label={
                    status.accessibleLabel ?? `Open ${status.label}`
                  }
                  className="font-mono text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground"
                >
                  {status.label}
                </Link>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">
                  {status.label}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </PixelPanel>
    </BlurFade>
  );
}
