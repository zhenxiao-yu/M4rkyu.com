import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";

interface LinksRailProps {
  locale: Locale;
  links: Resource[];
}

// External resources strip. Quieter visual weight than the tool tiles
// — these are reference material, not interactive surfaces.
export async function LinksRail({ locale, links }: LinksRailProps) {
  const t = await getTranslations({ locale, namespace: "Resources" });
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="links-rail-heading" className="grid gap-4">
      <header className="grid gap-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("linksRailEyebrow")}
        </p>
        <h2 id="links-rail-heading" className="text-lg font-semibold">
          {t("linksRailTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("linksRailLede")}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((resource) => (
          <Card key={resource.slug} className="flex h-full flex-col bg-card/60">
            <CardHeader>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="font-mono text-[0.55rem]">
                  {resource.category}
                </Badge>
                <Badge variant="outline" className="font-mono text-[0.55rem]">
                  {resource.pricing}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base">{resource.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p className="line-clamp-3">{resource.description}</p>
              <div className="mt-auto">
                <Button asChild variant="outline" size="sm">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    {t("visit")}
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
