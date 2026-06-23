drop function if exists public.get_nearby_feed(uuid, uuid);

create function public.get_nearby_feed(
  p_viewer_user_id uuid,
  p_venue_id uuid
)
returns table (
  profile_user_id uuid,
  presence_session_id uuid,
  first_name text,
  avatar_style avatar_style,
  intent intent_type,
  hint_text text,
  primary_vibe text,
  session_duration_remaining interval,
  distance_bucket distance_bucket,
  venue_name text,
  energy_level energy_level,
  session_expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with viewer_session as (
    select aps.*
    from public.active_presence_sessions aps
    where aps.user_id = p_viewer_user_id
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
    inner join public.users u
      on u.id = aps.user_id
    inner join public.venues v
      on v.id = aps.venue_id
    inner join public.venue_context_summary vcs
      on vcs.venue_id = v.id
    cross join viewer_session vs
    where aps.venue_id = p_venue_id
      and aps.user_id <> p_viewer_user_id
      and not exists (
        select 1
        from public.hidden_users hu
        where hu.actor_user_id = p_viewer_user_id
          and hu.target_user_id = aps.user_id
      )
      and not exists (
        select 1
        from public.blocks b
        where (b.actor_user_id = p_viewer_user_id and b.target_user_id = aps.user_id)
           or (b.actor_user_id = aps.user_id and b.target_user_id = p_viewer_user_id)
      )
  )
  select
    c.profile_user_id,
    c.presence_session_id,
    c.first_name,
    c.avatar_style,
    c.intent,
    c.hint_text,
    c.primary_vibe,
    c.session_duration_remaining,
    c.distance_bucket,
    c.venue_name,
    c.energy_level,
    c.session_expires_at
  from candidates c
  order by
    c.intent_match_rank desc,
    c.vibe_overlap_rank desc,
    c.session_expires_at asc,
    c.first_name asc;
$$;

grant execute on function public.get_nearby_feed(uuid, uuid) to authenticated;
