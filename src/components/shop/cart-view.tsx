"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Loader2,
  Lock,
  Minus,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/shop/cart";
import { resolveCart } from "@/lib/shop/cart-shared";
import type { Product } from "@/content/shop";
import { formatPrice } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

interface CartViewProps {
  locale: Locale;
  // Resolved catalog passed from the server page so the cart works
  // whether products come from the DB or the static fallback. The cart
  // itself only stores { slug, quantity }; prices are always resolved
  // against this catalog (and re-validated server-side at checkout).
  products: Product[];
}

export function CartView({ locale, products }: CartViewProps) {
  const t = useTranslations("Shop");
  const { cart, setQuantity, remove, applyPromo, clearPromo } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [promoPending, setPromoPending] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const resolved = resolveCart(cart.items, products, cart.promo);

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

  async function applyCoupon() {
    const value = code.trim();
    if (!value) return;
    setPromoError(null);
    setPromoPending(true);
    try {
      const response = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      if (response.status === 503) {
        setPromoError(t("promoUnavailable"));
        return;
      }
      const data = (await response.json()) as {
        valid?: boolean;
        code?: string;
        percentOff?: number | null;
        amountOff?: number | null;
      };
      if (response.ok && data.valid && data.code) {
        applyPromo({
          code: data.code,
          percentOff: data.percentOff ?? null,
          amountOff: data.amountOff ?? null,
        });
        setCode("");
      } else {
        setPromoError(t("promoInvalid"));
      }
    } catch {
      setPromoError(t("promoInvalid"));
    } finally {
      setPromoPending(false);
    }
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
      setError(response.status === 503 ? t("notConfigured") : t("checkoutError"));
    } catch {
      setError(t("checkoutError"));
    }
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <ul className="grid gap-4">
        {resolved.lines.map((line) => (
          <li key={line.product.slug}>
            <Card className="bg-card/80">
              <CardContent className="flex gap-4 p-4">
                <Link
                  href={`/shop/${line.product.slug}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted"
                  aria-label={line.product.title}
                >
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
                </Link>

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
                      {formatPrice(
                        line.lineTotalInCents,
                        locale,
                        line.product.currency,
                      )}
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
                        onClick={() =>
                          setQuantity(line.product.slug, line.quantity - 1)
                        }
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
                        onClick={() =>
                          setQuantity(line.product.slug, line.quantity + 1)
                        }
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
          {/* Promo code */}
          <div className="grid gap-2">
            {cart.promo ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <Tag className="size-3.5" aria-hidden="true" />
                  {t("promoApplied", { code: cart.promo.code })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearPromo();
                    setPromoError(null);
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t("promoRemove")}
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void applyCoupon();
                      }
                    }}
                    placeholder={t("promoPlaceholder")}
                    aria-label={t("promoLabel")}
                    autoComplete="off"
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void applyCoupon()}
                    disabled={promoPending || code.trim().length === 0}
                  >
                    {promoPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      t("promoApply")
                    )}
                  </Button>
                </div>
                {promoError ? (
                  <p className="text-xs text-muted-foreground">{promoError}</p>
                ) : null}
              </>
            )}
          </div>

          <div className="grid gap-1.5 border-t border-border/60 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-mono tabular-nums text-foreground">
                {formatPrice(resolved.subtotalInCents, locale, "usd")}
              </span>
            </div>
            {resolved.discountInCents > 0 ? (
              <div className="flex items-center justify-between text-success">
                <span>{t("discount")}</span>
                <span className="font-mono tabular-nums">
                  −{formatPrice(resolved.discountInCents, locale, "usd")}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between pt-1">
              <span className="font-medium text-foreground">{t("total")}</span>
              <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {formatPrice(resolved.estimatedTotalInCents, locale, "usd")}
              </span>
            </div>
          </div>

          <p className="text-[0.7rem] leading-5 text-muted-foreground">
            {resolved.discountInCents > 0
              ? t("estimatedNote")
              : t("shippingNote")}
          </p>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-5 text-warning"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button
            type="button"
            onClick={handleCheckout}
            disabled={pending}
            className={cn(pending && "opacity-90")}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("checkingOut")}
              </>
            ) : (
              t("checkout")
            )}
          </Button>

          <p className="inline-flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            {t("secure")}
          </p>

          <Button asChild variant="outline">
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
