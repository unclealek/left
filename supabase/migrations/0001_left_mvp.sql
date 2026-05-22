-- Left MVP schema
-- Canonical discovery surface: nearby feed
-- Target: Supabase Postgres

create extension if not exists "pgcrypto";

create type auth_provider as enum ('google', 'apple');
create type intent_type as enum (
  'networking',
  'open_to_conversation',
  'group_discussion',
  'casual_chat'
);
create type presence_status as enum (
  'activating',
  'visible',
  'discoverable',
  'expiring',
  'paused',
  'session_ended'
);
create type prompt_state as enum (
  'none',
  'prompt_eligible',
  'prompted',
  'accepted',
  'dismissed'
);
create type wave_status as enum (
  'sent',
  'seen',
  'reciprocated',
  'expired',
  'cancelled'
);
create type approach_status as enum (
  'started',
  'confirmed_going',
  'connected',
  'expired',
  'cancelled'
);
create type contact_exchange_decision as enum (
  'share_my_number',
  'skip'
);
create type report_category as enum (
  'harassment',
  'impersonation',
  'unsafe_behavior',
  'spam',
  'other'
);
create type venue_type as enum (
  'cafe',
  'library',
  'coworking_space',
  'airport',
  'gym',
  'university',
  'other'
);
create type distance_bucket as enum (
  'same_area',
  'nearby',
  'within_venue'
);
create type energy_level as enum (
  'quiet',
  'warm',
  'high'
);
create type avatar_style as enum (
  'geometric',
  'abstract',
  'minimal',
  'soft'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  auth_provider auth_provider not null,
  provider_subject text not null unique,
  first_name text not null check (char_length(trim(first_name)) between 1 and 40),
  avatar_style avatar_style not null,
  default_intent intent_type,
  default_vibes text[] not null default '{}' check (cardinality(default_vibes) <= 2),
  focus_mode_enabled boolean not null default false,
  prompts_enabled boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type venue_type not null default 'other',
  city text,
  geofence_json jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.presence_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete restrict,
  intent intent_type not null,
  vibes text[] not null,
  hint_text text check (hint_text is null or char_length(trim(hint_text)) between 1 and 80),
  status presence_status not null default 'activating',
  prompt_state prompt_state not null default 'none',
  started_at timestamptz not null,
  expires_at timestamptz not null,
  paused_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > started_at)
);

create unique index presence_sessions_one_active_per_user_idx
on public.presence_sessions (user_id)
where ended_at is null and status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');

create index presence_sessions_venue_active_idx
on public.presence_sessions (venue_id, expires_at desc)
where ended_at is null;

create table public.prompt_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  reason text not null,
  accepted boolean,
  created_at timestamptz not null default now()
);

create index prompt_events_user_venue_day_idx
on public.prompt_events (user_id, venue_id, triggered_at desc);

create table public.waves (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  presence_session_id uuid not null references public.presence_sessions(id) on delete cascade,
  status wave_status not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

create index waves_to_user_status_idx on public.waves (to_user_id, status, created_at desc);
create index waves_from_user_status_idx on public.waves (from_user_id, status, created_at desc);
create unique index waves_one_per_person_per_session_idx
on public.waves (from_user_id, to_user_id, presence_session_id);

create table public.approach_attempts (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  presence_session_id uuid not null references public.presence_sessions(id) on delete cascade,
  status approach_status not null default 'started',
  started_at timestamptz not null,
  expires_at timestamptz not null,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id),
  check (expires_at > started_at)
);

create index approach_attempts_from_user_status_idx
on public.approach_attempts (from_user_id, status, created_at desc);

create table public.contact_exchange_intents (
  id uuid primary key default gen_random_uuid(),
  approach_attempt_id uuid not null references public.approach_attempts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  decision contact_exchange_decision not null,
  created_at timestamptz not null default now(),
  unique (approach_attempt_id, user_id)
);

