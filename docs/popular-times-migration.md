# Popular times integration

> Deployment update: the approved migrations and functions are now deployed to development. See [deployment verification](popular-times-deployment.md) for current state and remaining checks. The review below records the pre-deployment assessment.

Updated October 5, 2026. BestTime runtime code and rollback flags have been removed at the user's request. Historical migrations and archived design documents remain as migration history.

## Current state

- Migration 0032 is applied in development (`xrracivlxgedlzdcrfwx`): shared Place-ID cache, RLS, Realtime and lease-based claims.
- Development's `venue-activity` now serves first-party presence only. The two legacy BestTime Edge Functions and all four BestTime Supabase secrets were removed October 5.
- `APIFY_TOKEN` is not configured in development, and `get-popular-times` has not been deployed. The new scraper is not live yet.
- Migration 0033 (shared actor-run budget) 0034 (obsolete schema removal), and 20261004220526 (per-user trigger quota) are prepared but **not applied**. They require approval before execution.
- No production backend or app release was deployed by this work.

## Consumer inventory

| Consumer | Current role |
| --- | --- |
| `src/app/LeftApp.tsx` | `usePopularTimesForVenues` combines shared Realtime popular-times updates with independent LEFT presence |
| `src/screens/left/HomeScreen.tsx` | Nearby-card labels/colors/meters from the normalized envelope |
| `src/screens/left/VenueDetailScreen.tsx` | `usePopularTimes(placeId, placeUrl)`, pending state, seven-day histogram and no-data fallback |
| `src/screens/left/VenueScreen.tsx`, `src/features/discovery/map-filter.ts` | Map filtering by typical busyness or visible LEFT presence |
| `src/features/activity/venue-activity-display.ts` | Shared display labels, subtitles and tones |
| `src/features/activity/activity-types.ts`, `src/types/left-domain.ts` | Provider-independent activity envelope |
| `src/features/activity/venue-activity-service.ts` | Reads presence-only activity envelopes |

Removed: legacy client service, BestTime HTTP adapter and tests, forecast coordinator and tests, legacy activity normalizer/timezone helper, and both legacy Edge Function entrypoints. Removed provider flags and BestTime environment settings, including obsolete settings in local environment files. Generic venue timezone/address fields and first-party presence are retained.

## Data flow

1. An authenticated user requests a known active canonical venue with `{placeId, placeUrl}`. The backend reconstructs the Maps URL from Place ID so caller URLs cannot poison another venue's cache entry.
2. Unexpired ready rows return immediately, including `has_data=false`. Pending rows and failed rows in backoff never retrigger.
3. The service-only `claim_popular_times_budgeted` RPC atomically arbitrates ownership by Place ID. Migrations 0033 and 20261004220526 serialize successful paid claims through a shared daily run counter and a per-user quota of 10 new fetches per hour. Ready/pending/backoff reads consume neither quota. Quota checks and the pending claim share one transaction; denied claims leave existing cache state unchanged. Its default is 250 launches per UTC day; administrators can adjust `popular_times_run_budget.daily_limit` (0 disables new paid launches).
4. The Apify request runs through `EdgeRuntime.waitUntil`. Actor timeout is 90 seconds and HTTP timeout 100 seconds. Only the worker holding the pending claim token may write the result.
5. Success caches for 14 days; actor failure backs off for 24 hours. An abandoned three-minute lease becomes failed with a 24-hour backoff on the next request. User/shared budget exhaustion returns HTTP 429 with Retry-After without creating a pending row or launching an actor.
6. Supabase Realtime updates the hook without polling. A read on subscription/reconnect closes the initial subscription race, and foreground resume rechecks cache. A single pending-lease deadline recovery handles abandoned workers. Subscriptions are shared per Place ID and cleaned up after the last listener.

The provider interface/factory isolates Apify's payload from the app. Future `self_report` and `own_telemetry` adapters return the same normalized shape. A Google refresh cannot modify first-party row state, including expired pending leases.

[Apify actor contract](https://apify.com/crawlerbros/google-maps-popular-times): the histogram is a weekday object of `{hour,busyness}` entries; absent hours remain absent. Optional current busyness is stored as a scrape-time snapshot, never labeled live in the UI.

## Display and operational limits

Pending shows loading and an inactive meter. Ready with data shows a weekly histogram and optional visit duration; a valid venue timezone enables a typical current-hour score. Missing timezone means no guessed current-hour score, but the weekly chart remains usable. A local display timer recalculates typical activity without provider/network polling. No-data/failure/missing Place ID shows neutral fallback text.

The shared budget caps actor launch count, not an exact currency amount. It is a bootstrap safeguard, not proof against all abuse: accounts can still consume the available daily budget. Use account controls and provider-side billing limits according to the deployment's needs.

## Remaining deployment sequence

1. Obtain approval and apply 0033, 0034, and 20261004220526 to development. 0034 permanently deletes the obsolete cache and three provider-specific venue columns; it keeps venue timezone/address and presence data. The compatible presence-only backend is already deployed.
2. Run `supabase/tests/popular-times.sql`, `supabase/tests/popular-times-budget.sql`, `supabase/tests/popular-times-user-limits.sql`, and the remaining security SQL checks. Their fixtures roll back. Verify concurrent claims from two independent DB sessions produce a single paid owner.
3. Configure `APIFY_TOKEN` using Supabase secrets; optionally set `POPULAR_TIMES_PROVIDER=google_scrape`. Do not use a public Expo token variable.
4. Deploy `get-popular-times` and the updated `venue-details` function. The budgeted endpoint intentionally fails closed if the new four-argument claim RPC is absent. No BestTime rollback path remains.
5. Smoke-test two users opening the same venue (one actor run, both update through Realtime), reopening from cache, no-data, provider failure/backoff and timeout recovery. Release the Expo build after these checks.

See [security reassessment](popular-times-security-review.md) for findings, validation scope and remaining risks.
