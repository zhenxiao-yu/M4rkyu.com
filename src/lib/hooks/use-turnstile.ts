"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Reusable Cloudflare Turnstile widget integration.
 *
 * What it owns:
 *   - the container ref the consumer attaches to a `<div>`,
 *   - one-shot widget creation against `window.turnstile.render`,
 *   - polling for the script to land (afterInteractive scripts mount
 *     async, so the widget render call may race),
 *   - cleanup on unmount,
 *   - a stable `reset` callback so callers can re-arm after a server
 *     rejection (token expired, replay caught, etc.).
 *
 * What it doesn't own:
 *   - the `<Script>` tag that loads turnstile/v0/api.js — the form
 *     decides whether to render it, since the same script can serve
 *     multiple widgets on one page,
 *   - storing the token — caller supplies an `onToken` callback that
 *     wires the value into form state (react-hook-form, useState,
 *     whatever).
 *
 * Returns `null` widget infrastructure when `siteKey` is undefined so
 * local dev without Cloudflare keys is a clean no-op rather than an
 * error toast at render.
 */
export function useTurnstile({
  siteKey,
  onToken,
}: {
  siteKey: string | undefined;
  onToken: (token: string) => void;
}): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
  enabled: boolean;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest onToken stable across re-renders without forcing
  // the consumer to memoise — the effect below reads through the ref.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!siteKey) return;

    function tryRender() {
      const win = window as unknown as { turnstile?: TurnstileApi };
      if (!win.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = win.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        callback: (token) => onTokenRef.current(token),
        "error-callback": () => onTokenRef.current(""),
        "expired-callback": () => onTokenRef.current(""),
        theme: "auto",
        appearance: "interaction-only",
      });
    }

    tryRender();
    // afterInteractive scripts land async; poll briefly then give up.
    const pollId = window.setInterval(tryRender, 200);
    const stopId = window.setTimeout(() => window.clearInterval(pollId), 4000);
    return () => {
      window.clearInterval(pollId);
      window.clearTimeout(stopId);
    };
  }, [siteKey]);

  const reset = useCallback(() => {
    if (!siteKey || !widgetIdRef.current) return;
    const win = window as unknown as { turnstile?: TurnstileApi };
    win.turnstile?.reset(widgetIdRef.current);
    onTokenRef.current("");
  }, [siteKey]);

  return { containerRef, reset, enabled: Boolean(siteKey) };
}

/** Minimal surface of Cloudflare Turnstile's global we actually use. */
interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
    },
  ) => string;
  reset: (widgetId?: string) => void;
}
