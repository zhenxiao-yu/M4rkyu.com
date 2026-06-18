---
title: M4rkyu.com — AI / vibe-coding workflow
status: living
audience: future contributors (human + AI)
last_updated: 2026-06-18
---

# AI / vibe-coding workflow

How work actually ships here. This is the **flow**; the *posture* (when to act
vs. ask, what's green/yellow/red) lives in the repo `CLAUDE.md` —
**Vibe-Coding Operating Loop** + the zone lists. Don't duplicate those here;
point to them.

A playbook, not a rulebook. When a step is wrong for the situation, depart from
it and update this file in a follow-up.

---

## 1. Commit cadence

**Default: small, coherent commits directly on `main`.** One concern per
commit; a commit message reads as a line of the project's timeline. This is the
normal mode for polish, content, copy, a11y, and contained features — no branch,
no PR ceremony.

- Message style: `<kind>(<scope>): <what>` — `feat` / `fix` / `polish` /
  `chore` / `docs`. End with the `Co-Authored-By` trailer.
- Bundle *related* polish into one well-shaped commit rather than shredding into
  five timid ones. Split *unrelated* discoveries into their own commits.

**Open a branch + PR when** the change is large, risky, or wants CI/review
before it touches `main`: schema or routing changes, dependency/config edits,
auth/payments/AI, or anything you'd want a second set of eyes on. Branch name:
`<kind>/<short-tag>`. PR body explains *why*. The PR CI
(`.github/workflows/pr.yml`) runs `validate` + the Playwright smoke spec; merges
block on either failing.

Never force-push to `main`, reset a branch, or delete unmerged work without
explicit approval (Red zone).

---

## 2. Validation gate

Before committing anything non-trivial:

```bash
npm run validate    # lint + typecheck — both must be silent
```

For code / routing / dependency / config / UI-layout changes, run the closest
affected gate first, then broaden:

```bash
npm run build
npm run build-storybook
npm run test:e2e        # boots its own server on NEXT_DIST_DIR=.next-playwright
```

Don't claim safety from lint alone when layout/UI changed — verify visually
(Storybook, Playwright, or Chrome DevTools MCP).

`npm run format` is a noisy whole-repo legacy Prettier check — **not** a merge
signal. Format only the files you touched: `npx prettier --write <paths>`.

**Windows `.next` lock:** if dev/build/validate trips a filesystem lock or
typecheck reads a stale `.next-*/types`, set an isolated `NEXT_DIST_DIR` (see
`CLAUDE.md`) and/or `npm run clean`. `tsconfig.json` drifts from dev runs —
never commit that churn.

---

## 3. Code review

For non-trivial diffs, run the `code-reviewer` subagent (and
`security-reviewer` for anything touching auth, payments, AI, file I/O, or
user input) before committing:

```text
Task → subagent_type: code-reviewer
       prompt: scope + files + constraints
```

It reports **BLOCK** / **SHOULD-FIX** / **NIT**. BLOCK = fix first (hydration,
broken a11y, leaked secrets). SHOULD-FIX = address or note why not. NIT =
judgment call. The report is *input* — the reviewer is opinionated and
sometimes wrong; verify before applying, push back when it's wrong.

Trivial commits (copy nudge, token cleanup, a11y attribute) don't need the
subagent — a careful self-review of the diff is enough.

---

## 4. The non-negotiables (quick list)

Full rationale is in `CLAUDE.md` (Architecture) and
`docs/UNIFIED_VISUAL_DIRECTION.md`. The ones that bite if forgotten:

- **i18n from line one** — every visible string in *both* `messages/en.json`
  and `messages/zh.json`, same commit. CJK hand-translated, never
  transliterated. No pixel font on `:lang(zh)`.
- **Tokens only** — `var(--ring)`, `var(--motion-fast)`, `border-border`, … No
  `bg-zinc-*`, no hex literals, no `transition-[colors,transform]` (invalid v4).
  Three inks max per theme (`--ring` / `--ring-2` / `--ring-3`).
- **Reduced motion + touch** — `useReducedMotion()` on every animated
  primitive; pointer-tracking effects short-circuit via
  `matchMedia("(pointer: fine)")`. Hardcoded `motion/react` easings keep the
  inline carve-out comment (`transition.ease` can't read CSS vars).
- **Decorative icons** carry `aria-hidden="true"`; external `<a>` carries
  `rel="noopener noreferrer"`.
- **`Button` variants**: `default | secondary | outline | ghost | link` (no
  `destructive`).
- **Don't touch** `next.config.ts` / `package.json` / `package-lock.json` /
  `tsconfig.json` unless the task is explicitly about them (Red zone).

---

## 5. Memory + persistent context

Memory lives at
`~/.claude/projects/e--Projects-GitHub-M4rkyu-com/memory/` (one fact per file,
indexed through `MEMORY.md`). Guardrails are in the user's **global**
`~/.claude/CLAUDE.md`: don't duplicate what the codebase already encodes; verify
a recalled memory is still true before acting on it (memories are point-in-time,
not live state).

---

## 6. Subagents + background work

- **`Explore`** — open-ended, multi-area file discovery when the path isn't
  known. Returns conclusions, not file dumps.
- **`code-reviewer` / `security-reviewer`** — pre-commit gates (§3).
- **`general-purpose` with a cheaper model** — mechanical sweeps (canonical-class
  passes, mass renames) that don't need the top model.
- Pick the *most-specialized* agent for a job; don't fan three agents at the
  same question.

PR CI takes 3–5 min. If you opened a PR, watch it with one background `until`
loop (not a tight sleep-poll); the harness notifies on exit. Use the wait to
draft the next change — but don't stack a second branch on unmerged work.

---

## 7. When the playbook breaks

1. Depart from the step; note why in the commit/PR body.
2. Update this file in a follow-up commit.
3. If it's a pattern others will hit, add a memory entry.

Document the exception, then fix the contract.
