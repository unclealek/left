begin;

create schema if not exists security_private;
revoke all on schema security_private from public, anon;
grant usage on schema security_private to authenticated, service_role;

-- Consult authoritative server state, never the possibly stale JWT metadata.
create function security_private.account_is_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u where u.id = auth.uid()
      and coalesce(u.raw_app_meta_data ->> 'identity_removed', 'false') <> 'true'
  );
$$;
revoke all on function security_private.account_is_active() from public, anon;
grant execute on function security_private.account_is_active() to authenticated, service_role;

create function security_private.require_active_account() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not security_private.account_is_active() then
    raise exception 'active account required' using errcode = '42501';
  end if;
end;
$$;
revoke all on function security_private.require_active_account() from public, anon;
grant execute on function security_private.require_active_account() to authenticated, service_role;

-- Explicit application policy targets; no managed Storage tables except objects.
create policy active_account_required on public.admin_reviewers as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.approach_attempts as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.blocks as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.contact_exchange_intents as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.experience_attendees as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.experiences as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.hidden_users as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.identity_removal_requests as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.legal_acceptances as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.legal_document_versions as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.presence_sessions as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.prompt_events as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.reports as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.safety_zones as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.saved_venues as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.social_interaction_events as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.users as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.venue_popular_times as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.venue_preferences as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.venue_submissions as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.venues as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on public.waves as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

create policy active_account_required on storage.objects as restrictive for all to authenticated
using ((select security_private.account_is_active())) with check ((select security_private.account_is_active()));

