"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredJson,
} from "@/lib/browser/safe-storage";
import { cartSchema, EMPTY_CART, type Cart } from "./cart-shared";

const KEY = "m4rkyu.cart";
const EVENT = "m4rkyu:cart:change";

// useSyncExternalStore requires a referentially-stable snapshot, so we
// memoize the parsed cart and only return a new object when the stored
// string actually changes. SSR + first client paint return EMPTY_CART
// (no localStorage on the server), then the real cart lands on the
// post-hydration render — no hydration mismatch.
let cache: { raw: string; value: Cart } = { raw: "", value: EMPTY_CART };

function getSnapshot(): Cart {
  const raw = readStoredString(KEY, "");
  if (raw === cache.raw) return cache.value;
  let value: Cart = EMPTY_CART;
  if (raw) {
    try {
      const parsed = cartSchema.safeParse(JSON.parse(raw));
      if (parsed.success) value = parsed.data;
    } catch {
      value = EMPTY_CART;
    }
  }
  cache = { raw, value };
  return value;
}

function getServerSnapshot(): Cart {
  return EMPTY_CART;
}

function write(cart: Cart): void {
  writeStoredJson(KEY, cart);
  dispatchStoredValueChanged(EVENT);
}

export function useCart() {
  const cart = useSyncExternalStore(
    (callback) => subscribeStoredValue(KEY, EVENT, callback),
    getSnapshot,
    getServerSnapshot,
  );

  const add = useCallback((slug: string, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.items.find((item) => item.slug === slug);
    const items = existing
      ? current.items.map((item) =>
          item.slug === slug
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        )
      : [...current.items, { slug, quantity: Math.min(99, quantity) }];
    write({ items });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const current = getSnapshot();
    const items =
      quantity <= 0
        ? current.items.filter((item) => item.slug !== slug)
        : current.items.map((item) =>
            item.slug === slug
              ? { ...item, quantity: Math.min(99, quantity) }
              : item,
          );
    write({ items });
  }, []);

  const remove = useCallback((slug: string) => {
    const current = getSnapshot();
    write({ items: current.items.filter((item) => item.slug !== slug) });
  }, []);

  const clear = useCallback(() => write(EMPTY_CART), []);

  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, add, setQuantity, remove, clear, count };
}
