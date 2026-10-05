-- Prepared only. Apply after explicit user approval.
begin;
create table public.venue_popular_times (
  place_id text primary key,
  venue_id uuid references public.venues(id) on delete set null,
  popular_times jsonb,
  current_busyness integer check (current_busyness between 0 and 100),
  typical_time_spent text,
  has_data boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  source text not null default 'google_scrape' check (source in ('google_scrape', 'self_report', 'own_telemetry')),
  fetched_at timestamptz,
  expires_at timestamptz,
  -- Lease and backoff are separate from successful data timestamps.
  claim_token uuid,
  pending_until timestamptz default now() + interval '3 minutes',
  retry_at timestamptz
);
alter table public.venue_popular_times enable row level security;
revoke all on public.venue_popular_times from anon, authenticated;
grant select on public.venue_popular_times to authenticated;
grant all on public.venue_popular_times to service_role;
create policy "Authenticated users read shared popular times" on public.venue_popular_times
  for select to authenticated using (true);
create index venue_popular_times_venue_idx on public.venue_popular_times(venue_id);
alter publication supabase_realtime add table public.venue_popular_times;

create function public.claim_popular_times(p_place_id text, p_venue_id uuid, p_source text default 'google_scrape')
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.venue_popular_times;
  token uuid := gen_random_uuid();
  inserted boolean := false;
begin
  if p_source not in ('google_scrape', 'self_report', 'own_telemetry') or p_source is null then raise exception 'invalid provider source'; end if;
  insert into public.venue_popular_times(place_id, venue_id, source, claim_token, pending_until)
    values (p_place_id, p_venue_id, p_source, token, now() + interval '3 minutes')
    on conflict (place_id) do nothing;
  inserted := found;
  select * into r from public.venue_popular_times where place_id = p_place_id for update;
  if inserted then
    return jsonb_build_object('claimed', true, 'row', to_jsonb(r));
  end if;
  -- A terminated worker must not leave an immortal pending row or trigger an immediate second paid run.
  if r.status = 'pending' and coalesce(r.pending_until, '-infinity') <= now() then
    update public.venue_popular_times set status = 'failed', retry_at = now() + interval '24 hours',
      pending_until = null, claim_token = null where place_id = p_place_id returning * into r;
  end if;
  if r.status = 'pending' or (r.status = 'ready' and r.expires_at > now())
    or (r.status = 'failed' and r.retry_at > now()) or (r.source <> p_source and r.source <> 'google_scrape') then
    return jsonb_build_object('claimed', false, 'row', to_jsonb(r));
  end if;
  update public.venue_popular_times set status = 'pending', source = p_source, venue_id = coalesce(p_venue_id, venue_id),
    claim_token = token, pending_until = now() + interval '3 minutes', retry_at = null
    where place_id = p_place_id returning * into r;
  return jsonb_build_object('claimed', true, 'row', to_jsonb(r));
end;
$$;
revoke all on function public.claim_popular_times(text, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_popular_times(text, uuid, text) to service_role;

create or replace function public.consume_api_rate_limit(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_window_seconds integer;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  case p_endpoint
    when 'nearby-venues' then v_limit := 8; v_window_seconds := 600;
    when 'venue-details' then v_limit := 20; v_window_seconds := 600;
    when 'get-popular-times' then v_limit := 60; v_window_seconds := 600;
    when 'venue-activity' then v_limit := 30; v_window_seconds := 600;
    when 'community-venue' then v_limit := 3; v_window_seconds := 86400;
    when 'presence-start' then v_limit := 6; v_window_seconds := 600;
    when 'approach-start' then v_limit := 20; v_window_seconds := 600;
    when 'social-event' then v_limit := 60; v_window_seconds := 600;
    else raise exception 'unknown rate-limited endpoint';
  end case;

  insert into public.api_request_limits (user_id, endpoint, window_started_at, request_count)
  values (v_user_id, p_endpoint, now(), 1)
  on conflict (user_id, endpoint) do update
    set window_started_at = case
          when public.api_request_limits.window_started_at <= now() - make_interval(secs => v_window_seconds)
          then now() else public.api_request_limits.window_started_at end,
        request_count = case
          when public.api_request_limits.window_started_at <= now() - make_interval(secs => v_window_seconds)
          then 1 else public.api_request_limits.request_count + 1 end
  returning request_count into v_count;

  return v_count <= v_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(text) from public, anon;
grant execute on function public.consume_api_rate_limit(text) to authenticated;
commit;
