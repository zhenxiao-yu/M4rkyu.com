# Next Release Plan

Short, scoped plan for the next shippable release. Supersedes any larger
roadmap drafts for the purposes of this cycle.

## 1. Release goal

Ship a faster, clearer, more memorable M4RKYU.com first impression.

## 2. Current state

The cyber-pixel foundation is complete through PR #55. Foundation work is
done — we are not adding more foundation in this release.

## 3. Product decisions

- Header is compact.
- Top nav: Work / Archive / Logs / About / Contact.
- Games live under Work.
- Archive replaces Media.
- Logs replaces Blog.
- Terminal and Portal are backlog.
- No new libraries.
- No GSAP, Three.js, or WebGL.
- Pixel treatment is an accent only — not a system rewrite.

## 4. Hero copy

Headline:

> A decent place to put all this.

Subtitle:

> Projects, prototypes, images, and notes from Mark Yu.

Primary CTA:

> See the work

Secondary CTA:

> Read the notes

## 5. Homepage scope

Only polish the first screen in this release:

- Compact header
- Hero
- Right-side command / project preview
- Two CTAs
- Mobile version

Do not rebuild every homepage section yet. Other sections stay as-is and
land in a later release.

## 6. Next 3 PRs

**PR 56 — chore(plan): define next release scope**

- Adds this document.
- No code changes.

**PR 57 — feat(shell): compact navigation**

- Compact header with the five-item top nav (Work / Archive / Logs /
  About / Contact).
- Mobile sheet matches the new structure.
- Internal links continue to point at current URLs; route migration is
  backlog.

**PR 58 — feat(home): polish first screen**

- Hero copy lands (headline, subtitle, two CTAs).
- Right-side command / project preview tightened.
- First-screen mobile pass.
- No motion budget increase, no new dependencies.

## 7. Backlog (not in this release)

- Terminal mode
- Portal
- Route migration (/projects → /work, /gallery → /archive, /blog → /logs)
- Full Work / Archive / Logs page rebuilds
- Per-page "wow factor" interactions
- Performance CI
- Lusion- / Awwwards-style experiments

## 8. Success criteria

- A new visitor understands the site in ten seconds.
- The header is simpler than before.
- The first screen feels personal and memorable.
- Mobile first screen looks clean.
- No performance regression versus current main.
- No new dependencies added.
