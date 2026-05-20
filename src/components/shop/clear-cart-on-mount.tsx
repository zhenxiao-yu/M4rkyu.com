"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/shop/cart";

// Clears the cart exactly once after a successful checkout. The order is
// already persisted server-side by the Stripe webhook, so the client cart
// is now stale — wipe it on mount. Renders nothing.
export function ClearCartOnMount() {
  const { clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);

  return null;
}
