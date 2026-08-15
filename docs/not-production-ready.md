# Not Production Ready Checklist

Status:
- working checklist of remaining production-readiness gaps
- handle items in order unless a release blocker forces reprioritization

## 1. App Architecture

- `src/app/LeftApp.tsx` is still large, but the highest-risk persistence logic has been extracted.
- Current services: `features/auth`, `features/account`, `features/presence`, `features/interactions`, `features/social-momentum`, and `features/venues`.
- Remaining architecture work is mostly UI orchestration cleanup, for example extracting hooks like `useAuthFlow`, `usePresenceSession`, `useSafetyActions`, and `useVenueSubmission`.
- Production runtime initialization no longer imports the mock user seed, and venue detection no longer falls back to seeded local venues.

## 2. Safety And Reporting

- Reports persist, but the report UI is still a compact inline panel rather than a dedicated flow.
- Report submission now uses the shared loading state and blocks double submit; dedicated-flow polish and automated coverage remain.
- There is no enforcement model after reports are reviewed.
- There is no user suspension, ban, or deactivation table.
- Add automated tests for report creation, block behavior, feed exclusion, and RLS.

## 3. Presence Session Lifecycle

- Sessions persist and recover, and the client now ends visibility when its expiry timestamp is reached.
- Migration `0021_expire_stale_lifecycle_records.sql` adds server cleanup for expired presence sessions and approach attempts, scheduled every minute when `pg_cron` is available.
- The lifecycle migration was reported applied to staging on August 10, 2026; scheduled cleanup behavior still needs verification.
- Pause is persisted, but there is no resume flow.
- Realtime updates are not wired for venue/feed changes.
- Venue selection gating exists, but stale selected venue recovery across movement needs more QA.

## 4. Nearby Feed

- Supabase feed is used only when UUID-backed records exist.
- Empty feed and unconfirmed venue states are honest runtime states; production flow no longer substitutes seeded people or venues.
- Feed refresh is effect/manual based, not realtime.
- Empty, loading, and error states need stronger production handling.
- Shared alignment is still partly hardcoded in the profile UI.

## 5. Waves And Approaches

- The current product shell is approach-first; wave persistence exists in docs/schema but the user-facing wave flow is not presently aligned with the UI.
- Approach expiry now transitions to a local delayed follow-up prompt, but the backend does not yet own or validate that follow-up state.
- The UI now shows only the approach-stage prompt. The older profile-stage prompt field still exists in the data model/settings save path and the product docs still describe two prompt stages.
- Decide whether to fully remove `profile_prompt` from schema/docs/client state or intentionally reintroduce it later with a clearer product role.
- Cancel approach now persists `cancelled` with `cancelled_at`; timer expiry persists `expired`.
- Contact exchange exists in schema but is not implemented.
- Follow-up feedback is stored locally only and does not yet feed analytics or product ranking.

## 6. Admin And Operations

- Safety review exists through SQL/view docs, not a dedicated admin UI.
- This is acceptable for early technical ops, but not for non-technical moderators or scale.
- `review_safety_report` only marks review status and does not apply enforcement actions.
- Admin reviewer bootstrap may still require manual database setup.

## 7. Testing

- Vitest is configured and covers lifecycle countdown/expiry plus approach cancellation/expiry persistence behavior.
- Add Supabase RLS tests.
- Add integration tests for migrations and SQL functions.
- Add simulator or E2E coverage for auth, venue selection, activation, feed, safety, reporting, and approaches.
- TypeScript passing is necessary but not enough for production confidence.

## 8. Supabase Migrations

- Latest migration is `0023_fix_safety_review_parameter_binding.sql`.
- Migrations through `0023` were confirmed synchronized with staging and linked schema lint returned no errors on August 10, 2026.
- Verify Social Momentum writes, lifecycle cleanup, venue preferences, feed avatar styles, Google venue mapping, and activity caching before production use.
- Validate with a clean local Supabase reset or hosted staging project before production use.

## 9. Location And Venue Logic

- Venue preferences are still local-only.
- Backend venue detection returns existing canonical venues or ingests Google Places matches through the Edge Function; no seeded local venue fallback remains.
- Production venue catalog strategy is incomplete.
- Improve behavior for ambiguous venues, stale selected venues, and venue changes during active sessions.
- User-submitted venues are reusable in the current session, but moderation and promotion into the canonical venue catalog still need stronger ops support.

## 10. Observability And Errors

- Controllable app prompts now use the shared branded dialog instead of `Alert.alert`, but the underlying actions still need structured operational logging.
- Add analytics for activation, feed load, report submit, block, approach, approach follow-up, session expiry, and venue detection.
- Add crash/error reporting.
- Reduce noisy console logging in auth and location flows before release.

## 11. Auth And Account Hardening

- Google OAuth exists; Apple and email sign-in are deferred.
- Account deletion is currently identity removal, not full erasure.
- Auth redirect behavior needs production and development-build verification.
- Add a branded Supabase authentication domain so the iOS sign-in prompt shows a trusted Left-owned hostname instead of the generated Supabase project URL. This is deferred until the required domain and paid Supabase custom-domain add-on are available:
  - choose a production auth subdomain, such as `auth.<left-domain>`
  - configure and verify its DNS CNAME/TXT records in Supabase
  - add `https://auth.<left-domain>/auth/v1/callback` to the Google OAuth client while retaining the existing callback during migration
  - activate the custom domain and update staging/production `EXPO_PUBLIC_SUPABASE_URL`
  - rebuild and validate Google sign-in, native callback handling, session restore, and rollback behavior

## 12. UI Polish And Accessibility

- Report UI is functional but rough.
- Shared buttons now support pressed, disabled, loading/busy, icon, destructive, compact, and selected states.
- Logout and identity removal are visually separated, and both require confirmation at the appropriate level.
- Continue accessibility-label coverage across remaining custom navigation and action controls.
- QA dynamic text handling across small and large devices.

## Highest Priority Blockers

1. Add Supabase RLS and safety/reporting integration tests.
2. Configure the missing staging `GOOGLE_PLACES_API_KEY`, then validate staging integration behavior and RLS.
3. Complete real-device auth, background-location, lifecycle, visual, and accessibility QA.
4. Add crash/error reporting and production operational alerts.
5. Add moderator enforcement for reviewed safety reports.
