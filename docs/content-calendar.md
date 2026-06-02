# Content Calendar

The publishing-cadence engine for m4rkyu.com. The goal of the audience-growth
arc is **weekly returning readers**, and the fuel for that is shipping
consistently. This doc is the lightweight operating rhythm — fill the rolling
4-week table, schedule ahead, and the site does the rest.

## Cadence target

- **1 note / week** — short-form: a design fragment, a working idea, reading
  marginalia. Terse and dated (see `/notes`).
- **Logs** sync automatically from dev.to — no scheduling needed here; write
  there, it appears under `/logs` (canonical stays dev.to).
- **Work / Archive** — opportunistic, when a real project or collection is
  ready (no filler).

## How to schedule a note

Notes support **scheduled publishing with zero ceremony**:

1. Write the note in `/admin/notes/new` (or edit an existing one).
2. Set **Status → ready** and set **Published at** to a *future date*.
3. Save. The note stays out of the public feed, `/latest`, and RSS/JSON until
   that date passes — then it goes live on the next hourly ISR revalidation.

Admin always sees scheduled + draft notes; the public never does. Mechanics:
`isPublishedNote()` in `src/lib/notes/publish.ts` (ready AND `publishedAt <= now`).

## Publish ritual (every ship)

- Set the note's `publishedAt` to its intended go-live date (today or future).
- For a site change worth announcing, add a line to `CHANGELOG.md` — it drives
  the live `/changelog` route and the `/latest` unified feed.
- Tag the note so it joins the relevant topic hub (`/topics/[tag]`) and shows
  up in cross-domain search and related-content.

## Rolling 4-week plan

Fill this in; keep ~4 weeks scheduled ahead so a quiet week never goes dark.

| Week of | Note (working title) | Tags | Status | Notes |
| --- | --- | --- | --- | --- |
| _TBD_ | | | planned | |
| _TBD_ | | | planned | |
| _TBD_ | | | planned | |
| _TBD_ | | | planned | |

## Backlog ideas

Park half-formed note ideas here so the calendar always has raw material.

- _(add ideas)_
