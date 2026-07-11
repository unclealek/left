alter table public.venues
add column google_place_id text,
add column source text not null default 'manual',
add column source_payload jsonb,
add column last_verified_at timestamptz;

update public.venues
set source = coalesce(geofence_json ->> 'source', 'manual')
where source = 'manual';

create unique index venues_google_place_id_unique
on public.venues (google_place_id);
