import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import {
  getProjectFromSource,
  getProjectsSource,
} from "@/lib/projects/source";
import { routing } from "@/i18n/routing";

export const alt = "Case study — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Pre-declare one OG per (locale, slug) so Next can statically
// generate at build time. CJK glyphs are supported via the bundled
// Noto Sans SC subset in `renderOgImage`.
export async function generateImageMetadata() {
  const allProjects = await getProjectsSource();
  return allProjects.flatMap((project) =>
    routing.locales.map((locale) => ({
      id: `${locale}-${project.slug}`,
      alt: `${project.title} — case study`,
      contentType: OG_CONTENT_TYPE,
      size: OG_IMAGE_SIZE,
    })),
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectFromSource(slug);
  if (!project) notFound();
  return await renderOgImage({
    eyebrow: "PROJECT · CASE STUDY",
    title: project.title,
    subtitle: project.shortPitch,
    footer: `m4rkyu.com / projects / ${project.slug}`,
  });
}
