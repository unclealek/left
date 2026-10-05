-- Pending explicit migration approval. Deploy the presence-only venue-activity function first.
-- Removes only the obsolete provider cache/columns; preserve generic venue timezone/address fields.
begin;
drop function if exists public.claim_activity_refresh(uuid);
drop table if exists public.venue_activity_cache;
alter table public.venues
  drop column if exists besttime_venue_id,
  drop column if exists besttime_status,
  drop column if exists last_besttime_forecast_at;
commit;
