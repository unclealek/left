-- Align presence with the twelve-vibe profile contract; retain all other guards.
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
  perform security_private.require_active_account();
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.consume_api_rate_limit('presence-start') then raise exception 'visibility start limit reached'; end if;
  if p_duration_minutes is null or p_duration_minutes not in (30, 60, 90, 120) then raise exception 'invalid session duration'; end if;
  if p_intent is null then raise exception 'invalid intent'; end if;
  if cardinality(coalesce(p_vibes, '{}'::text[])) > 12 then raise exception 'too many vibes'; end if;
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


-- Keep the venue catalog private; expose only the eligibility of a supplied ID.
create or replace function security_private.venue_accepts_proposals(p_venue_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select security_private.account_is_active() and exists (
 select 1 from public.venues where id=p_venue_id and is_active
) $$;
revoke all on function security_private.venue_accepts_proposals(uuid) from public, anon;
grant execute on function security_private.venue_accepts_proposals(uuid) to authenticated;

-- Hosting uses the signed-in identity; no admin credential belongs in the app.
create or replace function public.submit_experience_proposal(
  p_venue_id uuid, p_title text, p_description text, p_starts_at timestamptz,
  p_capacity integer, p_accessibility_notes text default '', p_cost_notes text default ''
) returns uuid
language plpgsql security invoker set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.users where id = auth.uid() and onboarding_completed) then
    raise exception 'complete your profile before hosting';
  end if;
  if not security_private.venue_accepts_proposals(p_venue_id) then
    raise exception 'choose an active venue';
  end if;
  if p_starts_at is null or p_starts_at <= now() then raise exception 'choose a future start time'; end if;
  insert into public.experiences(host_user_id, venue_id, title, description, starts_at, capacity, accessibility_notes, cost_notes, status)
  values(auth.uid(), p_venue_id, trim(p_title), trim(p_description), p_starts_at, p_capacity,
    trim(coalesce(p_accessibility_notes, '')), trim(coalesce(p_cost_notes, '')), 'pending_review')
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.submit_experience_proposal(uuid,text,text,timestamptz,integer,text,text) from public, anon;
grant execute on function public.submit_experience_proposal(uuid,text,text,timestamptz,integer,text,text) to authenticated;
