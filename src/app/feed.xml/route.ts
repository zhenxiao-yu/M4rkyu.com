import { getFeedItems } from "@/lib/feed/items";
import { SITE_URL } from "@/lib/seo/site";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Strict RFC-822 date: toUTCString() emits a "GMT" zone token, which some
// feed validators reject. Swap it for the numeric "+0000" offset.
function pubDate(value: string | undefined): string {
  const date = value ? new Date(value) : new Date();
  const valid = Number.isNaN(date.getTime()) ? new Date() : date;
  return valid.toUTCString().replace(/GMT$/, "+0000");
}

export async function GET() {
  const items = await getFeedItems();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>M4rkyu.com</title>
    <link>${SITE_URL}</link>
    <description>Notes and logs from M4rkyu.com.</description>
    <language>en</language>
    <lastBuildDate>${pubDate(undefined)}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${pubDate(item.date)}</pubDate>
      <description>${escapeXml(item.summary)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
