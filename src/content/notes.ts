import { noteSchema } from "./schemas";

// Seed for the /notes feed — a personal microblog. Casual, dated, first
// person: dev logs, links worth keeping, film/game notes, the odd tier
// list, frames from a roll of film. Point-form and short on purpose.
//
// House rule (CLAUDE.md): no fake metrics, clients, or awards. These are
// taste, tinkering, and opinion — the author's own persona — never
// fabricated credentials. Dev-log entries track real work in the repo.
// DB-backed once the `notes` table has rows; until then this renders as
// the fallback. Edit or retire any of these from /admin/notes.

export const notes = [
  {
    slug: "notes-feed-up",
    kind: "update",
    body: `set up this little notes feed today 🛠️

- dated, monthly, no algorithm
- dev logs / links / film + game notes / frames
- short stuff that doesn't deserve a whole post

basically my corner of the internet`,
    status: "ready",
    tags: ["site", "meta"],
    publishedAt: "2026-05-18",
  },
  {
    slug: "pacific-drive",
    kind: "review",
    title: "Pacific Drive",
    body: `finally got to the end of it 🚗

- the station wagon really does become a character
- the run loop gets a touch grindy in the back third

still — nothing else feels quite like it`,
    status: "ready",
    tags: ["games"],
    publishedAt: "2026-05-06",
    rating: 4,
  },
  {
    slug: "css-text-wrap-pretty",
    kind: "note",
    body: `TIL \`text-wrap: pretty\` is finally wide enough to just use ✨

headings stop orphaning a lonely last word on their own — no more manual \`<br>\` hacks. small thing, makes type feel intentional.`,
    status: "ready",
    tags: ["css", "til"],
    publishedAt: "2026-04-22",
  },
  {
    slug: "rauno-craft",
    kind: "repost",
    body: `rauno's site is a clinic in interaction detail 🔗

the kind of polish you only really notice when it's missing. been stealing ideas all week.`,
    status: "ready",
    tags: ["reading", "design"],
    publishedAt: "2026-04-08",
    link: { url: "https://rauno.me", label: "rauno.me" },
  },
  {
    slug: "storefront-shipped",
    kind: "update",
    body: `shipped the storefront 🛒

- stripe checkout, end to end
- coupons + a saved address
- order history that isn't painful

the cart math was the fiddly part, naturally`,
    status: "ready",
    tags: ["dev", "shop"],
    publishedAt: "2026-03-29",
  },
  {
    slug: "type-tier",
    kind: "tierlist",
    title: "type i keep reaching for",
    body: `ranked by how often it actually lands in a project, not by merit 🔤 ask me again next month`,
    status: "ready",
    tags: ["type", "design"],
    publishedAt: "2026-03-11",
    tiers: [
      { label: "S", items: ["Inter", "Berkeley Mono"] },
      { label: "A", items: ["IBM Plex", "Geist"] },
      { label: "B", items: ["Space Grotesk", "VT323"] },
    ],
  },
  {
    slug: "everything-db-backed",
    kind: "update",
    body: `everything on the site is db-backed now 🗄️

projects, games, media, shop — and these notes. means i can post without shipping a deploy. worth the yak-shave.`,
    status: "ready",
    tags: ["dev", "site"],
    publishedAt: "2026-02-17",
  },
  {
    slug: "hp5-grey-afternoon",
    kind: "note",
    body: `shot a roll of HP5 downtown 📷

grey afternoon, which is exactly what it's for. three or four keepers — they'll land in the archive once i scan them.`,
    status: "ready",
    tags: ["photo", "film"],
    publishedAt: "2026-01-28",
  },
  {
    slug: "rsc-mental-model",
    kind: "note",
    body: `the thing that finally made server components click for me 🧠

stop asking "server or client component?" — ask "where does this data live?" the boundary mostly draws itself after that.`,
    status: "ready",
    tags: ["react", "til"],
    publishedAt: "2026-01-09",
  },
  {
    slug: "perfect-days",
    kind: "review",
    title: "Perfect Days",
    body: `wim wenders — watched it twice in a week 🎬

- a whole film about noticing things
- "komorebi" has lived in my head since

left me wanting to live a little more deliberately. rare.`,
    status: "ready",
    tags: ["film"],
    publishedAt: "2025-12-19",
    rating: 5,
  },
  {
    slug: "ambient-audio",
    kind: "update",
    body: `added a quiet ambient audio layer to the site 🎧

off by default, obviously — nobody wants a website that makes noise at them. been tinkering with a tiny web-audio visualizer to go with it.`,
    status: "ready",
    tags: ["dev", "audio"],
    publishedAt: "2025-12-03",
  },
  {
    slug: "comeau-css",
    kind: "repost",
    body: `josh comeau's css writing is still the gold standard 🔗

send it to anyone who tells you css is easy. or that it's impossible. somehow both are true.`,
    status: "ready",
    tags: ["reading", "css"],
    publishedAt: "2025-11-12",
    link: { url: "https://www.joshwcomeau.com", label: "joshwcomeau.com" },
  },
  {
    slug: "portra-roll",
    kind: "note",
    body: `first roll of portra 400 in a while 📷

forgot how forgiving it is — golden hour basically does the work for you. hard to take a bad frame on it.`,
    status: "ready",
    tags: ["photo", "film"],
    publishedAt: "2025-10-15",
  },
  {
    slug: "motion-docs",
    kind: "repost",
    body: `the motion docs got a proper glow-up 🔗

half my "how do i animate this" googling now just ends here. nice when a tool's docs are this good.`,
    status: "ready",
    tags: ["reading", "motion"],
    publishedAt: "2025-09-24",
    link: { url: "https://motion.dev", label: "motion.dev" },
  },
  {
    slug: "snack-tier",
    kind: "tierlist",
    title: "desk snacks, ranked",
    body: `rigorous, peer-reviewed (by me) 🍫`,
    status: "ready",
    tags: ["misc"],
    publishedAt: "2025-09-05",
    tiers: [
      { label: "S", items: ["dark chocolate", "clementines"] },
      { label: "A", items: ["salted almonds", "oolong"] },
      { label: "F", items: ["anything that needs two hands"] },
    ],
  },
  {
    slug: "hello",
    kind: "update",
    body: `starting a notes feed 👋

short stuff that doesn't earn a whole blog post — links, dev logs, frames, half-thoughts. let's see if i actually keep it up.`,
    status: "ready",
    tags: ["meta"],
    publishedAt: "2025-08-20",
  },
].map((note) => noteSchema.parse(note));
