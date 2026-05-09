"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { galleryItems } from "@/content/gallery";
import { Link } from "@/i18n/navigation";
import { useSavedSlugs } from "@/lib/social/hooks";
import { clearAll } from "@/lib/social/saves";
import type { Locale } from "@/i18n/routing";
import type { GalleryItem } from "@/content/schemas";

export default function SavedGalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const savedSlugs = useSavedSlugs();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const t = useTranslations("Gallery");

  const savedItems = galleryItems.filter((item) => savedSlugs.includes(item.slug));

  function handleClearAll() {
    clearAll();
    setShowClearConfirm(false);
  }

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow={t("savedEyebrow")}
              title={t("saved")}
              description={t("savedDescription")}
            />
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {savedItems.length === 0 ? (
          <FadeIn>
            <Card className="bg-card/80">
              <CardContent className="py-12 text-center">
                <p className="text-base text-muted-foreground">{t("savedEmpty")}</p>
                <Button asChild className="mt-4">
                  <Link href="/gallery" locale={locale}>
                    {t("savedOpenGallery")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <>
            <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-3" delay={0.08}>
              {savedItems.map((item) => (
                <StaggerItem key={item.slug}>
                  <Link
                    href={`/gallery?frame=${item.slug}`}
                    locale={locale}
                    aria-label={t("openFrame", { title: item.title })}
                    className="group block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-full overflow-hidden bg-card/80 transition-[border-color,box-shadow] duration-200 group-hover:border-ring group-hover:shadow-md">
                      <FrameThumb item={item} frameTbdLabel={t("frameTbd")} />
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-base leading-tight">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn delay={0.3}>
              <div className="mt-12 border-t pt-6">
                {!showClearConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(true)}
                    aria-label={t("savedClearAll")}
                  >
                    {t("savedClearAll")}
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t("savedClearConfirm")}
                    </span>
                    <Button size="sm" onClick={handleClearAll}>
                      {t("savedConfirm")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowClearConfirm(false)}
                    >
                      {t("savedCancel")}
                    </Button>
                  </div>
                )}
              </div>
            </FadeIn>
          </>
        )}
      </section>
    </PageShell>
  );
}

function FrameThumb({
  item,
  frameTbdLabel,
}: {
  item: GalleryItem;
  frameTbdLabel: string;
}) {
  if (item.src) {
    return (
      <div className="relative aspect-4/5 overflow-hidden border-b bg-muted">
        <Image
          src={item.src.src}
          alt={item.src.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
        />
      </div>
    );
  }
  return (
    <PlaceholderImage
      label={frameTbdLabel}
      aspect="aspect-4/5"
      className="rounded-none border-0 border-b"
    />
  );
}
