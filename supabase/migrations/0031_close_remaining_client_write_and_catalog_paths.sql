-- Close the remaining client-write paths. The mobile app can read its own state,
-- but presence, approaches, and analytics events are created through validated RPCs.
drop policy if exists "users can insert own sessions" on public.presence_sessions;
drop policy if exists "users can update own sessions" on public.presence_sessions;
revoke insert, update on public.presence_sessions from authenticated;

drop policy if exists "users can create approach attempts" on public.approach_attempts;
drop policy if exists "approach participants can update attempts" on public.approach_attempts;
revoke insert, update on public.approach_attempts from authenticated;

drop policy if exists "users can insert own social interaction events" on public.social_interaction_events;
revoke insert on public.social_interaction_events from authenticated;

drop policy if exists "users can insert own venue submissions" on public.venue_submissions;
revoke insert on public.venue_submissions from authenticated;

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
  if v_user_id is null then raise exception 'authentication required'; end if;
  case p_endpoint
    when 'nearby-venues' then v_limit := 8; v_window_seconds := 600;
    when 'venue-details' then v_limit := 20; v_window_seconds := 600;
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
    set window_started_at = case when public.api_request_limits.window_started_at <= now() - make_interval(secs => v_window_seconds) then now() else public.api_request_limits.window_started_at end,
        request_count = case when public.api_request_limits.window_started_at <= now() - make_interval(secs => v_window_seconds) then 1 else public.api_request_limits.request_count + 1 end
  returning request_count into v_count;
  return v_count <= v_limit;
end;
$$;

