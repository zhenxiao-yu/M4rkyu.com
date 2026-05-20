-- ============================================================
-- Orders — written by the Stripe webhook (service-role) after a
-- Checkout Session completes. The webhook is the only writer, so there
-- are no insert/update policies for normal users; the service-role key
-- bypasses RLS. Buyers can read their own orders (when signed in and
-- linked via user_id); admins can read all. `stripe_session_id` is
-- unique so webhook retries upsert idempotently.
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  email text,
  amount_total integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'paid' check (
    status in ('paid', 'pending', 'refunded', 'canceled')
  ),
  -- Snapshot of purchased lines: [{ slug, title, quantity, priceInCents, kind }]
  items jsonb not null default '[]'::jsonb,
  -- Customer + shipping snapshot from the Checkout Session.
  shipping jsonb,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_idx
  on public.orders (user_id, created_at desc);
create index if not exists orders_created_idx
  on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (
    (user_id is not null and user_id = auth.uid())
    or public.is_admin(auth.uid())
  );
