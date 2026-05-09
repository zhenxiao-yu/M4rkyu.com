import { getTranslations } from "next-intl/server";
import { Terminal } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Particles } from "@/components/ui/magic/particles";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const bootLines = [
  "> boot sequence: deferred",
  "> webgl: disabled by default",
  "> motion: reduced-motion aware",
  "> assets: placeholder frames active",
  "> status: standby",
];

export default async function PortalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portal" });
  const tNav = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <PageShell locale={locale}>
      <section className="relative min-h-[78dvh] overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
        <div className="noise-layer absolute inset-0" aria-hidden="true" />
        <div className="scanline-layer absolute inset-0 opacity-35" aria-hidden="true" />
        <Particles quantity={32} maxOpacity={0.5} speed={0.08} />
        <div className="relative mx-auto grid min-h-[78dvh] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
              /portal/init
            </p>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none text-balance">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              {t("intro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects" locale={locale}>
                  {tNav("projects")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/" locale={locale}>
                  {tNav("home")}
                </Link>
              </Button>
            </div>
          </div>
          <Card className="relative overflow-hidden bg-background/80 font-mono backdrop-blur">
            <ShineBorder borderRadius={12} duration={18} />
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md border bg-card">
                    <Terminal className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>{t("shellTitle")}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("shellSubtitle")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                >
                  {t("shellStatus")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
                {bootLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {(["caseStudies", "gallery", "media"] as const).map((key) => (
                  <div
                    key={key}
                    className="rounded-md border bg-card/70 p-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/40"
                  >
                    <Badge variant="outline" className="text-[0.6rem]">
                      {t("shellSlotStatus")}
                    </Badge>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em]">
                      {t(`shellSlot.${key}`)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-8 rounded-md border bg-card/70 p-4 text-xs leading-5 text-muted-foreground">
                {t("shellFootnote")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
