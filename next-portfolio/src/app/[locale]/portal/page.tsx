import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import type { Locale } from "@/i18n/routing";

export default async function PortalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portal" });

  return (
    <PageShell locale={locale}>
      <section className="relative min-h-[70dvh] overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-40" aria-hidden="true" />
        <div className="noise-layer absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[70dvh] w-full max-w-5xl flex-col justify-center px-4 py-16 font-mono sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            /portal/init
          </p>
          <h1 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            {t("intro")}
          </p>
          <div className="mt-10 rounded-lg border bg-background/70 p-5 text-sm leading-7">
            <p>&gt; boot sequence: deferred</p>
            <p>&gt; webgl: disabled by default</p>
            <p>&gt; motion: reduced-motion aware</p>
            <p>&gt; status: awaiting case-study core</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
