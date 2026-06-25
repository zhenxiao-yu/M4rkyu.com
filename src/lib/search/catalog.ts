import { cache } from "react";
import { getProjectsSource } from "@/lib/projects/source";
import { getGamesSource } from "@/lib/games/source";
import { getResourcesSource } from "@/lib/resources/source";
import { getGallerySource } from "@/lib/gallery/source";
import { getNotesSource } from "@/lib/notes/source";
import { getMediaSource } from "@/lib/media/source";
import { services } from "@/content/services";
import type {
  GalleryItem,
  Game,
  MediaItem,
  Note,
  Project,
  Resource,
  Service,
} from "@/content/schemas";

// The unit of AI search. A flat, locale-less view of one public content
// item — enough for the model to rank against (`title`/`description`/`tags`)
// and for the client to render a result card (`title`/`href`).
export interface SearchDoc {
  /** Stable unique id, e.g. "project:nimbus". The model ranks by id. */
  id: string;
  type:
    | "project"
    | "game"
    | "resource"
    | "gallery"
    | "note"
    | "media"
    | "service";
  title: string;
  /** Short text the model matches the query against. */
  description: string;
  /**
   * Locale-less internal path (fed to next-intl `<Link>`) OR an absolute
   * external URL when `external` is true (rendered with a plain `<a>`).
   */
  href: string;
  external?: boolean;
  /** Short human label for the result card (category, year, etc.). */
  subtitle?: string;
  tags?: string[];
}

// Keep the per-item description compact so the whole catalog stays well
// within a single prompt regardless of how long a note body grows.
function clip(value: string, max = 240): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

interface CatalogSources {
  projects: readonly Project[];
  games: readonly Game[];
  resources: readonly Resource[];
  gallery: readonly GalleryItem[];
  notes: readonly Note[];
  media: readonly MediaItem[];
  services: readonly Service[];
}

/**
 * Flatten the public content collections into a single ranked-search
 * catalog. Only `ready` items are included — drafts / placeholders /
 * coming-soon stay out of AI search exactly as they stay out of the
 * sitemap. Pure: takes its sources as input so it is deterministically
 * testable. `buildSearchCatalog()` wires in the real content arrays.
 */
export function assembleCatalog(sources: CatalogSources): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const p of sources.projects) {
    if (p.contentStatus !== "ready") continue;
    docs.push({
      id: `project:${p.slug}`,
      type: "project",
      title: p.title,
      description: clip(`${p.shortPitch} ${p.problem ?? ""}`),
      href: `/work/${p.slug}`,
      subtitle: `${p.year} · ${p.category}`,
      tags: [...p.stack, ...p.tags],
    });
  }

  for (const g of sources.games) {
    if (g.status !== "ready") continue;
    docs.push({
      id: `game:${g.slug}`,
      type: "game",
      title: g.title,
      description: clip(`${g.pitch} ${g.role}`),
      href: `/games/${g.slug}`,
      subtitle: `${g.year} · ${g.engine}`,
      tags: [...g.platforms, ...g.pillars],
    });
  }

  for (const r of sources.resources) {
    if (r.status !== "ready") continue;
    const isTool = r.type === "tool";
    docs.push({
      id: `resource:${r.slug}`,
      type: "resource",
      title: r.name,
      description: clip(`${r.description} ${r.why}`),
      href: isTool ? `/resources/${r.slug}` : r.link,
      external: !isTool,
      subtitle: r.category,
      tags: r.tags,
    });
  }

  for (const item of sources.gallery) {
    if (item.status !== "ready") continue;
    docs.push({
      id: `gallery:${item.slug}`,
      type: "gallery",
      title: item.title,
      description: clip(item.caption),
      href: `/archive?frame=${item.slug}`,
      subtitle: item.collection,
      tags: [...item.tags, ...item.mood],
    });
  }

  for (const n of sources.notes) {
    if (n.status !== "ready") continue;
    docs.push({
      id: `note:${n.slug}`,
      type: "note",
      title: n.title || `${n.kind} note`,
      description: clip(n.body || n.title),
      // /notes is a single feed page; anchor to the specific note.
      href: `/notes#${n.slug}`,
      subtitle: n.kind,
      tags: n.tags,
    });
  }

  for (const m of sources.media) {
    if (m.status !== "ready") continue;
    docs.push({
      id: `media:${m.slug}`,
      type: "media",
      title: m.title,
      description: clip(m.description),
      href: "/media",
      subtitle: m.format,
    });
  }

  for (const s of sources.services) {
    if (s.status !== "ready") continue;
    docs.push({
      id: `service:${s.slug}`,
      type: "service",
      title: s.title,
      description: clip(`${s.description} Good fit: ${s.fit.join(", ")}`),
      href: "/contact",
      subtitle: "service",
    });
  }

  return docs;
}

/**
 * Wire the live, DB-first content sources into {@link assembleCatalog}, so
 * CMS-authored items (gallery / notes / media uploaded via the admin) are
 * searchable — the static content arrays are the readers' own fallback when
 * the DB is empty (or Supabase env is absent at build/preview), so this never
 * regresses the static catalog. `cache()`'d for per-render dedupe; the source
 * readers are individually `cache()`'d too. Services have no DB source, so
 * they stay static.
 */
export const buildSearchCatalog = cache(async (): Promise<SearchDoc[]> => {
  const [projects, games, resources, gallery, notes, media] = await Promise.all(
    [
      getProjectsSource(),
      getGamesSource(),
      getResourcesSource(),
      getGallerySource(),
      getNotesSource(),
      getMediaSource(),
    ],
  );
  return assembleCatalog({
    projects,
    games,
    resources,
    gallery: gallery.items,
    notes,
    media,
    services,
  });
});
