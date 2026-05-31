# Technical Debt Register

Last updated: 2026-05-30
Total items: 4 (2 open, 2 resolved) | Estimated remaining effort: 2×M

Tech debt is a tool, not a failure — this register tracks conscious decisions.
The codebase is otherwise notably clean: zero `TODO`/`FIXME`/`HACK` in `src`,
zero `as any` / `: any` / `@ts-ignore`, all `eslint-disable` lines justified
inline, and all `console.*` calls are structured prefixed logging.

**Scoring:** `Priority = (impact × frequency_of_encounter) / fix_effort`,
where Low/Med/High/Critical = 1/2/3/4 and S/M/L/XL = 1/2/3/4. Sorted high→low.

| ID | Category | Description | Files | Effort | Impact | Priority | Added | Sprint |
|----|----------|-------------|-------|--------|--------|----------|-------|--------|
| TD-001 | Test | **Resolved 2026-05-30.** Vitest baseline established (`tests/unit/`, `node` default + per-file `jsdom` opt-in, isolated from Playwright via `testIgnore`). 86 unit tests across the highest-risk surfaces: all content Zod schemas; auth redirect-safety helpers (`sanitizeNextPath` open-redirect guard, `resolveSiteOrigin`); a Supabase/Resend mock harness covering all 7 `actions.ts` server actions; and the audio provider state machine (storage-restore, volume clamping, persistence, playlist navigation) in jsdom without touching the Web Audio path. Going forward, new logic on these surfaces ships with tests rather than against a blank slate. | `tests/unit/`, `src/content/schemas.ts`, `src/lib/auth/redirect-url.ts`, `src/lib/auth/actions.ts`, `src/lib/audio/audio-player-context.tsx` | L | High | 3.0 | 2026-05-30 | Resolved |
| TD-002 | Code Quality | **Partially reduced (2026-05-30).** Pure branch-heavy logic extracted into tested sibling modules: auth error classifiers → `lib/auth/error-classify.ts` (`actions.ts` 788→731), audio prefs/clamp/readers → `lib/audio/player-prefs.ts` (provider 746→716). The remainder is cohesive single-concern code (server actions; the provider's effect/ref wiring) — consciously accepted. Untouched: `components/gallery/gallery-lightbox.tsx` (684). Data/token files (`content/resources.ts` 1238, `globals.css` 1077) intentionally large and excluded. | `lib/auth/actions.ts`, `lib/audio/audio-player-context.tsx`, `components/gallery/gallery-lightbox.tsx` | M | Med | 2.0 | 2026-05-30 | Backlog |
| TD-003 | Dependency | **Mostly done (2026-05-31).** `shiki`/`@shikijs/rehype` 3→4 and `typescript` 5→6 both bumped — each clean on `validate` + a full `next build`, zero source edits. Still held: `eslint` 9→10 (**blocked — see below**), `@types/node` at 20 (pinned for Node 22.x), ~12 minor in-range bumps. | `package.json` | M | Med | 1.0 | 2026-05-30 | Backlog |
| TD-004 | Documentation | **Resolved 2026-05-30.** Archive-hero follow-up implemented: `priority` added to the `archive/[collection]/page.tsx` cover `<Image>` (route LCP) and `docs/PERFORMANCE_AUDIT.md` §2/§13 updated to mark it landed. `/portal` archival drift reconciled — no doc presents `/portal` as a current route. | `src/app/[locale]/archive/[collection]/page.tsx`, `docs/PERFORMANCE_AUDIT.md`, `docs/COMPONENT_MAP.md`, `docs/REDESIGN_DIRECTION.md`, `docs/UI_LIBRARY_STRATEGY.md`, `docs/SHADCN_V4_REFERENCE.md` | S | Low | — | 2026-05-30 | Resolved |

## Prioritization notes (2026-05-30)

Frequency-of-encounter is how often the debt is actually *hit* during work:

- **TD-001 (resolved 2026-05-30)** — was top priority (freq 3 → score 3.0):
  every change to auth/audio/content shipped without a behavioral net. Paid
  down in four thin slices (runner + schemas → auth redirect helpers → auth
  server-action mock harness → audio state machine), 86 tests total, rather
  than one big-bang L. The remaining long-tail (component-level render tests,
  e2e auth happy-paths) is covered by Playwright + Storybook and isn't tracked
  debt.
- **TD-002 (freq 2 → score 2.0)** — only felt when editing those specific large
  modules. Defer; revisit only if a module gains a third responsibility
  (refactor-for-its-own-sake otherwise).
- **TD-003 (freq 1 → score 1.0)** — surfaces rarely (a bump or a CVE) and is
  **red-zone** per `CLAUDE.md` (version bumps, lockfile churn, load-bearing
  `next.config.ts` webpack overrides). Stays in Backlog; bump only with explicit
  approval + full `validate` + `build`.
  - **eslint 9→10: BLOCKED (attempted 2026-05-30).** `eslint-config-next@16.2.6`
    bundles an `eslint-plugin-react` that calls the `context.getFilename()` API
    removed in eslint 10 → `TypeError: contextOrFilename.getFilename is not a
    function` on every file. Not safely patchable from this repo (it's a nested
    transitive dep). Revisit when `eslint-config-next` ships an eslint-10-ready
    `eslint-plugin-react`. Reverted cleanly to eslint `^9`.
  - **shiki/@shikijs/rehype 3→4: DONE (2026-05-31).** Isolated to
    `components/blog/post-body.tsx`; the dual-theme rehype options are
    unchanged in v4, so no code edits. Verified with `validate` + a full
    `next build`.
  - **typescript 5→6: DONE (2026-05-31).** Despite the whole-typecheck blast
    radius, clean — `tsc --noEmit` surfaced zero new errors across all 563
    source files, lint + a full `next build` both green, no code edits.
- **TD-004 (resolved 2026-05-30)** — was a quick S win; closed in a docs-only
  pass. Archive-hero TODO is now an actionable §2/§13 note and no doc presents
  `/portal` as a current route.

## Accepted-debt rationale

- **TD-001** — A portfolio site weights visual correctness over logic coverage; smoke + Storybook caught most regressions to date. Accepted until auth/audio surfaces grow or break.
- **TD-002** — `auth/actions.ts` and `audio-player-context.tsx` are cohesive single-concern modules; splitting now would be refactor-for-refactor's-sake. Revisit if either gains a third responsibility.
- **TD-003** — Major bumps are **red-zone** per `CLAUDE.md`. Held deliberately; bump only with explicit approval + full `validate` + `build`.
- **TD-004** — Cosmetic doc drift; no runtime impact.

## Rules

- Run `/tech-debt scan` at least once per sprint to catch new debt.
- Every entry must explain WHY it was accepted (see rationale above).
- Items older than 3 sprints without action: fix, or consciously re-accept with a dated note.
