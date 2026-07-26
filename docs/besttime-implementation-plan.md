# BestTime Implementation Plan

Status:
- written on July 26, 2026
- repo-specific implementation plan for `leftApp`

## Goal

Integrate BestTime into Left so the app shows:

- `activity`: general venue activity from BestTime
- `leftPresence`: active Left users at the venue

These must remain separate in the backend model, API contract, and UI.

## Architecture Shape

Target layers:

1. mobile app
2. Supabase Edge Functions
3. Supabase Postgres

Responsibilities:

- mobile app: location, screen state, rendering, user actions
- Edge Functions: provider calls, normalization, cache, locking, retries
- Postgres: canonical venue storage, BestTime mapping, presence aggregation, cache persistence

## Folder-By-Folder Plan

### 1. `supabase/migrations/`

Add a new migration for BestTime schema support.

Recommended file:

- `0020_besttime_activity_cache.sql`

Add to `public.venues`:

- `besttime_venue_id text unique`
- `besttime_status text not null default 'not_initialized'`
- `timezone text`
- `formatted_address text`
- `latitude double precision`
- `longitude double precision`
- `primary_type text`
- `google_types text[]`
- `google_photo_name text`
- `google_photo_attribution jsonb`
- `last_google_sync_at timestamptz`
- `last_besttime_forecast_at timestamptz`

Create `public.venue_activity_cache`:

