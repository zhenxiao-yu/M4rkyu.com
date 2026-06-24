"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { GalleryItem } from "@/content/schemas";

// The showpiece's drag / inertia / 3D logic ships as its own chunk, fetched
// only on enabled clients (never on touch / reduced-motion / SSR) — same
// discipline as the page's already-lazy GalleryLightbox + the hero R3F scene.
const GalleryShowpiece = dynamic(
  () =>
    import("./gallery-showpiece").then((m) => ({ default: m.GalleryShowpiece })),
  { ssr: false },
);

/**
 * Contains any CSS-3D / runtime glitch to the decorative band — on failure it
 * renders nothing, so the masonry below stays the experience and the route
 * never falls through to its error screen.
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Gate + lazy-loader for the gallery showpiece. Renders NOTHING unless the
 * client is desktop (fine pointer), motion-OK, and the set has frames — so
 * reduced-motion users and ALL touch users get the existing masonry + lightbox
 * verbatim (the masonry, rendered below this on the page, is the fallback by
 * construction). When enabled, an IntersectionObserver defers the import until
 * the band nears the viewport.
 */
export function GalleryShowpieceMount({ items }: { items: GalleryItem[] }) {
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)", false);
  const enable = !reduced && finePointer && items.length > 0;

  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!enable) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enable]);

  if (!enable) return null;

  return (
    <div ref={ref}>
      {near ? (
        <SceneErrorBoundary>
          <GalleryShowpiece items={items} />
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
}
