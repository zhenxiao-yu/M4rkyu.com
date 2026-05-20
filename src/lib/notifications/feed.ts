import type { Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/blog/get-posts";
import { featuredProjects } from "@/content/projects";
import { resources } from "@/content/resources";

export type NotificationKind = "log" | "work" | "resource" | "system";

export interface SiteNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  occurredAt: string;
  label: string;
}

export async function getNotificationFeed(
  locale: Locale,
): Promise<SiteNotification[]> {
  const posts = await getPosts();
  const logItems = posts.slice(0, 5).map((post): SiteNotification => ({
    id: `log:${post.slug}`,
    kind: "log",
    title: post.title,
    body: post.excerpt,
    href: `/logs/${post.slug}`,
    occurredAt: post.publishedAt ?? post.date,
    label: post.category,
  }));

  const workItems = featuredProjects
    .filter((project) => project.status === "ready")
    .slice(0, 3)
    .map((project): SiteNotification => ({
      id: `work:${project.slug}`,
      kind: "work",
      title: project.title,
      body: project.shortPitch,
      href: `/work/${project.slug}`,
      occurredAt: yearToIso(project.year),
      label: label(locale, "work"),
    }));

  const resourceItems = resources
    .filter((resource) => resource.featured && resource.status === "ready")
    .slice(0, 3)
    .map((resource): SiteNotification => ({
      id: `resource:${resource.slug}`,
      kind: "resource",
      title: resource.name,
      body: resource.description,
      href: `/resources/${resource.slug}`,
      occurredAt: "2026-01-01T00:00:00.000Z",
      label: label(locale, "tool"),
    }));

  return [...logItems, ...workItems, ...resourceItems]
    .filter((item) => Number.isFinite(Date.parse(item.occurredAt)))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 10);
}

function yearToIso(year: string) {
  return /^\d{4}$/.test(year) ? `${year}-01-01T00:00:00.000Z` : "2024-01-01T00:00:00.000Z";
}

function label(locale: Locale, key: "work" | "tool") {
  if (locale === "zh") {
    return key === "work" ? "作品" : "工具";
  }
  return key === "work" ? "Work" : "Tool";
}
