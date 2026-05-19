"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SignInSheet } from "@/components/auth/sign-in-sheet";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

interface SavedGalleryClientProps {
  locale: Locale;
  signedIn: boolean;
  items: GalleryItem[];
}

export function SavedGalleryClient({ locale, signedIn, items }: SavedGalleryClientProps) {
  const t = useTranslations("Gallery");
  const tAuth = useTranslations("Auth");

  if (!signedIn) {
    return (
      <FadeIn>
        <Card className="bg-card/80">
          <CardContent className="py-12 text-center">
            <p className="text-base text-muted-foreground">
              {t("savedSignInPrompt")}
            </p>
            <div className="mt-4 inline-flex items-center justify-center">
              <SignInSheet next={`/${locale}/archive/saved`} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {tAuth("guestBrowseHint")}
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (items.length === 0) {
    return (
      <FadeIn>
        <Card className="bg-card/80">
          <CardContent className="py-12 text-center">
            <p className="text-base text-muted-foreground">
              {t("savedEmpty")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/archive" locale={locale}>
                {t("savedOpenGallery")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-3" delay={0.08}>
      {items.map((item) => (
        <StaggerItem key={item.slug}>
          <Link
            href={`/archive?frame=${item.slug}`}
            locale={locale}
            aria-label={t("openFrame", { title: item.title })}
            className={cn(
              "group block h-full rounded-md",
              FOCUS_RING_INSET,
            )}
          >
            <Card className="h-full overflow-hidden bg-card/80 group-hover:border-ring group-hover:shadow-md">
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
          className="object-cover grayscale transition duration-300 group-hover:scale-[1.02] group-hover:grayscale-0"
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
