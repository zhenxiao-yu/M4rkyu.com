"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/shop/cart";
import { resolveCart } from "@/lib/shop/cart-shared";
import { getShopProducts } from "@/content/shop";
import { formatPrice } from "@/lib/shop/format";

interface CartViewProps {
  locale: Locale;
}

export function CartView({ locale }: CartViewProps) {
  const t = useTranslations("Shop");
  const { cart, setQuantity, remove } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolved = resolveCart(cart.items, getShopProducts());

  if (resolved.lines.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="grid place-items-center px-6 py-14 text-center">
          <h2 className="text-xl font-semibold">{t("cartEmptyTitle")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t("cartEmptyDescription")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleCheckout() {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, locale }),
      });
      if (response.ok) {
        const data = (await response.json()) as { url: string };
        window.location.href = data.url;
        return;
      }
      if (response.status === 503) {
        setError(t("notConfigured"));
      } else {
        setError(t("checkoutError"));
      }
    } catch {
      setError(t("checkoutError"));
    }
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <ul className="grid gap-4">
        {resolved.lines.map((line) => (
          <li key={line.product.slug}>
            <Card className="bg-card/80">
              <CardContent className="flex gap-4 p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {line.product.image ? (
                    <Image
                      src={line.product.image.src}
                      alt={line.product.image.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <PlaceholderImage
                      label={line.product.category}
                      aspect="h-full"
                      className="rounded-none border-0"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${line.product.slug}`}
                        className="block truncate text-sm font-medium text-foreground hover:underline"
                      >
                        {line.product.title}
                      </Link>
                      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        {line.product.category}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm text-foreground">
                      {formatPrice(line.lineTotalInCents, locale, line.product.currency)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div
                      className="flex h-8 items-center gap-1 rounded-md border border-border px-1"
                      role="group"
                      aria-label={t("quantity")}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        aria-label={t("decrease")}
                        onClick={() => setQuantity(line.product.slug, line.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-7 text-center font-mono text-xs tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        aria-label={t("increase")}
                        onClick={() => setQuantity(line.product.slug, line.quantity + 1)}
                        disabled={line.quantity >= 99}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => remove(line.product.slug)}
                    >
                      <Trash2 className="size-3.5" />
                      {t("remove")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="bg-card/80 lg:sticky lg:top-24">
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("subtotal")}</span>
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatPrice(resolved.subtotalInCents, locale, "usd")}
            </span>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">{t("shippingNote")}</p>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-5 text-warning"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="button" onClick={handleCheckout} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("checkingOut")}
              </>
            ) : (
              t("checkout")
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
