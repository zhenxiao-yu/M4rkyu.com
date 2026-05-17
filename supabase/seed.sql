-- Default admin settings. Inserted with ON CONFLICT DO NOTHING so
-- re-running the seed against an existing DB does not clobber
-- author-edited values.

insert into public.admin_settings (key, value)
values
  ('comments_enabled', '{"value": true}'::jsonb),
  ('comments_enabled_for', '{"projects": true, "logs": true, "games": true, "gallery": true}'::jsonb),
  ('featured_frame_slug', '{"value": null}'::jsonb),
  ('home_banner_override', '{"value": null}'::jsonb)
on conflict (key) do nothing;
