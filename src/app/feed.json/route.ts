import { getFeedItems } from "@/lib/feed/items";
import { SITE_URL } from "@/lib/seo/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const items = await getFeedItems();

  return Response.json(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: "M4rkyu.com",
      home_page_url: SITE_URL,
      feed_url: `${SITE_URL}/feed.json`,
      description: "Notes and logs from M4rkyu.com.",
      language: "en",
      items: items.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        // JSON Feed 1.1 requires content_text or content_html per item.
        content_text: item.summary,
        summary: item.summary,
        ...(item.date ? { date_published: item.date } : {}),
        tags: item.tags,
      })),
    },
    {
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
      },
    },
  );
}
