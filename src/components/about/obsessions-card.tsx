import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const OBSESSION_KEYS = ["item1", "item2", "item3", "item4", "item5", "item6"] as const;

// "Currently into" — short one-liners pulled from i18n. Designed for
// 4-6 items; missing keys are filtered out so reducing count needs no
// component change.
export async function ObsessionsCard({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.obsessions" });
  const items = OBSESSION_KEYS.map((key) => {
    const value = t(key);
    return value && value !== key ? value : null;
  }).filter((v): v is string => Boolean(v));

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-2 text-sm leading-6 text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="text-[0.6rem] text-ring/70"
              >
                ~
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
