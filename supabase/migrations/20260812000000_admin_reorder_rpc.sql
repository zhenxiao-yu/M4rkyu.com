-- Atomic content reordering.
--
-- The admin CMS previously reordered a list by reading every row, swapping
-- two positions in application memory, then firing N parallel UPDATEs. That is
-- racy (two concurrent reorders read stale state and lose writes), non-atomic
-- (a partial failure leaves the ordering corrupt), and O(N) round-trips per
-- single up/down nudge.
--
-- This function does the whole swap-and-normalize in ONE transactional
-- statement, server-side: it densely re-ranks the (optionally scoped) list by
-- the app's canonical ordering (sort_order asc, created_at desc), swaps the
-- target row with its neighbour, and writes back only the rows whose position
-- actually changed. Behaviour matches the old app logic exactly, minus the race
-- and the network fan-out.
--
-- SECURITY: runs as the caller (security invoker) so the existing admin RLS
-- UPDATE policies still gate every write — a non-admin caller updates zero rows.
-- Table and scope-column names are whitelisted and only ever interpolated via
-- format(%I), so there is no dynamic-SQL injection surface.

create or replace function public.admin_reorder(
  p_table     text,
  p_id        uuid,
  p_direction text,
  p_scope_col text default null,
  p_scope_val uuid default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $func$
declare
  v_tables constant text[] := array[
    'projects', 'products', 'games', 'media_items', 'resources', 'notes',
    'gallery_collections', 'gallery_items'
  ];
  v_scope_cols constant text[] := array['collection_id', 'project_id'];
  v_delta      int;
  v_scope_sql  text := '';
  v_sql        text;
begin
  if not (p_table = any(v_tables)) then
    raise exception 'admin_reorder: table % is not reorderable', p_table;
  end if;

  if p_direction = 'up' then
    v_delta := -1;
  elsif p_direction = 'down' then
    v_delta := 1;
  else
    raise exception 'admin_reorder: invalid direction %', p_direction;
  end if;

  if p_scope_col is not null then
    if not (p_scope_col = any(v_scope_cols)) then
      raise exception 'admin_reorder: scope column % is not allowed', p_scope_col;
    end if;
    v_scope_sql := format(' where %I = $3', p_scope_col);
  end if;

  -- $1 = target id, $2 = delta, $3 = scope value (only when scoped).
  v_sql := format($q$
    with ordered as (
      select id,
             row_number() over (order by sort_order asc, created_at desc) - 1 as pos
      from %1$I
      %2$s
    ),
    cur as (select pos from ordered where id = $1),
    bounds as (select count(*)::int as n from ordered)
    update %1$I t
    set sort_order = s.new_pos
    from (
      select o.id,
        case
          when o.pos = c.pos          then c.pos + $2
          when o.pos = c.pos + $2     then c.pos
          else o.pos
        end as new_pos
      from ordered o
      cross join cur c
      cross join bounds b
      where c.pos + $2 >= 0 and c.pos + $2 < b.n
    ) s
    where t.id = s.id and t.sort_order is distinct from s.new_pos
  $q$, p_table, v_scope_sql);

  if p_scope_col is not null then
    execute v_sql using p_id, v_delta, p_scope_val;
  else
    execute v_sql using p_id, v_delta;
  end if;
end;
$func$;

-- Only authenticated admins ever call this; RLS does the real gating.
revoke execute on function public.admin_reorder(text, uuid, text, text, uuid) from public;
grant execute on function public.admin_reorder(text, uuid, text, text, uuid) to authenticated;
