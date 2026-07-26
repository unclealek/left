# BestTime Integration Gap Analysis

Status:
- written on July 26, 2026
- compares the BestTime integration PDF against the current `leftApp` codebase

## What Exists Already

These pieces align with the PDF and can be reused:

- canonical venue storage in `public.venues`
- Google Place ID persistence via [0019_google_place_venue_mapping.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0019_google_place_venue_mapping.sql:1)
- DB-first venue matching with Google fallback in [venue-detection.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/venue-detection.ts:1)
- presence session lifecycle in [presence-service.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/presence/presence-service.ts:1)
- venue detail UI that already reserves a `Live Pulse` section in [VenueDetailScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueDetailScreen.tsx:1)

## What Is Partially Aligned

These areas exist but do not yet match the PDF requirements:

- venue discovery is currently done from the mobile client through Supabase and Google, not through Edge Functions
- Google Places is currently called from the app with `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`, which is client-exposed by design
- venue detail currently shows fabricated pulse text and placeholder counts rather than normalized BestTime activity
- presence uses `public.presence_sessions`, not the PDF's proposed `public.venue_presence` model
- there is no activity cache table, BestTime venue linking, or provider refresh locking

## Missing From The Current Codebase

No implementation was found for these PDF requirements:

- BestTime integration code
- BestTime database columns such as `besttime_venue_id`, `besttime_status`, `timezone`, `last_besttime_forecast_at`
- `public.venue_activity_cache`
- refresh-claim SQL function for duplicate-request prevention
- Edge Functions:
  - `nearby-venues`
  - `venue-activity`
  - `initialize-besttime-venue`
  - `refresh-besttime-activity`
  - `presence-start`
  - `presence-heartbeat`
  - `presence-end`
- normalized mobile activity model for BestTime data
- forecast/live cache expiry logic
- venue-local timezone handling for forecast-hour selection
- structured provider observability and retry handling
- automated tests for concurrency, cache expiry, timezone mapping, and stale-while-revalidate

## Highest-Risk Mismatches

These need to be resolved before a production BestTime rollout:

1. The PDF requires the mobile app to never call BestTime directly and to keep provider secrets in Supabase server-side secrets. The current architecture still performs venue discovery from the client and uses a client-exposed Google key.
2. The PDF requires separate `general venue activity` and `Left presence` signals. The current venue UI mixes real presence with placeholder pulse and usual-count copy.
3. The PDF requires stale-while-revalidate plus a DB refresh lock. There is no current cache or lock path for activity data.
4. The PDF requires venue-local timezone logic. The current venue model does not store a timezone.

## Recommended Build Order For This Repo

Implement in this order:

1. Add a migration that extends `public.venues` with BestTime fields and timezone storage.
2. Add `public.venue_activity_cache`.
3. Add the `claim_activity_refresh` SQL function and any helper indexes.
4. Add server-side BestTime and Google secrets to Supabase Edge Function configuration.
5. Create `initialize-besttime-venue` and `refresh-besttime-activity`.
6. Create `venue-activity` that returns one normalized Left activity object plus separate Left presence counts.
7. Move mobile venue discovery behind `nearby-venues`, or at minimum move Google lookup to server-side before adding BestTime.
8. Replace placeholder pulse copy on Home and Venue Detail with normalized backend activity fields.
9. Decide whether to keep `presence_sessions` as the presence source of truth or add a new `venue_presence` layer. Reusing `presence_sessions` is simpler if the response contract stays separated from BestTime activity.
10. Add tests for score mapping, comparison logic, hour-boundary expiry, unsupported venues, and concurrent refreshes.

## Practical Decision For Left

The PDF's `venue_presence` table is not required if Left keeps its existing presence model. The simpler path is:

- keep `presence_sessions` as the source of Left presence
- compute `leftPresence.total`, `leftPresence.visible`, and `leftPresence.openToMeet` from existing active presence data
- add BestTime as a separate activity subsystem instead of rewriting the presence subsystem first

## Current Verdict

The document is clear and usable as an implementation spec.

This repo is:

- already aligned on venue canonicalization and Left presence basics
- not yet started on the BestTime activity subsystem
- not yet aligned with the PDF's server-only provider architecture
