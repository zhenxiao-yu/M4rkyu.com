# Foundation reference

One-page index of the load-bearing primitives so future contributors
don't have to grep the whole tree. Pair with the doctrine docs:

- `docs/REDESIGN_DIRECTION.md` — visual north star
- `docs/COPY_VOICE.md` — voice + tone tests
- `docs/UI_LIBRARY_STRATEGY.md` — which UI layer to pull from
- `docs/UNIFIED_VISUAL_DIRECTION.md` — M4RKYU.SYS visual thesis
- `docs/COMPONENT_MAP.md` — per-page composition
- `docs/INTERACTION_TECHNIQUES.md` — motion vocabulary

## Layout contract

- `src/components/layout/page-shell.tsx` wraps every locale-routed page:
  skip link → `<Header>` → `<main>` (pulled up by `--dock-h`) →
  `<Footer>`.
- `src/components/layout/header.tsx` is `position: sticky; top: 0;` —
  reserves `var(--dock-h)` of flow space, dock is `h-12` (48px) glass
  inside a `pt-3 sm:pt-4` gutter.
- `--dock-h` lives on `:root` in `globals.css`. Change it there; the
  header gutter and `<main>`'s negative-margin pull-up update together.
- Sections inside pages use `py-16` (64px). With `--dock-h: 60px` that
  leaves a 4px clearance below the dock — enough for hero content to
  clear, narrow enough to feel intentional.

## Theming

- Library: `next-themes` (`src/components/theme/theme-provider.tsx`,
  mounted inside `[locale]/layout.tsx`).
- Attribute contract: `[data-theme="light" | "dark"]` on `<html>`.
- View Transitions: `ThemeSwitcher` opts into
  `document.startViewTransition()` when available, plays the theme-sweep
  keyframe in `globals.css` (circle expanding from click position).
- Adding a third theme is CSS-only: declare a new
  `[data-theme="..."]` block in `globals.css`, register the theme name
  with `next-themes`. No component changes required.

## Design tokens (in `:root`, light)

| Group | Tokens |
|-------|--------|
| Colour | `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--signal`, `--success`, `--warning` |
| Motion | `--motion-micro` 120ms · `--motion-fast` 180ms · `--motion-medium` 280ms · `--motion-slow` 500ms · `--motion-cinematic` 800ms |
| Easing | `--ease-premium` (cubic-bezier(0.2, 0.7, 0.2, 1)) |
| Layout | `--dock-h` (sticky header reserved flow) |
| Radius | `--radius` (0.5rem) + Tailwind `@theme` aliases sm/md/lg/xl |
| Type | `--font-sans` (Geist) · `--font-mono` (Geist Mono) · `--font-display` (Syne) · `--font-pixel` (VT323; `:lang(zh)` rewires it to Syne) |
| Atmospheric | `.bg-cyber-grid` · `.noise-layer` · `.scanline-layer` · `.archive-vignette` · `.contact-sheet` · `.placeholder-noise` |

Dark mode mirrors the colour group under `[data-theme="dark"]` —
motion / easing / radius are inherited from `:root`.

## Breakpoints

Stock Tailwind v4 scale (no overrides):

| Token | Width |
|-------|-------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

Layout shifts at `sm:` (typography), `lg:` (desktop nav reveal, full
Cmd-K trigger). Pages target 360 / 768 / 1280 / 1920 widths per
`playwright.config.ts`.

## Forms

- Shared validation schemas live under `src/lib/forms/*-schema.ts`
  (currently `inquiry-schema.ts`).
- Schema error messages are **translation keys**, not strings. The
  shared schema stays dependency-free; the form layer resolves keys
  through `useTranslations(<namespace>)`. Server + client see the same
  Zod parse + same error keys.
- Reusable primitive: `src/components/forms/form-field.tsx`. Wraps
  `react-hook-form` `Controller` with localised label + error
  rendering + aria wiring. Accepts either the default `<Input>` or a
  custom `render` for textareas / selects.
- Server-action pattern: each form gets a sibling `_actions.ts` with
  `"use server"` at the top. The action returns a discriminated
  result `{ status: "idle" | "success" | "error", ... }` which the
  client maps to RHF errors or sonner toasts.

## Toasts

- `src/components/ui/sonner.tsx` re-exports a `<Toaster>` themed
  against our CSS variables. Mounted once in `[locale]/layout.tsx`
  inside `ThemeProvider`.
