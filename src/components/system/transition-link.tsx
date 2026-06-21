"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { Link as NextIntlLink, useRouter } from "@/i18n/navigation.internal";
import { playInkWipe } from "@/lib/route-transition";

import type { Locale } from "@/i18n/routing";

/**
 * Ink-wipe wrapper around `next-intl`'s Link. Plain left-clicks are
 * intercepted and routed through `playInkWipe`, which covers the viewport
 * with the accent-ink curtain, performs the navigation behind the cover,
 * then reveals the new page. Re-exported as the public `Link` from
 * `@/i18n/navigation`, so every existing import picks up the transition
 * with no call-site change.
 *
 * What we do not intercept (native Link handles these unchanged):
 *   - Middle-click, ctrl/cmd/shift/alt-click → "open in new tab/window".
 *   - `target` other than `_self`.
 *   - Object hrefs (~1% of call sites) → fall through so navigation still
 *     works; we just skip the wipe wrap.
 *   - `prefers-reduced-motion: reduce` users → `playInkWipe` navigates
 *     instantly with no curtain (handled inside the store).
 */

type NextIntlLinkProps = React.ComponentProps<typeof NextIntlLink>;

interface TransitionLinkProps
  extends Omit<NextIntlLinkProps, "href">,
    Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof NextIntlLinkProps | "href"
    > {
  href: NextIntlLinkProps["href"];
  locale?: Locale;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, locale, onClick, ...rest }, ref) {
    const router = useRouter();

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      // Preserve standard browser shortcuts for new tab / new window.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = (rest.target as string | undefined) ?? "_self";
      if (target !== "_self") return;
      // Only string hrefs. Object hrefs fall through to the native Link
      // path so the navigation still works — we just skip the wipe.
      if (typeof href !== "string") return;

      event.preventDefault();
      // The curtain owns the transition; the route swap runs behind the
      // cover. next-intl's router handles the locale prefix, and the second
      // arg lets us cross-locale-navigate when `locale` differs.
      playInkWipe(() => {
        if (locale) {
          router.push(href, { locale });
        } else {
          router.push(href);
        }
      });
    }

    return (
      <NextIntlLink
        ref={ref}
        href={href}
        locale={locale}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
