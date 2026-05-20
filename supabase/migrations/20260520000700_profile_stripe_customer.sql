-- Link a Supabase profile to its Stripe customer so checkout can reuse
-- a saved shipping address + payment methods on return visits. Written
-- by the checkout route via the service-role client; readable under the
-- profile's existing RLS.
alter table public.profiles
  add column if not exists stripe_customer_id text;
