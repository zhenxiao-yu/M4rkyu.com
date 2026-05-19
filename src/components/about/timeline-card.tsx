import { History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Education + co-op timeline. Compact rail with a dashed "Now" marker
// that doesn't claim a fancy title — keeps the agent-voice honest.
export async function TimelineCard({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.timeline" });

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        {profile.timeline.map((item) => (
          <div key={item.label} className="relative border-l-2 pl-5">
            <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-border bg-background" />
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {item.date}
            </p>
            <h3 className="mt-1 text-sm font-semibold">{item.label}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.detail}
            </p>
          </div>
        ))}
        <div className="relative border-l-2 border-dashed pl-5">
          <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-dashed border-border bg-background" />
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("nowLabel")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("nowDetail")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
