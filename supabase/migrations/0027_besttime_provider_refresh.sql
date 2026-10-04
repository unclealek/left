begin;
alter table public.venue_activity_cache
  add column if not exists forecast_retry_at timestamptz,
  add column if not exists live_retry_at timestamptz;

-- Refresh ownership and cache writes belong to the backend only.
revoke execute on function public.claim_activity_refresh(uuid) from public, anon, authenticated;
grant execute on function public.claim_activity_refresh(uuid) to service_role;
alter table public.venue_activity_cache enable row level security;
drop policy if exists venue_activity_cache_read on public.venue_activity_cache;
create policy venue_activity_cache_read on public.venue_activity_cache for select to authenticated using (true);
-- Remove only the legacy mock forecasts and their synthetic IDs.
update public.venue_activity_cache c set raw_forecast = null, forecast_score = null,
  raw_live = null, live_score = null, live_available = false,
  forecast_expires_at = null, live_expires_at = null, forecast_fetched_at = null,
  live_fetched_at = null, forecast_retry_at = null, live_retry_at = null,
  refresh_status = 'idle', refresh_started_at = null, last_error = null
from public.venues v where c.venue_id = v.id
  and (v.besttime_venue_id like 'ChIJ%:%' or v.besttime_venue_id like 'mock:%');
update public.venues set besttime_venue_id = null, besttime_status = 'not_initialized',
  last_besttime_forecast_at = null
where besttime_venue_id like 'ChIJ%:%' or besttime_venue_id like 'mock:%';
commit;