- `venue_id uuid primary key references public.venues(id) on delete cascade`
- `forecast_score integer`
- `live_score integer`
- `live_available boolean not null default false`
- `intensity_label text`
- `comparison text`
- `raw_forecast jsonb`
- `raw_live jsonb`
- `forecast_fetched_at timestamptz`
- `forecast_expires_at timestamptz`
- `live_fetched_at timestamptz`
- `live_expires_at timestamptz`
- `refresh_status text not null default 'idle'`
- `refresh_started_at timestamptz`
- `last_error text`
- `consecutive_failures integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Add SQL function:

- `public.claim_activity_refresh(target_venue_id uuid) returns boolean`

Purpose:

- atomically allow only one refresh owner per venue

Add indexes:

- `venues_besttime_status_idx`
- `venue_activity_cache_live_expires_idx`
- `venue_activity_cache_refresh_status_idx`

Optional but likely useful:

- a safe SQL view or RPC for `leftPresence` aggregation from `presence_sessions`

### 2. `supabase/functions/`

Create a new folder per function:

- `nearby-venues/`
- `venue-activity/`
- `initialize-besttime-venue/`
- `refresh-besttime-activity/`
- `presence-start/`
- `presence-heartbeat/`
- `presence-end/`

Recommended shared helpers:

- `supabase/functions/_shared/besttime.ts`
- `supabase/functions/_shared/google-places.ts`
- `supabase/functions/_shared/activity-normalizer.ts`
- `supabase/functions/_shared/cache.ts`
- `supabase/functions/_shared/timezone.ts`
- `supabase/functions/_shared/presence.ts`
- `supabase/functions/_shared/http.ts`

What each function does:

- `nearby-venues`
  - validate location input
  - query canonical venues from DB first
  - if no viable result, call Google Places server-side
  - upsert venue rows
  - return lightweight venue metadata

- `initialize-besttime-venue`
  - load venue by Left venue ID
  - skip if already initialized
  - call BestTime using venue name and address
  - persist `besttime_venue_id`
  - persist forecast payload and cache data
  - set `besttime_status`

- `refresh-besttime-activity`
  - confirm refresh ownership
  - fetch BestTime live data
  - compute next hour expiry
  - update cache row
  - preserve stale data on transient failure

- `venue-activity`
  - accept `venueIds`
  - read cache and venue rows
  - initialize missing BestTime mapping when needed
  - refresh stale entries when needed
  - compute `leftPresence` from active sessions
  - return normalized response contract

- `presence-start`
  - wrap current presence creation logic
  - end previous active session if needed
  - create new active session

- `presence-heartbeat`
  - update `last_seen`-equivalent state
  - extend expiry

- `presence-end`
  - mark the active session as ended or paused

### 3. `src/features/location/`

Current file:

- [venue-detection.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/venue-detection.ts:1)

Refactor direction:

- stop calling Google Places directly from the mobile app
- replace direct provider lookup with a call to `nearby-venues`
- keep client-side location math only where it is useful for UI sorting and local state

Recommended additions:

- `src/features/location/nearby-venues-service.ts`

Purpose:

- call Supabase Edge Function `nearby-venues`
- return normalized nearby venue records to the app

### 4. `src/features/presence/`

Current file:

- [presence-service.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/presence/presence-service.ts:1)

Refactor direction:

- keep `presence_sessions` as the storage model
- move session lifecycle writes toward Edge Functions
- keep read helpers if they remain convenient

Recommended additions:

- `src/features/presence/presence-api.ts`

Purpose:

- call `presence-start`
- call `presence-heartbeat`
- call `presence-end`

Why keep `presence_sessions`:

- it already exists
- it already integrates with the rest of Left
- the PDF's `venue_presence` table is not worth a full rewrite right now

### 5. `src/features/activity/`

Create a new feature folder:

- `src/features/activity/`

Recommended files:

- `besttime-activity-service.ts`
- `activity-types.ts`
- `activity-formatters.ts`

Suggested types:

- `VenueActivity`
- `VenueActivityLabel`
- `VenueActivityComparison`
- `VenueActivityResponse`
- `VenuePresenceCounts`

Purpose:

- isolate the app-facing contract for backend activity data
- keep BestTime-specific fields out of screen code

### 6. `src/types/`

Update:

- [left-domain.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/types/left-domain.ts:1)

Add types for:

- `VenueActivityLabel = "quiet" | "light" | "active" | "busy" | "packed" | "unknown" | "closed"`
- `VenueActivityComparison = "quieter_than_usual" | "as_expected" | "busier_than_usual" | "unknown"`
- `VenueActivity`
- `VenuePresenceCounts`
- `VenueActivityEnvelope`

Extend venue model if needed with:

- `googlePlaceId`
- `besttimeStatus`
- `timezone`
- `formattedAddress`

### 7. `src/screens/left/`

Primary screens to update:

- [HomeScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/HomeScreen.tsx:1)
- [VenueDetailScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueDetailScreen.tsx:1)
- [VenueScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueScreen.tsx:1)

Replace placeholder logic with backend activity:

- remove invented pulse timestamps
- remove invented `usualCount`
- remove fake visible counts when actual counts are intended
- show:
  - `Busy now`
  - `Usually busy now`
  - `Busier than usual`
  - `Updated this hour`
  - `Activity unavailable`

Important UI rule:

- show BestTime activity as descriptive text and relative score
- show Left presence counts separately
- never render a combined occupancy claim

### 8. `src/app/`

Primary file:

- [LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx:1)

Refactor direction:

- add activity fetch orchestration after venue resolution
- cache responses in app state if useful for screen reuse
- trigger refresh when:
  - app opens
  - Home or Radar becomes active
  - foreground resume happens
  - manual refresh occurs
  - selected venue changes

Keep responsibilities clean:

- `LeftApp.tsx` coordinates
- service files fetch
- screens render

### 9. `docs/`

Update these docs after implementation starts:

- [current-implementation-contract.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/current-implementation-contract.md:1)
- [venues-google.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/venues-google.md:1)
- [location-venue-logic.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/location-venue-logic.md:1)

Add or maintain:

- activity response contract
- Edge Function responsibility boundaries
- cache policy
- timezone assumptions

## Recommended API Contract

For each venue:

```json
{
  "venueId": "uuid",
  "googlePlaceId": "ChIJ...",
  "name": "Oodi Library",
  "distanceMetres": 120,
  "activity": {
    "label": "busy",
    "displayText": "Busy now",
    "score": 78,
    "forecastScore": 65,
    "liveAvailable": true,
    "comparison": "busier_than_usual",
    "comparisonText": "Busier than usual",
    "updatedAt": "2026-07-26T18:00:00Z",
    "isStale": false,
    "refreshing": false,
    "source": "besttime"
  },
  "leftPresence": {
    "total": 18,
    "visible": 12,
    "openToMeet": 8
  }
}
```

## Runtime Flow

### Home / Radar

1. app gets foreground location
2. app calls `nearby-venues`
3. app receives canonical venue records
4. app calls `venue-activity` for the visible venues
5. UI renders activity and Left presence separately

### Venue Detail

1. user opens one venue
2. app requests or reuses `venue-activity`
3. detail screen renders activity copy, freshness, and Left counts
4. if stale, backend may serve stale data while one refresh runs

### Presence Lifecycle

1. user activates presence
2. app calls `presence-start`
3. app heartbeat extends expiry every 3 to 5 minutes while usable
4. app calls `presence-end` on leave, venue change, or explicit hide

## Caching Rules

Use these defaults:

- forecast cache: 21 days
- live cache: next clock-hour boundary in venue local time
- unsupported BestTime venue: 7 days
- transient BestTime failure: 5 to 15 minutes

App behavior:

- treat stale activity as displayable
- allow backend refresh in parallel
- do not block the UI waiting on BestTime unless there is no usable fallback

## Testing Plan

### SQL / Integration

Test:

- venue initialization
- cache hit
- cache miss
- refresh claim lock
- stale-while-revalidate
- unsupported venue
- transient failure retention

### App

Test:

- activity unavailable state
- forecast-only state
- live-available state
- venue switch while visible
- presence expiry and resume

### Concurrency

Test:

- 100 requests against one expired venue
- expected result: 1 provider refresh owner

## Phase Plan

### Phase 1

- add migration
- add shared activity types
- scaffold Edge Functions
- implement `initialize-besttime-venue`
- implement `venue-activity` with forecast-only fallback

### Phase 2

- implement live refresh
- add refresh locking
- add stale-while-revalidate
- wire Home and Venue Detail to real activity

### Phase 3

- move Google venue lookup fully server-side
- add observability
- add scheduled refresh for high-value venues
- tighten retry and cost controls

## Shortest Safe Path

For this repo, the shortest safe implementation path is:

1. keep `presence_sessions`
2. add BestTime as a separate activity subsystem
3. build server-side cache and normalization first
4. wire the UI only after the backend contract is stable

This avoids rewriting Left presence while still matching the PDF's core product and architecture requirements.
