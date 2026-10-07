begin;
-- SQL NULL must never bypass required location/status checks.
CREATE OR REPLACE FUNCTION public.start_presence_session(p_venue_id uuid, p_intent intent_type, p_vibes text[], p_hint_text text, p_latitude double precision, p_longitude double precision, p_duration_minutes integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_venue public.venues%rowtype;
  v_radius double precision;
  v_distance double precision;
  v_venue_lat double precision;
  v_venue_lng double precision;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('presence-start') then raise exception 'visibility start limit reached'; end if;
  if p_duration_minutes is null or p_duration_minutes not in (30, 60, 90, 120) then raise exception 'invalid session duration'; end if;
  if p_intent is null then raise exception 'invalid intent'; end if;
  if cardinality(coalesce(p_vibes, '{}'::text[])) > 3 then raise exception 'too many vibes'; end if;
  if p_hint_text is not null and char_length(trim(p_hint_text)) not between 1 and 80 then raise exception 'invalid hint text'; end if;
  if p_latitude is null or p_longitude is null or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'invalid location'; end if;
  select * into v_venue from public.venues where id = p_venue_id and is_active;
  if not found then raise exception 'venue unavailable'; end if;
  v_radius := greatest(coalesce((v_venue.geofence_json ->> 'radius_meters')::double precision, 60), 60);
  v_venue_lat := coalesce(v_venue.latitude, (v_venue.geofence_json -> 'center' ->> 'latitude')::double precision);
  v_venue_lng := coalesce(v_venue.longitude, (v_venue.geofence_json -> 'center' ->> 'longitude')::double precision);
  if v_venue_lat is null or v_venue_lng is null or v_venue_lat not between -90 and 90 or v_venue_lng not between -180 and 180
    or v_radius not between 0 and 100000 then raise exception 'venue location unavailable'; end if;
  v_distance := public.venue_distance_meters(p_latitude, p_longitude, v_venue_lat, v_venue_lng);
  if v_distance is null or v_distance > greatest(v_radius, 150) then raise exception 'you must be near this venue'; end if;
  if exists (select 1 from public.venue_preferences where user_id = v_user_id and venue_id = p_venue_id and hidden) then raise exception 'venue is hidden'; end if;

  update public.presence_sessions set status = 'session_ended', ended_at = now()
  where user_id = v_user_id and ended_at is null
    and status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');
  insert into public.presence_sessions (user_id, venue_id, intent, vibes, hint_text, status, prompt_state, started_at, expires_at)
  values (v_user_id, p_venue_id, p_intent, coalesce(p_vibes, '{}'::text[]), nullif(trim(p_hint_text), ''), 'visible', 'none', now(), now() + make_interval(mins => p_duration_minutes))
  returning id into v_session_id;
  return v_session_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.end_presence_session(p_session_id uuid, p_status presence_status)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_status is null or p_status not in ('paused', 'session_ended') then raise exception 'invalid end status'; end if;
  update public.presence_sessions
  set status = p_status,
      paused_at = case when p_status = 'paused' then now() else null end,
      ended_at = case when p_status = 'session_ended' then now() else null end
  where id = p_session_id and user_id = auth.uid() and ended_at is null;
  return found;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.finish_approach_attempt(p_approach_id uuid, p_status approach_status)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_status is null or p_status not in ('connected', 'cancelled', 'expired') then raise exception 'invalid approach status'; end if;
  update public.approach_attempts set
    status = p_status,
    completed_at = case when p_status = 'connected' then now() else completed_at end,
    cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
  where id = p_approach_id and from_user_id = auth.uid() and status = 'started';
  return found;
end;
$function$
;
-- These legacy review controls were retired by 0031; do not expose them to clients.
revoke all on function public.approve_venue_submission(uuid,uuid), public.reject_venue_submission(uuid) from public, anon, authenticated;
-- Qualify the column that shares a name with the function output parameter.
CREATE OR REPLACE FUNCTION public.start_approach_attempt(p_presence_session_id uuid)
 RETURNS TABLE(approach_id uuid, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_target public.presence_sessions%rowtype;
  v_approach_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('approach-start') then raise exception 'approach limit reached'; end if;
  select ps.* into v_target from public.presence_sessions ps
  where ps.id = p_presence_session_id and ps.ended_at is null and ps.expires_at > now()
    and ps.status in ('visible', 'discoverable', 'expiring');
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
$function$
;
commit;
