-- Extensions required by the user system.
-- pgcrypto -> gen_random_uuid(); citext -> case-insensitive usernames.
-- Both are bundled with Supabase Postgres; this just enables them in
-- the public schema if they aren't already.

create extension if not exists pgcrypto;
create extension if not exists citext;