create or replace function public.start_presence_session(
  p_venue_id uuid,
  p_intent intent_type,
  p_vibes text[],
  p_hint_text text,
  p_latitude double precision,
  p_longitude double precision,
  p_duration_minutes integer
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_venue public.venues%rowtype;
  v_radius double precision;
  v_distance double precision;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('presence-start') then raise exception 'visibility start limit reached'; end if;
  if p_duration_minutes not in (30, 60, 90, 120) then raise exception 'invalid session duration'; end if;
  if cardinality(coalesce(p_vibes, '{}'::text[])) > 3 then raise exception 'too many vibes'; end if;
  if p_hint_text is not null and char_length(trim(p_hint_text)) not between 1 and 80 then raise exception 'invalid hint text'; end if;
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'invalid location'; end if;
  select * into v_venue from public.venues where id = p_venue_id and is_active;
  if not found then raise exception 'venue unavailable'; end if;
  v_radius := greatest(coalesce((v_venue.geofence_json ->> 'radius_meters')::double precision, 60), 60);
  v_distance := public.venue_distance_meters(
    p_latitude, p_longitude,
    coalesce(v_venue.latitude, (v_venue.geofence_json -> 'center' ->> 'latitude')::double precision),
    coalesce(v_venue.longitude, (v_venue.geofence_json -> 'center' ->> 'longitude')::double precision)
  );
  if v_distance > greatest(v_radius, 150) then raise exception 'you must be near this venue'; end if;
  if exists (select 1 from public.venue_preferences where user_id = v_user_id and venue_id = p_venue_id and hidden) then raise exception 'venue is hidden'; end if;

  update public.presence_sessions set status = 'session_ended', ended_at = now()
  where user_id = v_user_id and ended_at is null
    and status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');
  insert into public.presence_sessions (user_id, venue_id, intent, vibes, hint_text, status, prompt_state, started_at, expires_at)
  values (v_user_id, p_venue_id, p_intent, coalesce(p_vibes, '{}'::text[]), nullif(trim(p_hint_text), ''), 'visible', 'none', now(), now() + make_interval(mins => p_duration_minutes))
  returning id into v_session_id;
  return v_session_id;
end;
$$;

create or replace function public.end_presence_session(p_session_id uuid, p_status presence_status)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_status not in ('paused', 'session_ended') then raise exception 'invalid end status'; end if;
  update public.presence_sessions
  set status = p_status,
      paused_at = case when p_status = 'paused' then now() else null end,
      ended_at = case when p_status = 'session_ended' then now() else null end
  where id = p_session_id and user_id = auth.uid() and ended_at is null;
  return found;
end;
$$;

create or replace function public.start_approach_attempt(p_presence_session_id uuid)
returns table (approach_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_target public.presence_sessions%rowtype;
  v_approach_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('approach-start') then raise exception 'approach limit reached'; end if;
  select * into v_target from public.presence_sessions
  where id = p_presence_session_id and ended_at is null and expires_at > now()
    and status in ('visible', 'discoverable', 'expiring');
  if not found or v_target.user_id = v_user_id then raise exception 'target unavailable'; end if;
  if not exists (
    select 1 from public.presence_sessions own
    where own.user_id = v_user_id and own.venue_id = v_target.venue_id
      and own.ended_at is null and own.expires_at > now()
      and own.status in ('visible', 'discoverable', 'expiring')
  ) then raise exception 'you must be visible at the same venue'; end if;
  if exists (select 1 from public.blocks b where (b.actor_user_id = v_user_id and b.target_user_id = v_target.user_id) or (b.actor_user_id = v_target.user_id and b.target_user_id = v_user_id)) then raise exception 'target unavailable'; end if;
  insert into public.approach_attempts (from_user_id, to_user_id, presence_session_id, status, started_at, expires_at)
  values (v_user_id, v_target.user_id, p_presence_session_id, 'started', now(), now() + interval '1 minute')
  returning id, approach_attempts.expires_at into v_approach_id, expires_at;
  approach_id := v_approach_id;
  return next;
end;
$$;

create or replace function public.finish_approach_attempt(p_approach_id uuid, p_status approach_status)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_status not in ('connected', 'cancelled', 'expired') then raise exception 'invalid approach status'; end if;
  update public.approach_attempts set
    status = p_status,
    completed_at = case when p_status = 'connected' then now() else completed_at end,
    cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
  where id = p_approach_id and from_user_id = auth.uid() and status = 'started';
  return found;
end;
$$;

alter type public.social_interaction_event_type add value if not exists 'approach_cancelled';
create or replace function public.record_social_interaction_event(
  p_event_type public.social_interaction_event_type,
  p_target_user_id uuid default null,
  p_visibility_session_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_venue_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('social-event') then return false; end if;
  if octet_length(coalesce(p_metadata, '{}'::jsonb)::text) > 1024 then raise exception 'event metadata too large'; end if;
  if p_target_user_id = v_user_id then raise exception 'invalid event target'; end if;
  if p_visibility_session_id is not null then
    select venue_id into v_venue_id from public.presence_sessions
    where id = p_visibility_session_id and user_id = v_user_id;
    if not found then raise exception 'invalid visibility session'; end if;
  end if;
  insert into public.social_interaction_events (actor_user_id, target_user_id, venue_id, visibility_session_id, event_type, metadata)
  values (v_user_id, p_target_user_id, v_venue_id, p_visibility_session_id, p_event_type, coalesce(p_metadata, '{}'::jsonb));
  return true;
end;
$$;

revoke all on function public.start_presence_session(uuid, intent_type, text[], text, double precision, double precision, integer) from public, anon;
revoke all on function public.end_presence_session(uuid, presence_status) from public, anon;
revoke all on function public.start_approach_attempt(uuid) from public, anon;
revoke all on function public.finish_approach_attempt(uuid, approach_status) from public, anon;
revoke all on function public.record_social_interaction_event(public.social_interaction_event_type, uuid, uuid, jsonb) from public, anon;
grant execute on function public.start_presence_session(uuid, intent_type, text[], text, double precision, double precision, integer) to authenticated;
grant execute on function public.end_presence_session(uuid, presence_status) to authenticated;
grant execute on function public.start_approach_attempt(uuid) to authenticated;
grant execute on function public.finish_approach_attempt(uuid, approach_status) to authenticated;
grant execute on function public.record_social_interaction_event(public.social_interaction_event_type, uuid, uuid, jsonb) to authenticated;

-- The catalog is served only by the location/details Edge Functions. Reviewers
-- retain their moderation view, while normal clients use a scoped saved-venues RPC.
drop policy if exists "venues readable by authenticated users" on public.venues;
create policy "reviewers can read venue catalog"
on public.venues for select to authenticated
using (public.is_admin_reviewer(auth.uid()));
revoke select on public.venues from authenticated;
grant select on public.venues to authenticated;

create or replace function public.get_saved_venues()
returns table (
  venue_id uuid,
  venue_name text,
  venue_type venue_type,
  formatted_address text,
  saved_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select sv.venue_id, v.name, v.type, v.formatted_address, sv.created_at
  from public.saved_venues sv
  join public.venues v on v.id = sv.venue_id
  where sv.user_id = auth.uid()
  order by sv.created_at desc;
$$;
revoke all on function public.get_saved_venues() from public, anon;
grant execute on function public.get_saved_venues() to authenticated;

-- Community venue photos are private objects. Only authenticated callers get a
-- short-lived signed URL from an Edge Function; public object URLs are disabled.
update storage.buckets set public = false where id = 'community-venue-photos';

-- Community venues are immediate; the old pending-review controls are retired.
revoke execute on function public.approve_venue_submission(uuid, uuid) from authenticated;
revoke execute on function public.reject_venue_submission(uuid) from authenticated;
