-- Richer discovery profiles, private saved places, practical venue data,
-- and moderated small experiences.

alter table public.users
  add column if not exists interests text[] not null default '{}',
  add column if not exists offering text not null default '',
  add column if not exists social_rhythm text not null default '',
  add column if not exists conversation_style text not null default '';

alter table public.users
  add constraint users_interests_limit check (cardinality(interests) <= 8),
  add constraint users_offering_length check (char_length(offering) <= 220),
  add constraint users_social_rhythm_length check (char_length(social_rhythm) <= 80),
  add constraint users_conversation_style_length check (char_length(conversation_style) <= 120);

alter table public.venues
  add column if not exists website_uri text,
  add column if not exists phone_number text,
  add column if not exists rating real,
  add column if not exists user_rating_count integer,
  add column if not exists price_level text,
  add column if not exists business_status text,
  add column if not exists opening_hours jsonb,
  add column if not exists accessibility_options jsonb;

create table public.saved_venues (
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create index saved_venues_user_created_idx
  on public.saved_venues (user_id, created_at desc);

alter table public.saved_venues enable row level security;

create policy "users can manage own saved venues"
  on public.saved_venues for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, delete on public.saved_venues to authenticated;

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 90),
  description text not null check (char_length(trim(description)) between 20 and 1200),
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer not null check (capacity between 2 and 50),
  accessibility_notes text not null default '' check (char_length(accessibility_notes) <= 300),
  cost_notes text not null default '' check (char_length(cost_notes) <= 160),
  status text not null default 'pending_review'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'cancelled', 'completed')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  moderation_notes text check (moderation_notes is null or char_length(moderation_notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index experiences_published_start_idx
  on public.experiences (starts_at)
  where status = 'published';
create index experiences_host_created_idx
  on public.experiences (host_user_id, created_at desc);
create index experiences_venue_start_idx
  on public.experiences (venue_id, starts_at);

create trigger set_experiences_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

alter table public.experiences enable row level security;

create policy "authenticated users can read published experiences"
  on public.experiences for select
  to authenticated
  using (
    (
      status = 'published'
      and not exists (
        select 1
        from public.blocks b
        where (b.actor_user_id = auth.uid() and b.target_user_id = host_user_id)
           or (b.actor_user_id = host_user_id and b.target_user_id = auth.uid())
      )
      and not exists (
        select 1
        from public.hidden_users hu
        where hu.actor_user_id = auth.uid()
          and hu.target_user_id = host_user_id
      )
    )
    or host_user_id = auth.uid()
    or public.is_admin_reviewer(auth.uid())
  );

create policy "users can submit own experiences"
  on public.experiences for insert
  to authenticated
  with check (
    host_user_id = auth.uid()
    and status in ('draft', 'pending_review')
  );

create policy "hosts can revise unpublished experiences"
  on public.experiences for update
  to authenticated
  using (host_user_id = auth.uid())
  with check (
    host_user_id = auth.uid()
    and status in ('draft', 'pending_review', 'cancelled')
  );

create policy "reviewers can manage experiences"
  on public.experiences for all
  to authenticated
  using (public.is_admin_reviewer(auth.uid()))
  with check (public.is_admin_reviewer(auth.uid()));

grant select, insert, update on public.experiences to authenticated;

create or replace function public.review_experience(
  p_experience_id uuid,
  p_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
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
$$;

revoke all on function public.review_experience(uuid, text, text) from public, anon;
grant execute on function public.review_experience(uuid, text, text) to authenticated;

create table public.experience_attendees (
  experience_id uuid not null references public.experiences(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (experience_id, user_id)
);

create index experience_attendees_user_created_idx
  on public.experience_attendees (user_id, created_at desc);

alter table public.experience_attendees enable row level security;

create policy "users and hosts can read relevant attendance"
  on public.experience_attendees for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.experiences e
      where e.id = experience_id
        and e.host_user_id = auth.uid()
    )
    or public.is_admin_reviewer(auth.uid())
  );

grant select on public.experience_attendees to authenticated;

create or replace function public.set_experience_attendance(
  p_experience_id uuid,
  p_attending boolean
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  experience_row public.experiences%rowtype;
  attendee_count integer;
begin
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
$$;

revoke all on function public.set_experience_attendance(uuid, boolean) from public;
grant execute on function public.set_experience_attendance(uuid, boolean) to authenticated;

create or replace function public.get_published_experiences(
  p_venue_ids uuid[] default null
)
returns table (
  id uuid,
  host_user_id uuid,
  host_first_name text,
  venue_id uuid,
  venue_name text,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  attendee_count integer,
  viewer_attending boolean,
  accessibility_notes text,
  cost_notes text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
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
  order by e.starts_at asc;
$$;

revoke all on function public.get_published_experiences(uuid[]) from public;
grant execute on function public.get_published_experiences(uuid[]) to authenticated;

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
  order by
    c.intent_match_rank desc,
    c.vibe_overlap_rank desc,
    c.session_expires_at asc,
    c.first_name asc;
$$;

grant execute on function public.get_nearby_feed(uuid, uuid) to authenticated;

-- Keep identity removal complete as the profile and discovery model grows.
-- Safety records and existing policy-approved history remain intact, while
-- newly introduced profile text and private discovery choices are removed.
create or replace function public.process_identity_removal_request(
  p_request_id uuid,
  p_requesting_user_id uuid default null
)
returns public.identity_removal_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.identity_removal_requests%rowtype;
  v_redacted_email text;
begin
  select *
  into v_request
  from public.identity_removal_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'identity removal request not found';
  end if;

  if p_requesting_user_id is not null and v_request.user_id <> p_requesting_user_id then
    raise exception 'identity removal request does not belong to requesting user';
  end if;

  if v_request.status not in ('pending', 'processing') then
    raise exception 'identity removal request is not processable from status %', v_request.status;
  end if;

  update public.identity_removal_requests
  set status = 'processing',
      failure_reason = null,
      processing_notes = 'Removing direct identity fields and private discovery choices while retaining policy-approved records.'
  where id = v_request.id;

  v_redacted_email := 'identity-removed+' || replace(v_request.id::text, '-', '') || '@left.invalid';

  delete from public.saved_venues
  where user_id = v_request.profile_user_id;

  delete from public.experience_attendees
  where user_id = v_request.profile_user_id;

  delete from public.experiences
  where host_user_id = v_request.profile_user_id;

  update public.users
  set first_name = 'Removed User',
      provider_subject = 'identity-removed-' || id::text,
      interests = '{}'::text[],
      offering = '',
      social_rhythm = '',
      conversation_style = '',
      identity_removed = true,
      updated_at = now()
  where id = v_request.profile_user_id;

  update auth.users
  set email = v_redacted_email,
      phone = null,
      raw_user_meta_data = '{}'::jsonb,
      raw_app_meta_data = jsonb_build_object('identity_removed', true),
      updated_at = now()
  where id = v_request.user_id;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'identities' and column_name = 'user_id'
  ) then
    execute 'delete from auth.identities where user_id = $1' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'mfa_amr_claims' and column_name = 'session_id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'user_id'
  ) then
    execute '
      delete from auth.mfa_amr_claims as amr
      using auth.sessions as auth_session
      where amr.session_id = auth_session.id
        and auth_session.user_id = $1
    ' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'user_id'
  ) then
    execute 'delete from auth.sessions where user_id = $1' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'refresh_tokens' and column_name = 'user_id'
  ) then
    execute 'delete from auth.refresh_tokens where user_id = $1' using v_request.user_id::text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'one_time_tokens' and column_name = 'user_id'
  ) then
    execute 'delete from auth.one_time_tokens where user_id = $1' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'mfa_factors' and column_name = 'user_id'
  ) then
    execute 'delete from auth.mfa_factors where user_id = $1' using v_request.user_id;
  end if;

  update public.identity_removal_requests
  set status = 'completed',
      processed_at = now(),
      failure_reason = null,
      contact_email = v_redacted_email,
      contact_name = null,
      processing_notes = 'Completed identity removal. Direct identity fields and private discovery choices were removed; hints, venue history, and safety zones were retained per policy.'
  where id = v_request.id;

  return (
    select irr
    from public.identity_removal_requests irr
    where irr.id = v_request.id
  );
exception
  when others then
    update public.identity_removal_requests
    set status = 'rejected',
        processed_at = now(),
        failure_reason = sqlerrm,
        processing_notes = 'Identity removal failed during backend processing.'
    where id = p_request_id;
    raise;
end;
$$;

revoke all on function public.process_identity_removal_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.process_identity_removal_request(uuid, uuid) to service_role;

comment on table public.saved_venues is
  'Private, user-owned venue bookmarks synced across devices.';
comment on table public.experiences is
  'Venue-based small gatherings. User submissions require review before publication.';
