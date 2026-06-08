# Not Production Ready Checklist

Status:
- working checklist of remaining production-readiness gaps
- handle items in order unless a release blocker forces reprioritization

## 1. App Architecture

- `src/app/LeftApp.tsx` is still large, but the highest-risk persistence logic has been extracted.
- Current services: `features/auth`, `features/account`, `features/presence`, `features/interactions`, `features/social-momentum`, and `features/venues`.
- Remaining architecture work is mostly UI orchestration cleanup, for example extracting hooks like `useAuthFlow`, `usePresenceSession`, `useSafetyActions`, and `useVenueSubmission`.
- UUID-guarded mock fallbacks should be isolated from production builds or made explicit in environment config.

## 2. Safety And Reporting

- Reports persist, but the report UI is still a compact inline panel rather than a dedicated flow.
- `Submit report` is not disabled while submitting, so double submit is possible.
- There is no enforcement model after reports are reviewed.
- There is no user suspension, ban, or deactivation table.
- Add automated tests for report creation, block behavior, feed exclusion, and RLS.

## 3. Presence Session Lifecycle

- Sessions persist and recover, but automatic expiry is incomplete.
- The client does not automatically end or expire sessions when duration runs out.
- There is no backend cleanup job for expired sessions.
- Pause is persisted, but there is no resume flow.
- Realtime updates are not wired for venue/feed changes.
- Venue selection gating exists, but stale selected venue recovery across movement needs more QA.

## 4. Nearby Feed

- Supabase feed is used only when UUID-backed records exist.
- Mock fallback is still mixed into app runtime code.
- Feed refresh is effect/manual based, not realtime.
- Empty, loading, and error states need stronger production handling.
- Shared alignment is still partly hardcoded in the profile UI.

## 5. Waves And Approaches

- The current product shell is approach-first; wave persistence exists in docs/schema but the user-facing wave flow is not presently aligned with the UI.
- Approach expiry now transitions to a local delayed follow-up prompt, but the backend does not yet own or validate that follow-up state.
- Cancel approach is not persisted.
- Contact exchange exists in schema but is not implemented.
- Follow-up feedback is stored locally only and does not yet feed analytics or product ranking.

## 6. Admin And Operations

- Safety review exists through SQL/view docs, not a dedicated admin UI.
- This is acceptable for early technical ops, but not for non-technical moderators or scale.
- `review_safety_report` only marks review status and does not apply enforcement actions.
- Admin reviewer bootstrap may still require manual database setup.

## 7. Testing

- No automated test suite is visible.
- Add Supabase RLS tests.
- Add integration tests for migrations and SQL functions.
- Add simulator or E2E coverage for auth, venue selection, activation, feed, safety, reporting, and approaches.
- TypeScript passing is necessary but not enough for production confidence.

## 8. Supabase Migrations

- Latest migration `0015_social_momentum_events.sql` was statically reviewed only.
- Supabase CLI is not installed in the current shell, so migrations have not been applied/tested locally.
- Apply migrations to staging first and verify Social Momentum event writes before production use.
- Validate with a clean local Supabase reset or hosted staging project before production use.

## 9. Location And Venue Logic

- Venue preferences are still local-only.
- Backend venue detection and local venue state still use fallback paths.
- Production venue catalog strategy is incomplete.
- Improve behavior for ambiguous venues, stale selected venues, and venue changes during active sessions.
- User-submitted venues are reusable in the current session, but moderation and promotion into the canonical venue catalog still need stronger ops support.

## 10. Observability And Errors

- Many flows use `Alert.alert` without structured operational logging.
- Add analytics for activation, feed load, report submit, block, approach, approach follow-up, session expiry, and venue detection.
- Add crash/error reporting.
- Reduce noisy console logging in auth and location flows before release.

## 11. Auth And Account Hardening

- Google OAuth exists; Apple sign-in is deferred.
- Account deletion is currently identity removal, not full erasure.
- Auth redirect behavior needs production and development-build verification.

## 12. UI Polish And Accessibility

- Report UI is functional but rough.
- Shared buttons do not support disabled/loading states.
- Some destructive actions do not have confirmation.
- Add accessibility labels across navigation and action buttons.
- QA dynamic text handling across small and large devices.

## Highest Priority Blockers

1. Add tests for Supabase RLS and safety/presence flows.
2. Apply and validate `0015_social_momentum_events.sql` in staging.
3. Enforce session expiry and approach cancellation/expiry.
4. Remove or clearly isolate mock fallback paths from production builds.
5. Add loading, disabled, and error states for safety, approach, and report actions.
