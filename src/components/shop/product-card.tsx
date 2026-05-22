import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/shop/format";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Product } from "@/content/shop";

interface ProductCardProps {
  product: Product;
  locale: Locale;
}

export async function ProductCard({ product, locale }: ProductCardProps) {
  const t = await getTranslations({ locale, namespace: "Shop" });

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn("group block h-full rounded-lg", FOCUS_RING)}
      aria-label={product.title}
    >
      <Card
        glass
        className="glass-interactive relative h-full overflow-hidden"
      >
        <div className="relative aspect-16/10 overflow-hidden border-b bg-muted">
          {product.image ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale transition duration-300 group-hover:grayscale-0 motion-safe:group-hover:scale-[1.03]"
            />
          ) : (
            <PlaceholderImage
              label={product.category}
              aspect="h-full"
              className="rounded-none border-0"
            />
          )}
        </div>

        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{product.category}</Badge>
            <Badge variant={product.kind === "digital" ? "signal" : "default"}>
              {product.kind === "digital" ? t("digital") : t("physical")}
            </Badge>
            {!product.inStock ? (
              <Badge variant="warning">{t("soldOut")}</Badge>
            ) : null}
          </div>
          <CardTitle className="mt-1 text-base leading-snug">
            {product.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex items-end justify-between gap-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-6 text-muted-foreground">
            {product.summary}
          </p>
          <span className="shrink-0 font-mono text-sm font-medium text-foreground">
            {formatPrice(product.priceInCents, locale, product.currency)}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
