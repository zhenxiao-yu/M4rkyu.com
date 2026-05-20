"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/shop/cart";

export function CartButton() {
  const t = useTranslations("Shop");
  const { count } = useCart();

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/shop/cart">
        <ShoppingBag className="size-4" aria-hidden="true" />
        {t("viewCart")}
        {count > 0 ? (
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[0.65rem] font-medium text-primary-foreground tabular-nums">
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
