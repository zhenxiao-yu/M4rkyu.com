import { allProjects } from "@/content/projects";
import { galleryItems } from "@/content/gallery";
import { games } from "@/content/games";
import { resources } from "@/content/resources";
import type { SavedItemType } from "@/lib/supabase/types";

export interface ContentSummary {
  title: string;
  /**
   * Destination for the saved-item card. Internal links are
   * locale-less paths (e.g. `/work/foo`) that the consumer feeds to
   * `<Link from @/i18n/navigation>`. External links are absolute
   * URLs and MUST be rendered with a plain `<a>` — next-intl's
   * `<Link>` will mangle absolute URLs.
   */
  href: string;
  /** `true` when `href` is an absolute external URL. */
  external?: boolean;
  /** Optional one-liner subtitle (category, year, etc). */
  subtitle?: string;
  /** Optional cover image URL — only when available without a build-time guarantee. */
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * Resolve a saved item (item_type + item_key) to a display-ready
 * summary by looking it up in the in-code content arrays. Returns
 * `null` when the content no longer exists — the caller renders a
 * tombstone (item is gone or was renamed).
 *
 * Log lookups are intentionally not resolved here. Logs come from
 * dev.to via an async fetch and don't fit a synchronous lookup;
 * call sites that need logs should pass an explicit slug→post map
 * pre-loaded by `getPosts()`.
 */
export function lookupContent(
  itemType: SavedItemType,
  itemKey: string,
): ContentSummary | null {
  switch (itemType) {
    case "project": {
      const item = allProjects.find((p) => p.slug === itemKey);
      if (!item) return null;
      return {
        title: item.title,
        href: `/work/${item.slug}`,
        subtitle: `${item.year} · ${item.category}`,
      };
    }
    case "gallery": {
      const item = galleryItems.find((p) => p.slug === itemKey);
      if (!item) return null;
      return {
        title: item.title,
        href: `/archive?frame=${item.slug}`,
        subtitle: item.collection,
        imageSrc: item.src?.src,
        imageAlt: item.src?.alt,
      };
    }
    case "game": {
      const item = games.find((p) => p.slug === itemKey);
      if (!item) return null;
      return {
        title: item.title,
        href: `/games/${item.slug}`,
        subtitle: `${item.year} · ${item.engine}`,
        imageSrc: item.cover?.src,
        imageAlt: item.cover?.alt,
      };
    }
    case "resource": {
      const item = resources.find((p) => p.slug === itemKey);
      if (!item) return null;
      return {
        title: item.name,
        href: item.link,
        external: true,
        subtitle: item.category,
      };
    }
    case "log":
    case "note":
    default:
      return null;
  }
}