create table public.hidden_users (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (actor_user_id, target_user_id),
  check (actor_user_id <> target_user_id)
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (actor_user_id, target_user_id),
  check (actor_user_id <> target_user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  presence_session_id uuid references public.presence_sessions(id) on delete set null,
  category report_category not null,
  notes text,
  created_at timestamptz not null default now(),
  check (actor_user_id <> target_user_id)
);

create table public.safety_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  geofence_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index safety_zones_user_idx on public.safety_zones (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger set_presence_sessions_updated_at
before update on public.presence_sessions
for each row execute function public.set_updated_at();

create trigger set_waves_updated_at
before update on public.waves
for each row execute function public.set_updated_at();

create trigger set_approach_attempts_updated_at
before update on public.approach_attempts
for each row execute function public.set_updated_at();

create trigger set_safety_zones_updated_at
before update on public.safety_zones
for each row execute function public.set_updated_at();

create or replace function public.compute_shared_alignment(
  viewer_intent intent_type,
  viewer_vibes text[],
  target_intent intent_type,
  target_vibes text[]
)
returns text
language sql
stable
as $$
  select
    case
      when viewer_intent = target_intent then 'You both selected ' || replace(viewer_intent::text, '_', ' ')
      when exists (
        select 1
        from unnest(coalesce(viewer_vibes, '{}')) as vv
        inner join unnest(coalesce(target_vibes, '{}')) as tv
          on vv = tv
      ) then 'You both selected ' || (
        select vv
        from unnest(coalesce(viewer_vibes, '{}')) as vv
        inner join unnest(coalesce(target_vibes, '{}')) as tv
          on vv = tv
        limit 1
      )
      else null
    end;
$$;

create or replace function public.derive_energy_level(visible_count integer)
returns energy_level
language sql
immutable
as $$
  select case
    when visible_count >= 6 then 'high'::energy_level
    when visible_count >= 2 then 'warm'::energy_level
    else 'quiet'::energy_level
  end;
$$;

create or replace view public.active_presence_sessions as
select ps.*
from public.presence_sessions ps
where ps.ended_at is null
  and ps.expires_at > now()
  and ps.status in ('visible', 'discoverable', 'expiring');

create or replace view public.venue_context_summary as
with recent_venue_activity as (
  select
    ps.venue_id,
    count(*)::int as recent_session_count
  from public.presence_sessions ps
  where ps.started_at >= now() - interval '7 days'
  group by ps.venue_id
)
select
  v.id as venue_id,
  v.name as venue_name,
  count(aps.id)::int as visible_count,
  public.derive_energy_level(count(aps.id)::int) as energy_level,
  coalesce(array_agg(distinct aps.intent) filter (where aps.intent is not null), '{}') as popular_intents,
  coalesce(array_agg(distinct vibe.v) filter (where vibe.v is not null), '{}') as active_vibes,
  case
    when count(aps.id) = 0 and coalesce(rva.recent_session_count, 0) >= 1 then 'Quiet here today — be the first to open up.'
    when count(aps.id) = 0 and coalesce(rva.recent_session_count, 0) = 0 then null
    when count(aps.id) = 1 then '1 person is active nearby right now.'
    when count(aps.id) < 3 then count(aps.id)::text || ' people are active nearby right now.'
    else count(aps.id)::text || ' people are visible nearby.'
  end as pulse_copy
from public.venues v
left join public.active_presence_sessions aps
  on aps.venue_id = v.id
left join lateral unnest(aps.vibes) as vibe(v)
  on true
left join recent_venue_activity rva
  on rva.venue_id = v.id
group by v.id, v.name, rva.recent_session_count;

create or replace function public.get_nearby_feed(
  p_viewer_user_id uuid,
  p_venue_id uuid
)
returns table (
  profile_user_id uuid,
  presence_session_id uuid,
  first_name text,
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

-- Row-level security
alter table public.users enable row level security;
alter table public.venues enable row level security;
alter table public.presence_sessions enable row level security;
alter table public.prompt_events enable row level security;
alter table public.waves enable row level security;
alter table public.approach_attempts enable row level security;
alter table public.hidden_users enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.safety_zones enable row level security;
alter table public.contact_exchange_intents enable row level security;

create policy "users can read own profile"
on public.users for select
using (auth.uid() = id);

create policy "users can update own profile"
on public.users for update
using (auth.uid() = id);

create policy "users can insert own profile"
on public.users for insert
with check (auth.uid() = id);

create policy "venues readable by authenticated users"
on public.venues for select
using (auth.role() = 'authenticated');

create policy "users can read own sessions"
on public.presence_sessions for select
using (auth.uid() = user_id);

create policy "users can insert own sessions"
on public.presence_sessions for insert
with check (auth.uid() = user_id);

create policy "users can update own sessions"
on public.presence_sessions for update
using (auth.uid() = user_id);

create policy "users can read own prompt events"
on public.prompt_events for select
using (auth.uid() = user_id);

create policy "users can insert own prompt events"
on public.prompt_events for insert
with check (auth.uid() = user_id);

create policy "wave participants can read waves"
on public.waves for select
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "users can send waves"
on public.waves for insert
with check (auth.uid() = from_user_id);

create policy "wave sender can update own waves"
on public.waves for update
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "approach participants can read attempts"
on public.approach_attempts for select
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "users can create approach attempts"
on public.approach_attempts for insert
with check (auth.uid() = from_user_id);

create policy "approach participants can update attempts"
on public.approach_attempts for update
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "users can manage hidden users"
on public.hidden_users for all
using (auth.uid() = actor_user_id)
with check (auth.uid() = actor_user_id);

create policy "users can manage blocks"
on public.blocks for all
using (auth.uid() = actor_user_id)
with check (auth.uid() = actor_user_id);

create policy "users can create and read own reports"
on public.reports for select
using (auth.uid() = actor_user_id);

create policy "users can insert own reports"
on public.reports for insert
with check (auth.uid() = actor_user_id);

create policy "users can manage own safety zones"
on public.safety_zones for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "approach participants can read contact exchange intents"
on public.contact_exchange_intents for select
using (
  exists (
    select 1
    from public.approach_attempts aa
    where aa.id = approach_attempt_id
      and (aa.from_user_id = auth.uid() or aa.to_user_id = auth.uid())
  )
);

create policy "approach participants can insert own contact exchange intent"
on public.contact_exchange_intents for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.approach_attempts aa
    where aa.id = approach_attempt_id
      and (aa.from_user_id = auth.uid() or aa.to_user_id = auth.uid())
  )
);

grant select on public.active_presence_sessions to authenticated;
grant select on public.venue_context_summary to authenticated;
grant execute on function public.get_nearby_feed(uuid, uuid) to authenticated;
