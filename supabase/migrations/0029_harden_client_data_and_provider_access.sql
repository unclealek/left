-- Keep raw presence and provider payloads server-only. Client access goes through
-- scoped RPCs and authenticated Edge Functions instead of directly readable views.

revoke all on public.active_presence_sessions from public, anon, authenticated;
revoke all on public.venue_context_summary from public, anon, authenticated;
revoke all on public.venue_activity_cache from public, anon, authenticated;
revoke all on function public.get_left_presence_counts(uuid[]) from public, anon, authenticated;

-- The shared catalog is write-only through the constrained community-venue RPC.
-- This lets a contribution appear immediately without trusting arbitrary client inserts.
drop policy if exists "authenticated users can insert venues" on public.venues;
revoke insert on public.venues from anon, authenticated;

-- Earlier client-created manual venues could contain free-form submission notes.
-- The approved venue record keeps its public fields; unreviewed source payload is removed.
update public.venues
set source_payload = '{}'::jsonb
where source = 'manual';

alter table public.venues
  add column if not exists community_added_by uuid references public.users(id) on delete set null,
  add column if not exists community_added_by_name text,
  add column if not exists community_notes text,
  add column if not exists community_photo_path text;

-- Photos are deliberately public because they describe a public venue. Uploads and
-- removal remain restricted to the contributor's own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-venue-photos',
  'community-venue-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users upload own community venue photos" on storage.objects;
create policy "users upload own community venue photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'community-venue-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users delete own community venue photos" on storage.objects;
create policy "users delete own community venue photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'community-venue-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Enforce that a caller can only request a feed for their own active session.
create or replace function public.get_nearby_feed(
  p_viewer_user_id uuid,
  p_venue_id uuid
)
returns table (
  profile_user_id uuid,
  presence_session_id uuid,
  first_name text,
  avatar_style avatar_style,
  interests text[],
  offering text,
  conversation_style text,
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
set search_path = public, pg_temp
as $$
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
    c.session_expires_at asc, c.first_name asc;
$$;

revoke all on function public.get_nearby_feed(uuid, uuid) from public, anon;
grant execute on function public.get_nearby_feed(uuid, uuid) to authenticated;

-- A visible user can read anonymous aggregate context for their current venue only.
create or replace function public.get_current_venue_context(p_venue_id uuid)
returns table (
  venue_id uuid,
  venue_name text,
  visible_count integer,
  energy_level energy_level,
  active_vibes text[],
  popular_intents intent_type[],
  pulse_copy text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
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
    );
$$;

revoke all on function public.get_current_venue_context(uuid) from public, anon;
grant execute on function public.get_current_venue_context(uuid) to authenticated;

-- Edge Functions use this fixed-policy counter before any provider-backed work.
-- The public signature deliberately accepts no caller-controlled limit or window.
create table if not exists public.api_request_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, endpoint)
);

alter table public.api_request_limits enable row level security;

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
    when 'venue-activity' then v_limit := 30; v_window_seconds := 600;
    when 'community-venue' then v_limit := 3; v_window_seconds := 86400;
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

-- Validate, de-duplicate, and create a community venue atomically. Client code never
-- receives direct INSERT rights on the catalog, and a contributor name is opt-in.
create or replace function public.create_community_venue(
  p_name text,
  p_type venue_type,
  p_address_text text,
  p_notes text,
  p_latitude double precision,
  p_longitude double precision,
  p_show_contributor boolean default true,
  p_photo_path text default null
)
returns table (venue_id uuid, venue_name text, created boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_first_name text;
  v_existing_id uuid;
  v_name text := trim(coalesce(p_name, ''));
  v_address text := trim(coalesce(p_address_text, ''));
  v_notes text := nullif(trim(coalesce(p_notes, '')), '');
  v_photo_path text := nullif(trim(coalesce(p_photo_path, '')), '');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if char_length(v_name) not between 2 and 120 then raise exception 'invalid venue name'; end if;
  if char_length(v_address) not between 3 and 220 then raise exception 'invalid venue address'; end if;
  if v_notes is not null and char_length(v_notes) > 500 then raise exception 'venue notes are too long'; end if;
  if v_photo_path is null then raise exception 'venue photo required'; end if;
  if p_latitude is null or p_longitude is null or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then
    raise exception 'invalid venue coordinates';
  end if;
  if not public.consume_api_rate_limit('community-venue') then raise exception 'venue contribution limit reached'; end if;
  if v_photo_path is not null and (
    v_photo_path !~ ('^' || v_user_id::text || '/')
    or not exists (
      select 1 from storage.objects
      where bucket_id = 'community-venue-photos' and name = v_photo_path
    )
  ) then raise exception 'invalid venue photo'; end if;

  select id into v_existing_id
  from public.venues v
  where v.is_active
    and public.normalize_venue_name(v.name) = public.normalize_venue_name(v_name)
    and public.venue_distance_meters(
      p_latitude, p_longitude,
      coalesce(v.latitude, (v.geofence_json -> 'center' ->> 'latitude')::double precision),
      coalesce(v.longitude, (v.geofence_json -> 'center' ->> 'longitude')::double precision)
    ) <= 75
  order by public.venue_distance_meters(
    p_latitude, p_longitude,
    coalesce(v.latitude, (v.geofence_json -> 'center' ->> 'latitude')::double precision),
    coalesce(v.longitude, (v.geofence_json -> 'center' ->> 'longitude')::double precision)
  )
  limit 1;

  if v_existing_id is not null then
    return query select v_existing_id, (select name from public.venues where id = v_existing_id), false;
    return;
  end if;

  select first_name into v_first_name from public.users where id = v_user_id;
  insert into public.venues (
    name, type, formatted_address, latitude, longitude, geofence_json, is_active,
    source, source_payload, community_added_by, community_added_by_name,
    community_notes, community_photo_path
  ) values (
    v_name, p_type, v_address, p_latitude, p_longitude,
    jsonb_build_object('center', jsonb_build_object('latitude', p_latitude, 'longitude', p_longitude), 'radius_meters', 60, 'source', 'community_added'),
    true, 'community_added', '{}'::jsonb, v_user_id,
    case when coalesce(p_show_contributor, true) then v_first_name else null end,
    v_notes, v_photo_path
  ) returning id into v_existing_id;

  insert into public.venue_submissions (
    submitted_by, name, type, address_text, notes, proposed_geofence_json, status, matched_venue_id
  ) values (
    v_user_id, v_name, p_type, v_address, v_notes,
    jsonb_build_object('center', jsonb_build_object('latitude', p_latitude, 'longitude', p_longitude), 'radius_meters', 60),
    'approved', v_existing_id
  );

  return query select v_existing_id, v_name, true;
end;
$$;

revoke all on function public.create_community_venue(text, venue_type, text, text, double precision, double precision, boolean, text) from public, anon;
grant execute on function public.create_community_venue(text, venue_type, text, text, double precision, double precision, boolean, text) to authenticated;
