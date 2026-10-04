-- Run against staging after migration 0029. This checks grants without
-- requiring production-like user or venue fixtures.
begin;

do $$
begin
  if has_table_privilege('authenticated', 'public.active_presence_sessions', 'select') then
    raise exception 'authenticated users must not read active_presence_sessions directly';
  end if;
  if has_table_privilege('authenticated', 'public.venue_context_summary', 'select') then
    raise exception 'authenticated users must not read venue_context_summary directly';
  end if;
  if has_table_privilege('authenticated', 'public.venue_activity_cache', 'select') then
    raise exception 'authenticated users must not read venue_activity_cache directly';
  end if;
  if has_function_privilege('anon', 'public.get_nearby_feed(uuid, uuid)', 'execute') then
    raise exception 'anonymous users must not execute get_nearby_feed';
  end if;
  if has_function_privilege('anon', 'public.get_current_venue_context(uuid)', 'execute') then
    raise exception 'anonymous users must not execute get_current_venue_context';
  end if;
end;
$$;

rollback;

select 'PASS: raw presence, venue context, and activity cache are not directly readable; discovery RPCs require authentication' as result;
