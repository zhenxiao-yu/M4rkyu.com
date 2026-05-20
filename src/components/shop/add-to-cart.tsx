"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/shop/cart";

interface AddToCartProps {
  slug: string;
  inStock: boolean;
  /** Render a quantity stepper alongside the button (product page). */
  withQuantity?: boolean;
}

export function AddToCart({ slug, inStock, withQuantity = false }: AddToCartProps) {
  const t = useTranslations("Shop");
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!inStock) {
    return (
      <Button type="button" variant="secondary" disabled className="w-full sm:w-auto">
        {t("soldOut")}
      </Button>
    );
  }

  function handleAdd() {
    add(slug, quantity);
    toast.success(t("added"));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {withQuantity ? (
        <div
          className="flex h-10 items-center gap-1 rounded-md border border-border px-1"
          role="group"
          aria-label={t("quantity")}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("decrease")}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("increase")}
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={quantity >= 99}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      ) : null}
      <Button type="button" onClick={handleAdd} className="w-full sm:w-auto">
        <ShoppingCart className="size-4" />
        {t("addToCart")}
      </Button>
    </div>
  );
}