-- Explicit replacements of the 14 reviewed client RPCs.
CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(p_endpoint text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_window_seconds integer;
  v_count integer;
begin
  perform security_private.require_active_account();
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
$function$
;

CREATE OR REPLACE FUNCTION public.end_presence_session(p_session_id uuid, p_status presence_status)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  perform security_private.require_active_account();
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
  perform security_private.require_active_account();
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

CREATE OR REPLACE FUNCTION public.get_current_venue_context(p_venue_id uuid)
 RETURNS TABLE(venue_id uuid, venue_name text, visible_count integer, energy_level energy_level, active_vibes text[], popular_intents intent_type[], pulse_copy text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$select guarded_result.* from (
  select
    vcs.venue_id,
    vcs.venue_name,
    vcs.visible_count,
    vcs.energy_level,
    vcs.active_vibes,
    vcs.popular_intents,
    vcs.pulse_copy
  from public.venue_context_summary vcs
  where vcs.venue_id = p_venue_id
    and exists (
      select 1
      from public.active_presence_sessions aps
      where aps.user_id = auth.uid()
        and aps.venue_id = p_venue_id
    )) guarded_result where security_private.account_is_active()$function$
;

CREATE OR REPLACE FUNCTION public.get_nearby_feed(p_viewer_user_id uuid, p_venue_id uuid)
 RETURNS TABLE(profile_user_id uuid, presence_session_id uuid, first_name text, avatar_style avatar_style, interests text[], offering text, conversation_style text, intent intent_type, hint_text text, primary_vibe text, session_duration_remaining interval, distance_bucket distance_bucket, venue_name text, energy_level energy_level, session_expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$select guarded_result.* from (
  with viewer_session as (
    select aps.*
    from public.active_presence_sessions aps
    where auth.uid() = p_viewer_user_id
      and aps.user_id = p_viewer_user_id
      and aps.venue_id = p_venue_id
    order by aps.started_at desc
    limit 1
  ),
  candidates as (
    select
      aps.user_id as profile_user_id,
      aps.id as presence_session_id,
      u.first_name,
      u.avatar_style,
      u.interests,
      u.offering,
      u.conversation_style,
      aps.intent,
      aps.hint_text,
      coalesce(aps.vibes[1], null) as primary_vibe,
      greatest(aps.expires_at - now(), interval '0 second') as session_duration_remaining,
      'within_venue'::distance_bucket as distance_bucket,
      v.name as venue_name,
      vcs.energy_level,
      aps.expires_at as session_expires_at,
      case when vs.intent = aps.intent then 1 else 0 end as intent_match_rank,
      (
        select count(*)
        from unnest(coalesce(vs.vibes, '{}')) as vv
        inner join unnest(coalesce(aps.vibes, '{}')) as tv on vv = tv
      ) as vibe_overlap_rank
    from public.active_presence_sessions aps
    inner join public.users u on u.id = aps.user_id
    inner join public.venues v on v.id = aps.venue_id
    inner join public.venue_context_summary vcs on vcs.venue_id = v.id
    cross join viewer_session vs
    where aps.venue_id = p_venue_id
      and aps.user_id <> p_viewer_user_id
      and not exists (
        select 1 from public.hidden_users hu
        where hu.actor_user_id = p_viewer_user_id
          and hu.target_user_id = aps.user_id
      )
      and not exists (
        select 1 from public.blocks b
        where (b.actor_user_id = p_viewer_user_id and b.target_user_id = aps.user_id)
           or (b.actor_user_id = aps.user_id and b.target_user_id = p_viewer_user_id)
      )
  )
  select
    c.profile_user_id,
    c.presence_session_id,
    c.first_name,
    c.avatar_style,
    c.interests,
    c.offering,
    c.conversation_style,
    c.intent,
    c.hint_text,
    c.primary_vibe,
    c.session_duration_remaining,
    c.distance_bucket,
    c.venue_name,
    c.energy_level,
    c.session_expires_at
  from candidates c
  order by c.intent_match_rank desc, c.vibe_overlap_rank desc,
    c.session_expires_at asc, c.first_name asc) guarded_result where security_private.account_is_active()$function$
;

CREATE OR REPLACE FUNCTION public.get_published_experiences(p_venue_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(id uuid, host_user_id uuid, host_first_name text, venue_id uuid, venue_name text, title text, description text, starts_at timestamp with time zone, ends_at timestamp with time zone, capacity integer, attendee_count integer, viewer_attending boolean, accessibility_notes text, cost_notes text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$select guarded_result.* from (
  select
    e.id,
    e.host_user_id,
    u.first_name as host_first_name,
    e.venue_id,
    v.name as venue_name,
    e.title,
    e.description,
    e.starts_at,
    e.ends_at,
    e.capacity,
    count(ea.user_id)::integer as attendee_count,
    coalesce(bool_or(ea.user_id = auth.uid()), false) as viewer_attending,
    e.accessibility_notes,
    e.cost_notes
  from public.experiences e
  inner join public.users u on u.id = e.host_user_id
  inner join public.venues v on v.id = e.venue_id
  left join public.experience_attendees ea on ea.experience_id = e.id
  where auth.uid() is not null
    and e.status = 'published'
    and e.starts_at > now()
    and not exists (
      select 1
      from public.blocks b
      where (b.actor_user_id = auth.uid() and b.target_user_id = e.host_user_id)
         or (b.actor_user_id = e.host_user_id and b.target_user_id = auth.uid())
    )
    and not exists (
      select 1
      from public.hidden_users hu
      where hu.actor_user_id = auth.uid()
        and hu.target_user_id = e.host_user_id
    )
    and (
      p_venue_ids is null
      or cardinality(p_venue_ids) = 0
      or e.venue_id = any(p_venue_ids)
    )
  group by e.id, u.first_name, v.name
  order by e.starts_at asc) guarded_result where security_private.account_is_active()$function$
;

CREATE OR REPLACE FUNCTION public.get_saved_venues()
 RETURNS TABLE(venue_id uuid, venue_name text, venue_type venue_type, formatted_address text, saved_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$select guarded_result.* from (
  select sv.venue_id, v.name, v.type, v.formatted_address, sv.created_at
  from public.saved_venues sv
  join public.venues v on v.id = sv.venue_id
  where sv.user_id = auth.uid()
  order by sv.created_at desc) guarded_result where security_private.account_is_active()$function$
;

CREATE OR REPLACE FUNCTION public.record_current_legal_acceptance(expected_terms_version text, expected_privacy_version text, expected_community_version text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  matching_document_count integer;
begin
  perform security_private.require_active_account();
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select count(*)
    into matching_document_count
    from public.legal_document_versions
   where active
     and (
       (document_id = 'terms' and version = expected_terms_version)
       or (document_id = 'privacy' and version = expected_privacy_version)
       or (document_id = 'community' and version = expected_community_version)
     );

  if matching_document_count <> 3 then
    raise exception 'legal document versions are not current';
  end if;

  insert into public.legal_acceptances (user_id, document_id, document_version)
  values
    (auth.uid(), 'terms', expected_terms_version),
    (auth.uid(), 'privacy', expected_privacy_version),
    (auth.uid(), 'community', expected_community_version)
  on conflict do nothing;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.record_social_interaction_event(p_event_type social_interaction_event_type, p_target_user_id uuid DEFAULT NULL::uuid, p_visibility_session_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_venue_id uuid;
begin
  perform security_private.require_active_account();
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
$function$
;

CREATE OR REPLACE FUNCTION public.review_experience(p_experience_id uuid, p_status text, p_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  perform security_private.require_active_account();
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review experiences';
  end if;

  if p_status not in ('published', 'rejected') then
    raise exception 'invalid review status';
  end if;

  update public.experiences
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      moderation_notes = nullif(trim(p_notes), '')
  where id = p_experience_id
    and status = 'pending_review'
    and (p_status = 'rejected' or starts_at > now());

  if not found then
    raise exception 'pending experience not found or no longer publishable';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.review_safety_report(report_id uuid, next_status safety_report_status, notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_report_id alias for $1;
  v_next_status alias for $2;
  v_notes alias for $3;
begin
  perform security_private.require_active_account();
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review safety reports';
  end if;

  update public.reports as target_report
  set status = v_next_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      moderation_notes = nullif(trim(v_notes), '')
  where target_report.id = v_report_id;

  if not found then
    raise exception 'safety report % not found', v_report_id;
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_experience_attendance(p_experience_id uuid, p_attending boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  experience_row public.experiences%rowtype;
  attendee_count integer;
begin
  perform security_private.require_active_account();
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select *
    into experience_row
    from public.experiences
   where id = p_experience_id
   for update;

  if not found or experience_row.status <> 'published' or experience_row.starts_at <= now() then
    raise exception 'experience is not available';
  end if;

  if exists (
    select 1
    from public.blocks b
    where (b.actor_user_id = auth.uid() and b.target_user_id = experience_row.host_user_id)
       or (b.actor_user_id = experience_row.host_user_id and b.target_user_id = auth.uid())
  ) or exists (
    select 1
    from public.hidden_users hu
    where hu.actor_user_id = auth.uid()
      and hu.target_user_id = experience_row.host_user_id
  ) then
    raise exception 'experience is not available';
  end if;

  if not p_attending then
    delete from public.experience_attendees
     where experience_id = p_experience_id
       and user_id = auth.uid();
    return false;
  end if;

  if exists (
    select 1 from public.experience_attendees
     where experience_id = p_experience_id
       and user_id = auth.uid()
  ) then
    return true;
  end if;

  select count(*)::integer
    into attendee_count
    from public.experience_attendees
   where experience_id = p_experience_id;

  if attendee_count >= experience_row.capacity then
    raise exception 'experience is full';
  end if;

  insert into public.experience_attendees (experience_id, user_id)
  values (p_experience_id, auth.uid());

  return true;
end;
$function$
;

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
  perform security_private.require_active_account();
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

create function security_private.protect_removal_state() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') and
     (new.identity_removed or (tg_op='UPDATE' and old.identity_removed is distinct from new.identity_removed)) then
    raise exception 'identity removal state is server managed' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function security_private.protect_removal_state() from public, anon, authenticated;
create trigger protect_removal_state before insert or update on public.users
for each row execute function security_private.protect_removal_state();

-- Execute in the same transaction as the existing removal routine.
create function security_private.close_removed_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.identity_removed and not old.identity_removed then
    update public.presence_sessions set status='session_ended', ended_at=now(), hint_text=null
      where user_id=new.id and ended_at is null;
    update public.users set profile_prompt='Removed', approach_prompt='Removed', default_vibes='{}', default_intent=null
      where id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function security_private.close_removed_account() from public, anon, authenticated;
create trigger close_removed_account after update of identity_removed on public.users
for each row execute function security_private.close_removed_account();

-- No updates to existing account or presence rows. Future removals use the trigger.
commit;
