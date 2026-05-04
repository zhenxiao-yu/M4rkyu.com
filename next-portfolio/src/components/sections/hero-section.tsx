import { ArrowRight, Code, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
      <div className="noise-layer absolute inset-0" aria-hidden="true" />
      <div className="scanline-layer absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.86] tracking-normal">
            {t("title")}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/projects" locale={locale}>
                {t("primaryCta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/portal" locale={locale}>
                {t("portalCta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="https://github.com/zhenxiao-yu" target="_blank" rel="noopener noreferrer">
                <Code className="size-4" />
                GitHub
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <UserRound className="size-4" />
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden rounded-lg border bg-card/70 p-5 shadow-2xl">
          <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
          <div className="relative grid h-full min-h-[25rem] content-between">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>creative systems</span>
              <span>2027</span>
            </div>
            <div className="my-14 grid gap-3">
              {["software", "games", "art", "interfaces"].map((item, index) => (
                <div key={item} className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                  <div className="h-12 border bg-background/70 px-4 py-3 text-xl uppercase tracking-[0.18em]">
                    {item}
                  </div>
                </div>
              ))}
            </div>
            <p className="max-w-sm font-mono text-xs leading-6 text-muted-foreground">
              A restrained black-and-white system with rare signal color, built to make technical
              work feel archived, cinematic, and inspectable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
