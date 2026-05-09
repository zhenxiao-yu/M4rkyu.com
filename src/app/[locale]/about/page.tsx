import { getTranslations } from "next-intl/server"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/sections/section-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlaceholderImage } from "@/components/placeholders/placeholder-image"
import { FadeIn } from "@/components/motion/fade-in"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { profile } from "@/content/profile"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "About" })

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <FadeIn>
            <SectionHeading as="h1" title={t("title")} description={t("intro")} />
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <PlaceholderImage label="PORTRAIT OR STUDIO IMAGE TBD" aspect="aspect-[4/5]" />
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Stagger className="grid gap-5 lg:grid-cols-[1fr_0.85fr]" delay={0.05}>
          <StaggerItem>
            <Card className="h-full bg-card/80">
              <CardHeader>
                <CardTitle>{profile.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-base leading-8 text-muted-foreground">
                <p>{profile.intro}</p>
                <p className="font-mono text-sm">{profile.location}</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="h-full bg-card/80">
              <CardHeader>
                <CardTitle>Values</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {profile.values.map((value, i) => (
                  <div
                    key={value}
                    className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded-md border bg-background/50 p-3"
                  >
                    <span className="font-mono text-[0.6rem] text-muted-foreground/60 pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-6">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>

        <FadeIn delay={0.15}>
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Current focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Available for frontend systems, full-stack prototypes, and creative or game
                  projects. Based in {profile.location}.
                </p>
                <p>
                  Currently building this portfolio platform as a structured archive of engineering,
                  game development, and digital art work.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/contact" locale={locale}>
                    Start a conversation
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                {profile.timeline.map((item) => (
                  <div key={item.label} className="relative border-l-2 pl-5">
                    <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-border bg-background" />
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.date}
                    </p>
                    <h3 className="mt-1 font-semibold">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
                <div className="relative border-l-2 border-dashed pl-5">
                  <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-border border-dashed bg-background" />
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Now
                  </p>
                  <h3 className="mt-1 font-semibold">Creative systems engineer</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Shipping software, game, and art work under one coherent archive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </section>
    </PageShell>
  )
}
