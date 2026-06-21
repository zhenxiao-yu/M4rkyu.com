import Image from "next/image";
import { Camera } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cn, PANEL_WELL } from "@/lib/utils";

/**
 * Portrait bento cell. Renders `profile.portrait` if set, otherwise a
 * styled placeholder slot so the layout stays intact before the image
 * is supplied. Square aspect so the card sits cleanly next to other
 * 1-col cards at lg.
 */
export async function PortraitCard({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.portrait" });
  const portrait = profile.portrait;

  const focalClass =
    portrait?.focal === "top"
      ? "object-top"
      : portrait?.focal === "bottom"
        ? "object-bottom"
        : "object-center";

  return (
    <Card className={cn("h-full overflow-hidden bg-card/80", className)}>
      <CardHeader className="space-y-1 p-4">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Camera className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={cn(PANEL_WELL, "relative aspect-square overflow-hidden")}>
          {portrait ? (
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={cn("object-cover", focalClass)}
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-cyber-grid opacity-60"
            >
              <p className="rounded-md border border-dashed border-border bg-card/70 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
                {t("placeholder")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
