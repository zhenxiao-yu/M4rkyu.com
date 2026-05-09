import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type PulseKind = "now" | "shipping" | "writing";

export interface StatusPulseEntry {
  kind: PulseKind;
  label: string;
  detail: string;
  href?: string;
}

interface StatusPulseRowProps {
  current: StatusPulseEntry[];
  className?: string;
}

export async function StatusPulseRow({ current, className }: StatusPulseRowProps) {
  const t = await getTranslations("Pulse");

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      {current.map((entry, index) => (
        <article
          key={`${entry.kind}-${index}`}
          className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50"
        >
          <header className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-signal" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t(entry.kind)}
            </span>
          </header>
          <h3 className="text-base font-semibold leading-snug">{entry.label}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{entry.detail}</p>
          {entry.href ? (
            <div className="mt-auto pt-2">
              <Link
                href={entry.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("open")}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-(--motion-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
