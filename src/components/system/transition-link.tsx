"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { Link as NextIntlLink, useRouter } from "@/i18n/navigation.internal";

import type { Locale } from "@/i18n/routing";

/**
 * View Transitions wrapper around `next-intl`'s Link. When the browser
 * supports `document.startViewTransition`, plain left-clicks are
 * intercepted and routed through the API so the route change captures
 * before/after snapshots and runs the keyframes registered in
 * `globals.css`. Otherwise the native Link handles navigation as
 * before — no behavior change, no JS overhead.
 *
 * Why a wrapper and not patching every call site:
 *   Re-exported from `@/i18n/navigation` so existing imports automatically
 *   pick up the upgrade. Locale-aware navigation, replace/scroll/prefetch
 *   props, and a11y semantics all flow through to next-intl's Link
 *   unchanged.
 *
 * What we do not intercept:
 *   - Middle-click, ctrl/cmd-click, shift-click → preserved for
 *     "open in new tab" / "open in new window" expectations.
 *   - External links (different origin) → next-intl's Link doesn't
 *     handle those anyway.
 *   - `prefers-reduced-motion: reduce` users → still navigate via
 *     startViewTransition, but the keyframes in globals.css collapse
 *     to an instant cross-fade for that media query.
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

let routeTransitionInFlight = false;

function releaseRouteTransition() {
  window.setTimeout(() => {
    routeTransitionInFlight = false;
  }, 0);
}

function hasViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition === "function"
  );
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
      if (!hasViewTransition()) return;
      const target = (rest.target as string | undefined) ?? "_self";
      if (target !== "_self") return;
      // Only string hrefs (~99 % of call sites). Object hrefs fall
      // through to the native Link path so the navigation still
      // works — we just skip the view-transition wrap.
      if (typeof href !== "string") return;

      event.preventDefault();
      if (routeTransitionInFlight) return;

      routeTransitionInFlight = true;
      const transition = (
        document as Document & {
          startViewTransition: (cb: () => void) => {
            finished?: Promise<unknown>;
          };
        }
      ).startViewTransition(() => {
        // next-intl's router handles the locale prefix; the second
        // arg lets us cross-locale-navigate when `locale` differs
        // from the active one.
        if (locale) {
          router.push(href, { locale });
        } else {
          router.push(href);
        }
      });
      if (transition.finished) {
        transition.finished.finally(releaseRouteTransition);
      } else {
        window.setTimeout(() => {
          routeTransitionInFlight = false;
        }, 500);
      }
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
