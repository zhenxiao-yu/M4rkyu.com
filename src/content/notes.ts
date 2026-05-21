import { noteSchema } from "./schemas";

// Static seed for the /notes microblog — a persona feed of short posts.
// DB-backed once the `notes` table has rows (see src/lib/notes/source.ts);
// until then these render as the zero-downtime fallback. Author them in
// the site voice: real, dated, first-person — no fake metrics or clients.
// Edit or retire any of these from /admin/notes once the table is live.

export const notes = [
  {
    slug: "shop-is-live",
    kind: "update",
    title: "",
    body: "Storefront is live. Stripe checkout end-to-end — catalog, cart, coupons, saved address, orders. The whole thing is DB-backed now, so I can add a print without a deploy.",
    status: "ready",
    tags: ["build", "shipping"],
    publishedAt: "2026-05-19",
  },
  {
    slug: "erase-non-data-ink",
    kind: "note",
    title: "Erase the non-data ink",
    body: "Tufte again: most of my chart borders are non-data ink. Spent an hour deleting gridlines and the charts read *better*, not worse.\n\n> Above all else, show the data.\n\nThe corollary for UI: every border you don't draw is a decision you don't have to defend.",
    status: "ready",
    tags: ["design", "reading"],
    publishedAt: "2026-05-12",
  },
  {
    slug: "blade-runner-2049",
    kind: "review",
    title: "Blade Runner 2049",
    body: "Watched it again on a good projector. Villeneuve lets scenes *breathe* — the silence does as much as the synths. Holds up as one of the few sequels that earns its runtime.",
    status: "ready",
    tags: ["film"],
    publishedAt: "2026-05-05",
    rating: 5,
  },
  {
    slug: "type-i-reach-for",
    kind: "tierlist",
    title: "Type I keep reaching for",
    body: "Purely by how often these end up in a project, not by objective merit. Ask me again next month.",
    status: "ready",
    tags: ["type", "design"],
    publishedAt: "2026-04-28",
    tiers: [
      { label: "S", items: ["Inter", "Berkeley Mono"] },
      { label: "A", items: ["IBM Plex Sans", "VT323"] },
      { label: "B", items: ["Geist", "Space Grotesk"] },
    ],
  },
].map((note) => noteSchema.parse(note));
