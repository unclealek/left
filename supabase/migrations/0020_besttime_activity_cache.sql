alter table public.venues
add column if not exists besttime_venue_id text,
add column if not exists besttime_status text not null default 'not_initialized',
add column if not exists timezone text,
add column if not exists formatted_address text,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists primary_type text,
add column if not exists google_types text[],
add column if not exists google_photo_name text,
add column if not exists google_photo_attribution jsonb,
add column if not exists last_google_sync_at timestamptz,
add column if not exists last_besttime_forecast_at timestamptz;

update public.venues
set
  latitude = coalesce(latitude, nullif(geofence_json -> 'center' ->> 'latitude', '')::double precision),
  longitude = coalesce(longitude, nullif(geofence_json -> 'center' ->> 'longitude', '')::double precision)
where latitude is null
   or longitude is null;

alter table public.venues
drop constraint if exists venues_besttime_status_check;

alter table public.venues
add constraint venues_besttime_status_check
check (
  besttime_status in (
    'not_initialized',
    'available',
    'unavailable',
    'failed'
  )
);

create unique index if not exists venues_besttime_venue_id_unique
on public.venues (besttime_venue_id)
where besttime_venue_id is not null;

create index if not exists venues_besttime_status_idx
on public.venues (besttime_status);

create table if not exists public.venue_activity_cache (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  forecast_score integer check (forecast_score between 0 and 100),
  live_score integer check (live_score between 0 and 100),
  live_available boolean not null default false,
  intensity_label text,
  comparison text,
  raw_forecast jsonb,
  raw_live jsonb,
  forecast_fetched_at timestamptz,
  forecast_expires_at timestamptz,
  live_fetched_at timestamptz,
  live_expires_at timestamptz,
  refresh_status text not null default 'idle' check (
    refresh_status in (
      'idle',
      'refreshing',
      'failed'
    )
  ),
  refresh_started_at timestamptz,
  last_error text,
  consecutive_failures integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venue_activity_cache_live_expires_idx
on public.venue_activity_cache (live_expires_at);

create index if not exists venue_activity_cache_refresh_status_idx
on public.venue_activity_cache (refresh_status, refresh_started_at);

drop trigger if exists set_venue_activity_cache_updated_at on public.venue_activity_cache;

create trigger set_venue_activity_cache_updated_at
before update on public.venue_activity_cache
for each row execute function public.set_updated_at();

create or replace function public.claim_activity_refresh(
  target_venue_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_count integer;
begin
  update public.venue_activity_cache
  set
    refresh_status = 'refreshing',
    refresh_started_at = now(),
    updated_at = now()
  where venue_id = target_venue_id
    and (
      refresh_status <> 'refreshing'
      or refresh_started_at is null
      or refresh_started_at < now() - interval '2 minutes'
    );

  get diagnostics claimed_count = row_count;
  return claimed_count > 0;
end;
$$;

create or replace function public.get_left_presence_counts(
  p_venue_ids uuid[]
)
returns table (
  venue_id uuid,
  total integer,
  visible integer,
  open_to_meet integer
)
language sql
stable
security definer
set search_path = public
as $$
  with requested_venues as (
    select unnest(p_venue_ids) as venue_id
  )
  select
    rv.venue_id,
    count(aps.id)::int as total,
    count(aps.id)::int as visible,
    count(*) filter (
      where aps.intent in ('networking', 'open_to_conversation')
    )::int as open_to_meet
  from requested_venues rv
  left join public.active_presence_sessions aps
    on aps.venue_id = rv.venue_id
  group by rv.venue_id;
$$;

grant select on public.venue_activity_cache to authenticated;
grant execute on function public.claim_activity_refresh(uuid) to authenticated;
grant execute on function public.get_left_presence_counts(uuid[]) to authenticated;
