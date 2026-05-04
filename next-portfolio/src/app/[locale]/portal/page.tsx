import { getTranslations } from "next-intl/server";
import { LockKeyhole, Terminal } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const bootLines = [
  "> boot sequence: deferred",
  "> webgl: disabled by default",
  "> motion: reduced-motion aware",
  "> assets: placeholder frames active",
  "> status: CONTENT PENDING",
];

export default async function PortalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portal" });

  return (
    <PageShell locale={locale}>
      <section className="relative min-h-[78dvh] overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
        <div className="noise-layer absolute inset-0" aria-hidden="true" />
        <div className="scanline-layer absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[78dvh] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
              /portal/init
            </p>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none text-balance">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              {t("intro")} Draft placeholder mode keeps the main site fast until the immersive
              route has a real interaction model.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects" locale={locale}>
                  Return to archive
                </Link>
              </Button>
              <Button variant="outline" disabled>
                Kernel mode TBD
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden bg-background/80 font-mono backdrop-blur">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md border bg-card">
                    <Terminal className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>locked-terminal</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">Prototype shell</p>
                  </div>
                </div>
                <ContentPendingLabel label="LOCKED" />
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
                {bootLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["case-studies", "gallery", "media"].map((item) => (
                  <div key={item} className="rounded-md border bg-card/70 p-3">
                    <Badge variant="warning">TBD</Badge>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-md border bg-card/70 p-4">
                <LockKeyhole className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Coming soon: opt-in interactive mode. No heavy WebGL ships here in phase II.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
