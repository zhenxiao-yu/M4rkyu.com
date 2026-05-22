---
title: M4rkyu.com — AI / vibe-coding workflow
status: living
audience: future contributors (human + AI)
last_updated: 2026-05-10
---

# AI / vibe-coding workflow

This file documents the working contract used while shipping the
2027 redesign — five sprints, 24 PRs (#12–#35), dark/light themes,
Cmd-K palette, sitemap + per-route OG. It is a playbook, not a
rulebook. Future contributors (Claude, human, or otherwise)
should keep it accurate when they change the cadence.

---

## 1. One PR per phase

Every phase ships as a single squash-merged PR off `main`.

- Branch name: `<kind>/phase-<N.M>-<short-tag>`. `kind` is one of
  `feat` (new visible behavior), `polish` (visual / UX without
  semantic change), `chore` (infra, scripts, docs, content
  hygiene), `fix`.
- Commit message + PR title share the same line. Body explains
  _why_ the change exists, scoped per phase.
- One concern per PR. If a code-review finding lands a refactor
  that's worth doing, file it as the next phase, not as a tag-along
  in the current PR.

This cadence is what kept the redesign reviewable. A 25-PR squash
log reads as a sprint timeline; a "big-bang" branch would read as
a wall.

---

## 2. The cross-cutting rules

Pulled from `~/.claude/projects/h--Github-M4rkyu-com/memory/feedback_phase1_patterns.md`.
These are hard-won, not stylistic.

- **Translations from line one.** Every visible string routes
  through `next-intl`. CJK is hand-translated, not transliterated.
  Adding a string in English-only is technical debt that always
  has to be repaid.
- **Drop `locale` props that aren't used.** `next-intl`'s `Link`
  resolves locale from context.
- **`aria-hidden="true"` on every decorative icon.** lucide icons
  default to `role="img"`.
- **Tokens only.** `var(--ring)`, `var(--motion-fast)`,
  `var(--ease-premium)`, `border-border`, `bg-card`, `bg-muted`.
  No `bg-zinc-*`, no hex literals, no
  `transition-[colors,transform]` (invalid Tailwind 4).
- **Hardcoded easings inside `motion/react`** get an inline
  carve-out comment — `transition.ease` cannot read CSS variables.
- **`Button` variants**: `default | secondary | outline | ghost |
link`. No `destructive` variant.
- **External `<a>` carries `rel="noopener noreferrer"`**.
- **Do not touch `next.config.ts`, `package.json`,
  `package-lock.json`, `tsconfig.json`** unless the phase
  explicitly does. This kept the build environment stable across
  25 PRs.
- **`prefers-reduced-motion` honored on every animated primitive**
  via `useReducedMotion()` from `motion/react`. Touch surfaces
  short-circuit pointer-tracking effects via
  `matchMedia("(pointer: fine)")`.
- **Pixel typography is opt-in and English-only.**
  `var(--font-pixel)` (VT323, wired in `src/app/layout.tsx`) is
  allowed for HUD chips, CTA glyphs, indices, status badges, and
  command-console accents — never for body paragraphs, captions,
  or any element that may render Chinese. The `:lang(zh)` /
  `[lang^="zh"]` guard in `src/app/globals.css` rewrites
  `--font-pixel` to the display/sans stack so CJK content keeps
  falling through to the system Chinese fonts. See
  `docs/UNIFIED_VISUAL_DIRECTION.md` §6 for the full surface map.
- **Cyber-pixel UI work consumes the semantic tokens from
  `globals.css`.** Available: `--font-pixel`, `--pixel-border`,
  `--pixel-grid-unit`, `--hud-muted`, `--terminal-glow`,
  `--mission-surface`, `--scanline-opacity`, `--noise-opacity`,
  `--panel-depth`, `--game-accent`, `--ease-pixel-step`. Reach for
  these (or their Tailwind utility aliases — `font-pixel`,
  `bg-mission-surface`, `text-hud-muted`, `ease-pixel-step`, …)
  before adding any new hex literal, raw color, or arbitrary
  easing.
- **The accent stays singular.** `--ring` (with `--game-accent`
  as its semantic alias) is the only brand accent on production
  routes. Do not introduce a second hue for "game-feel"
  surfaces — retint through `--game-accent` if the playful slice
  ever needs to drift away from `--ring`.

---

## 3. Validation gate

Before pushing any PR:

```bash
npm run validate    # lint + typecheck
```

Both must be silent. For code, routing, dependency, or config changes, also run
the closest affected gate first and then broaden as needed:

```bash
npm run build
npm run build-storybook
npm run test:e2e
```

The PR CI workflow (`.github/workflows/pr.yml`) runs `validate` plus the
Playwright smoke spec on every PR; merges are blocked on either failing.

`npm run format` is still a whole-repo legacy Prettier check and is currently
noisy against old files. For now, format the files you touch with
`npx prettier --write <paths>` and do not use global format output as a merge
signal until the repo has a dedicated formatting baseline commit.

If validate is silent but the PR CI Playwright job fails, **read
the failure carefully**. The new PR CI in Phase 5.3 caught a stale
test selector on its very first run — that is the gate doing its
job.

---

## 4. Code-reviewer subagent gate

Every PR runs through the `code-reviewer` subagent before commit:

```
Task → subagent_type: code-reviewer
       prompt: branch + scope + files + constraints
```

The subagent reports **BLOCK** / **SHOULD-FIX** / **NIT** with
file:line references.

- **BLOCK**: must fix before commit. Hydration mismatches, broken
  a11y, leaked secrets, etc.
- **SHOULD-FIX**: address unless there's a documented reason
  (note in the PR description).
- **NIT**: optional, judgment call.

The subagent is opinionated and sometimes wrong. The reviewer's
report is _input_ — the implementing agent verifies before
applying. Several phases this round flagged-and-pushed-back on
NIT-level items; that's healthy.

---

## 5. Plan files + memory

Two persistent stores guide multi-session work:

- **Plan file** — when running an agent in plan mode, the agent
  writes a per-task plan that survives across sessions. Path
  varies per harness; it's the single source of truth for "what's
  the next sprint and why".
- **Memory** at
  `~/.claude/projects/h--Github-M4rkyu-com/memory/`. Saves
  hard-won feedback patterns, project context, references — facts
  that should outlive a single conversation.

The memory has guardrails (see the `auto memory` section of the
**user's global** `~/.claude/CLAUDE.md`, not this repo's
`CLAUDE.md`): never duplicate code patterns the codebase already
encodes; index entries through `MEMORY.md`; verify a recalled
memory is still true before acting on it.

---

## 6. Background tasks + concurrency

PR CI takes 3–5 minutes. Spawn the wait as a background command
(harness pseudocode, not a runnable script):

```text
Bash({
  command: `until gh pr checks <N> 2>&1 | grep -qE "fail|pass" && \
           ! gh pr checks <N> 2>&1 | grep -q "pending"; do sleep 25; done; \
           gh pr checks <N> 2>&1`,
  run_in_background: true
})
```

The runtime sends a notification when the loop exits. Use the
window in between to draft the next phase's plan or read context
for the next branch — but **don't open a second branch on top of
unmerged work**. Cleanly merge → branch off `main` → next phase.

Never poll in a tight loop with multiple `sleep` chains — the
harness blocks that. One background `until` loop, one
notification.

---

## 7. Subagent fan-out

Three subagents earned their keep this redesign:

- **`code-reviewer`** — pre-commit gate. See §4.
- **`Explore`** — open-ended file discovery. Use when the scope
  spans multiple areas or the file path isn't known.
- **`general-purpose`** with model override — mechanical work
  that doesn't need Opus. Sprint 3.1's Tailwind-canonical-class
  sweep (PR #23) delegated to a Haiku-backed subagent — fast,
  cheap, accurate.

Avoid spawning multiple subagents for the same question — pick
the most-specialized one for the job and trust its output.

---

## 8. Asking for clarification

A clarifying question to the user has a real cost — it interrupts
flow. Spend up to a minute on read-only investigation
(grep, file reads, memory) so the question becomes specific:
"Found Cmd-K trigger A and B in the header — which one should
the icon variant inherit from?" beats "where is the trigger?".

For broader direction questions ("which polish target should
Sprint 4 prioritize?") the `AskUserQuestion` tool with structured
options is the right form. For yes/no inside a session that's
already moving, output a short message and continue.

---

## 9. Token-thrifty vibe-coding plans

The best agent plan here is small enough to survive contact with the codebase:

```text
Intent: one sentence.
Touch: 2-6 likely files or folders.
Risk: what could break.
Check: the first targeted command, then the broader gate.
Stop: the condition that requires asking the user.
```

Do not write a roadmap when a patch will teach you more. Start with read-only
context, make the smallest coherent edit, run the closest check, then widen.
This keeps sessions cheap and prevents the agent from spending tokens defending
a plan that the code disproves five minutes later.

Anti-pitfalls checklist:

- Keep one concern per commit; split unrelated discoveries into follow-up
  notes.
- Prefer deletion of confirmed dead code over "just in case" parking lots.
- Prefer local fixes over new shared abstractions unless duplication is already
  hurting.
- Validate UI changes with Playwright or Storybook when layout, responsive
  behavior, or interaction changed.
- Never let generated artifacts or failed-test reports become part of the
  commit.
- End with what changed, what passed, what did not run, and the commit/push
  state.

---

## 10. What's in scope for "vibe coding"

For this codebase, vibe coding means:

- The user describes intent ("polish the header", "Sprint 5 SEO")
  and accepts course corrections mid-PR.
- The agent owns: scope, branching, code-reviewer pass, lint /
  typecheck gate, commit message, PR body, CI watch, merge.
- The agent does not own: hard tradeoffs (apex vs www domain
  routing, brand vocabulary changes, deferred feature unlocks).
  Those route through a clarifying question or a plan file.
- "Auto mode" toggles whether the agent stops to ask each step —
  not whether the agent owns harder calls. Even in auto mode,
  destructive ops (`git reset --hard`, force-push, deleting
  shared infra) still require explicit user approval.

---

## 11. When the playbook breaks

If a step here is wrong for the situation:

1. Note it in the PR description ("departing from §3 because…").
2. After the PR ships, edit this file in a follow-up commit.
3. If the change reveals a pattern other contributors will hit,
   add a memory entry under `feedback_*.md`.

Don't silently break the contract — document the exception, then
update the contract.