- Call `toast.success(...)` / `toast.error(...)` from any client
  component — no extra context needed.

## Env

Validated at module load through `@t3-oss/env-nextjs`. Required keys
fail the build with a descriptive error, not a silent prod 500.

| Key | Scope | Required | Purpose |
|-----|-------|----------|---------|
| `RESEND_API_KEY` | server | yes | Resend client for `/contact` |
| `INQUIRY_FROM_EMAIL` | server | yes | Resend `from:` (must be on a verified domain) |
| `INQUIRY_TO_EMAIL` | server | yes | Inbox that receives inquiries |
| `TURNSTILE_SECRET_KEY` | server | optional | Cloudflare Turnstile verify; omit for local dev |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | optional | Renders Turnstile widget when present |
| `NEXT_PUBLIC_FIREBASE_*` | client | optional | Firebase Web SDK (see `.env.example`) |
| `NEXT_DIST_DIR` | runtime | optional | Override `.next` output dir (Windows EISDIR workaround) |
| `ANALYZE` | runtime | optional | `npm run analyze` sets this to `"true"` |

Add new keys to `src/lib/env.ts` **and** `.env.example`. Update this
table in the same PR.

## Integrations

| Service | Use | File |
|---------|-----|------|
| dev.to | Syndicated post timeline, palette index, notification feed | `src/lib/blog/devto.ts` + `get-posts.ts` |
| Resend | `/contact` inquiry send | `src/lib/email/client.ts` + `_actions.ts` |
| React Email | Inquiry template HTML + plaintext | `src/lib/email/templates/inquiry.tsx` |
| Cloudflare Turnstile | `/contact` spam protection | `src/lib/server/turnstile.ts` + client widget in `_contact-form.tsx` |
| Vercel Analytics | Page view + Web Vitals | `src/app/layout.tsx` |
| Vercel Speed Insights | Real-user perf | `src/app/layout.tsx` |
| `next-intl` | en / zh routing + translations | `src/i18n/routing.ts`, `messages/` |
| `next-themes` | Light / dark + view-transition sweep | `src/components/theme/*` |
| `motion/react` | Component-level animation (notification bell, blur fade, hero) | mixed |
| GSAP | Hero boot sequence | `src/components/sections/hero-boot-sequence.tsx` |

## Scripts

```
npm run dev              # local dev (Next 15)
npm run build            # production build (honours NEXT_DIST_DIR)
npm run start            # serve a built app
npm run lint             # ESLint over src + tests + configs
npm run typecheck        # tsc --noEmit
npm run format[:write]   # Prettier check / write
npm run validate         # lint + typecheck
npm run analyze          # ANALYZE=true next build (treemap reports)
npm run storybook        # Storybook dev (6006)
npm run build-storybook  # Storybook static build
npm run test:e2e         # Playwright smoke (360/768/1280/1920)
```

## i18n

- Locales live in `messages/en.json` and `messages/zh.json`. Parity is
  enforced manually — keep this table in sync on every PR that adds a
  key:
  ```
  node -e "const e=require('./messages/en.json'),z=require('./messages/zh.json');function flat(o,p=''){const out={};for(const k of Object.keys(o)){const v=o[k],nk=p?p+'.'+k:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(out,flat(v,nk));else out[nk]=true}return out}const fe=flat(e),fz=flat(z);console.log('drift en:',Object.keys(fe).filter(k=>!fz[k]));console.log('drift zh:',Object.keys(fz).filter(k=>!fe[k]));"
  ```
- Add keys to **both** files in a single commit. No drip translation
  passes.
- Navigation uses `TransitionLink` (re-exported from `@/i18n/navigation`
  as `Link`) so cross-route navigation animates via View Transitions.

## Adding a new form

1. Drop a Zod schema in `src/lib/forms/<name>-schema.ts` — error
   messages are translation keys.
2. Add a server action sibling to the page (`_actions.ts`,
   `"use server"`).
3. Build the form with `<FormField>` + `react-hook-form` + the action.
4. Add translation keys to the namespace and mirror to zh.json.
5. Use `toast.success(...)` / `toast.error(...)` for outcome feedback.

## Out of band

- Windows EISDIR on H:\ — set `NEXT_DIST_DIR=.next-dev-3000` (or any
  ignored dir) before `npm run dev` / `build`. See README.md.
- Bundle analyzer treemaps land under `<distDir>/analyze/*.html` when
  `ANALYZE=true`. Open them in a browser.
