# Deploy

Production-deploy checklist for m4rkyu.com on Vercel. Run-once setup
items live in [SETUP](#setup-once-per-environment); the
[per-release](#per-release) section is what you actually run before
shipping a PR.

## Setup (once per environment)

### 1. Required environment variables

Every variable in [`src/lib/env.ts`](src/lib/env.ts) is validated at
build time. A missing or empty required key fails the Vercel build
with a descriptive error — no silent prod 500s.

| Key | Scope | Where it lives | Required |
|-----|-------|----------------|----------|
| `RESEND_API_KEY` | Server | Resend → API Keys | yes |
| `INQUIRY_FROM_EMAIL` | Server | a verified Resend domain sender alias | yes |
| `INQUIRY_TO_EMAIL` | Server | wherever inquiries should land | yes |
| `TURNSTILE_SECRET_KEY` | Server | Cloudflare → Turnstile → site → Settings | optional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | same site, "Site Key" field | optional |

The Firebase `NEXT_PUBLIC_FIREBASE_*` keys are public by design (web
SDK config, gated by Firebase Security Rules) and can be committed
without leaking sensitive material.

### 2. Push env to Vercel

```bash
# Once, links the local repo to the Vercel project
vercel link

# Production target
vercel env add RESEND_API_KEY production
vercel env add INQUIRY_FROM_EMAIL production
vercel env add INQUIRY_TO_EMAIL production
vercel env add TURNSTILE_SECRET_KEY production
vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production

# (Repeat with `preview` to give PR previews a working /contact form.
#  Or skip — preview deploys will fail their build until env is set,
#  which is a fine guard during early development.)
vercel env add RESEND_API_KEY preview
vercel env add INQUIRY_FROM_EMAIL preview
vercel env add INQUIRY_TO_EMAIL preview
```

To re-pull the live env to a local `.env.local` for inspection:

```bash
vercel env pull .env.local
```

### 3. Resend setup

See [docs/FOUNDATION.md](docs/FOUNDATION.md) §Integrations for the live
contract. New environment? Three steps:

1. https://resend.com/domains → **Add Domain** (`m4rkyu.com`) → choose
   region (`us-east-1` is the existing one).
2. Resend gives 3 DNS records (DKIM TXT, send MX, SPF TXT). Add them
   at the DNS provider (currently GoDaddy, see
   [§DNS provider](#dns-provider)). Confirm propagation:

   ```bash
   # All three should return values, not NXDOMAIN
   curl -s "https://cloudflare-dns.com/dns-query?name=resend._domainkey.m4rkyu.com&type=TXT" -H "accept: application/dns-json"
   curl -s "https://cloudflare-dns.com/dns-query?name=send.m4rkyu.com&type=MX" -H "accept: application/dns-json"
   curl -s "https://cloudflare-dns.com/dns-query?name=send.m4rkyu.com&type=TXT" -H "accept: application/dns-json"
   ```

3. Click **Verify** in the Resend UI. AWS SES negative-caches initial
   misses, so plan for 10–30 min before the domain flips to verified.
   Re-clicking Verify is idempotent.

### 4. Cloudflare Turnstile (optional but recommended)

Without Turnstile the contact form leans on its honeypot only, which
catches dumb bots but not anything targeted.

1. https://dash.cloudflare.com → **Turnstile** → **Add Site**.
2. Hostnames: `m4rkyu.com` + `localhost` (so local dev still gets a
   widget).
3. Widget mode: **Managed** (Cloudflare auto-selects invisible vs
   interactive).
4. Copy the two keys into `.env` and push to Vercel:

   ```bash
   vercel env add TURNSTILE_SECRET_KEY production
   vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
   ```

The form auto-detects the public key at runtime — no code change.

### 5. DNS provider

Currently GoDaddy (nameservers `ns71.domaincontrol.com`,
`ns72.domaincontrol.com`). To confirm at any time:

```bash
nslookup -type=NS m4rkyu.com 8.8.8.8
```

GoDaddy DNS panel: <https://dcc.godaddy.com/control/portfolio/m4rkyu.com/settings>.

## Per release

For most PRs the only step is **merge → Vercel auto-deploys**. The
preflight is:

```bash
npm run validate        # lint + typecheck
npm run test:e2e        # Playwright smoke at 360/768/1280/1920
ANALYZE=true npm run build   # optional, only when bundle changes are suspected
```

If anything touches `src/lib/env.ts` keys: confirm the matching Vercel
env vars exist (`vercel env ls production`) before the merge lands.

## Key rotation

API keys live in two places: `.env` (local) and Vercel env (prod/preview).

```bash
# 1. Resend → API Keys → revoke old → create new → copy.
# 2. Local: edit .env, paste new value, save.
# 3. Vercel: remove + re-add (interactive prompt accepts paste):
vercel env rm RESEND_API_KEY production
vercel env add RESEND_API_KEY production
# 4. Trigger a redeploy so the new value takes effect:
vercel deploy --prod
```

No code or schema change. Same key shape.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Build fails: `RESEND_API_KEY is required` | Env not pushed to Vercel | `vercel env add` |
| `/contact` submit returns `sendError` toast | Resend rejected (unverified sender, sender domain not yet verified, etc.) | Check Resend dashboard → Emails for the error |
| `/contact` submit returns `spamReject` | Turnstile token missing or rejected | Re-render the widget; if persistent, check Turnstile dashboard for hostname mismatch |
| Domain stuck at `pending` in Resend for hours | DNS records missing or wrong | Re-run the three DoH checks above; missing values = re-add in GoDaddy |
| Local dev shows `invalid-use-server-value` | A non-async export landed in a `"use server"` file | Move the offending export elsewhere — types are fine, value exports must be async functions |
| Build fails on Windows (H:\ drive) `EISDIR illegal operation` | Known Windows symlink issue | `NEXT_DIST_DIR=.next-dev-3000 npm run dev`; doesn't affect Vercel builds |
