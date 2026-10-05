> Archived October 5, 2026: this describes the removed integration. Use [the current popular-times guide](popular-times-migration.md).

# BestTime integration

Implemented September 6, 2026. The older gap analysis and implementation plan describe the July baseline.

## Configuration

Set `BESTTIME_PRIVATE_API_KEY` and `BESTTIME_PROVIDER_MODE=live` in Supabase Edge Function secrets. The key must never use an `EXPO_PUBLIC_` prefix. The mobile app calls authenticated Supabase functions; only the backend calls BestTime. No public BestTime key is needed for these forecast and live endpoints.

Provider contract: https://documentation.besttime.app/

## Behavior

- `initialize-besttime-venue` creates or updates a forecast using a canonical venue's name/address or saved BestTime ID. Distant matches are rejected.
- `venue-activity` accepts up to ten venue IDs, returns normalized activity and separate Left presence counts, and refreshes stale data. The client splits larger requests into batches.
- `refresh-besttime-activity` runs the same cache-aware refresh with live data enabled; it does not bypass expiry or retry limits.
- Weekly forecasts remain cached for 21 days. The current hour is recalculated from the week using the venue timezone and BestTime's 06:00–05:00 day window.
- Live responses, including a normal “no live data” response, are cached until the next venue-local hour. Expired live scores fall back to the weekly forecast.
- Unsupported venues retry after seven days. Transient errors retry after fifteen minutes without overwriting usable forecast data or its actual expiry.
- A database refresh claim prevents simultaneous requests from making duplicate provider calls. Cache data is re-read after the claim, and writes are scoped to the current lease.
- Cached forecasts return immediately while refresh runs in the background. The app polls pending refreshes and reloads activity each minute while active and on foreground resume.
- Scores are relative busyness, not visitor counts. Live values above 100 are capped for the display meter; comparison still uses the provider's original value.

## Deployment

Apply migration `0027_besttime_provider_refresh.sql`, then deploy `venue-activity`, `initialize-besttime-venue`, and `refresh-besttime-activity`. The migration adds retry deadlines, restricts refresh claims/cache writes to the backend, and clears legacy synthetic BestTime mappings and mock forecasts.

Development project `xrracivlxgedlzdcrfwx` is the rollout target. Production `alcgvdhhllvykeqfliif` remains paused by user choice.

## Verification

All 69 tests pass, along with the app TypeScript check and a separate check of the provider/timezone modules. The deployed database lock and permissions were also verified inside a rolled-back transaction. Automated tests cover real provider payloads, absent live data returned with an Error status, credential redaction, missing credentials, malformed data, remote venue matches, local hour boundaries, forecast rollover, stale-live fallback, retry retention, and a 100-request simulated refresh race.

A real forecast and authenticated Edge Function requests were verified using Library Entresse. A temporary test account was removed after the smoke test. That venue had no live data at the time of verification; the live fallback is therefore the real-world path verified, while positive live scores are covered with provider-response fixtures.
