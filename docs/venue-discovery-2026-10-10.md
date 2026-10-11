# Venue discovery failure on TestFlight 0.1.0

## Report and evidence

The user reports an active location indicator but no venues while around obvious venues. No exact test coordinates or device logs were collected.

Read-only inspection on 2026-10-10:

- Checked-in `eas.json` targets `left-staging` (`xrracivlxgedlzdcrfwx`). The project reports healthy; `nearby-venues` is active at version 15.
- The last-24-hour request log aggregate returned **56 HTTP 500** and **12 HTTP 429** responses for `nearby-venues`, with no success responses in that aggregate. These are project-wide counts, not a proven correlation to a specific device request.
- The deployed shared `findNearbyVenueRows` selects `community_added_by_name`, `community_notes`, and `community_photo_path` from `public.venues`.
- Live schema inspection confirms all three are absent. A read-only `SELECT ... LIMIT 0` reproduces Postgres `42703: column community_added_by_name does not exist`.
- That query runs before the Google fallback. The function throws on its error; the mobile invocation handler turns errors into `[]`, so the UI can show no venues despite having coordinates.
- The table has 20 venues and the expected unique `google_place_id` index. The app's discovery radius is 500 m; confirmation is separately limited to 120 m. No radius or location permission changes were made.

This establishes a concrete deployed-code/schema mismatch sufficient to break venue discovery. It does not prove that every possible provider or device issue is resolved once repaired.

## Repair applied to staging after approval

`supabase/migrations/20261010145707_repair_nearby_venue_projection_columns.sql` adds only the three missing nullable text columns with `IF NOT EXISTS`. Their definitions match migration 0029. No rows, policies, permissions, or provider configuration are changed; existing rows receive null metadata.

Do not replay all of 0029 to repair this: it also changes permissions, clears some payloads, and configures storage. Do not run an unrestricted database push across pending migrations. Apply only this reviewed narrow repair to staging after explicit approval.

The file was generated with `supabase migration new`, then reviewed against the live schema and deployed projection. On 2026-10-10, the user explicitly approved applying this repair. It was successfully applied to left-staging using the migration API. No production change or Edge Function deployment was made.

Post-application checks confirmed all three columns exist as nullable text, and the full SELECT projection used by the deployed function passed with `LIMIT 0`. This confirms the schema blocker is removed, not that Google lookup or device venue discovery has passed.

## Verification status and remaining steps

1. **Done:** Applied only the named repair to left-staging.
2. **Passed:** Repeated the complete projection with `LIMIT 0` and checked the deployed function's required columns.
3. Have the user retry nearby discovery on the installed build, allowing the existing 8-per-10-minute rate-limit window to clear. Observe request outcomes; do not increase rate limits to hide repeated failures.
4. Confirm returned venues on the device. If still empty/erroring, inspect the now-reachable Google lookup/configuration and any remaining rate limiting. Do not assert paid provider success from the schema repair alone.
5. Separately consider a later client change that distinguishes lookup failure from a legitimate empty result; this investigation has not changed the location pipeline.

Unlike mobile UI fixes, this staging repair can affect the currently installed TestFlight app immediately because it calls this backend. The user explicitly approved this staging repair; mobile fixes remain queued for the next version.
