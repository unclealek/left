# Next release fixes — after TestFlight 0.1.0

Updated: 2026-10-10

The user is testing version 0.1.0 on a physical device. Its build number has not been confirmed in this conversation. Fixes made from this point forward are intended for the next release; the next version number is not yet chosen. Local changes are not changes to the installed TestFlight build.

Maintain this log as fixes are made. For each entry, record the symptom, change, validation, and outstanding device checks. Finish and verify the accumulated fixes before preparing the next release.

## Fixed locally, awaiting the next build

### 2026-10-10 — Login screen flashes when reopening while signed in

- **Reported on:** TestFlight 0.1.0, physical device.
- **Symptom:** The starter/login screen briefly appears before the app restores the signed-in account.
- **Cause:** Session restoration calls the local account cleanup helper, which previously always navigated to the login screen.
- **Change:** In `src/app/LeftApp.tsx`, session restoration requests the loading screen while account state is restored. Explicit sign-out retains the login screen as the default destination.
- **Validation:** TypeScript passed; all 192 tests across 34 files passed; targeted execution checks confirmed loading during pending restoration and login after explicit cleanup for sign-out. Diff whitespace checks passed.
- **Release status:** Local fix only. Not built, uploaded, or verified on the user's device.
- **Next-build checks:** Fully close and reopen while signed in; confirm no login flash and the expected home/venue screen. Confirm sign-out still reaches login and sign-in succeeds. Check signed-out startup and restoration failure/retry behavior.

## User-reported baseline on TestFlight 0.1.0

- Apple sign-in works on the physical device.
- Sign-out followed by sign-in works.
- The signed-in session persists after closing and reopening.
- Location appears active to the user; accuracy and venue discovery are not yet verified.
- Initial venue loading was unverified. The later outdoor failure report below supersedes this observation.

These are user-reported observations, separate from local automated verification.

### 2026-10-10 — Website legal links and compact mobile agreement

- **Request:** Move full legal content to the separate official website; simplify mobile acceptance while preserving records and permissions.
- **Local changes:** Short agreement screen with one unchecked checkbox; three external links from sign-in, onboarding, and Settings; notice acknowledgement wording for Privacy; no duplicate final agreement during uninterrupted onboarding. Fixed historical-version lookup and profile-before-acceptance save ordering. Reused existing tables/RPC without a migration or historical-record rewrite.
- **Placeholder:** User authorized `https://google.com` temporarily for all links. No actual website/domain or approved content is available. Placeholder configuration disables new-user acceptance/completion; existing completed users are not re-prompted while publication is unconfigured. This must be resolved before release to new users.
- **Validation:** TypeScript and 205 tests across 37 files passed; legal URL/browser helper coverage is 100% for statements, branches, functions, and lines. Includes shallow UI tests and mocked service tests, not device end-to-end proof. Read-only staging audit confirmed the legal registry exists and is empty.
- **Release status:** Local integration complete with publication blocked. No deployment, build/upload, or acceptance data writes.
- **Handoff:** See [legal-website-migration.md](legal-website-migration.md) for the architecture audit, exact files, URL/metadata variables, proposed routes, data semantics, and manual QA/release steps.

## Open issues reported on 0.1.0

### 2026-10-10 — No nearby venues during an outdoor test

- **User observation:** Location appears active, but no venues appear around obvious venues. This supersedes the earlier unverified indoor-only observation above.
- **Status:** Confirmed deployed-code/schema mismatch repaired on left-staging after explicit user approval. Device venue discovery is still awaiting retest.
- **Initial code findings:** Discovery requests a 500 m radius. Both client invocation failures and server Google lookup failures currently collapse into an empty venue list, making a service/configuration error appear like no nearby venues.
- **Live checks:** Checked-in TestFlight configuration targets left-staging; the project is healthy and nearby-venues is deployed (version 15). Device build configuration and exact failing requests are not yet correlated.
- **Confirmed blocker:** Deployed nearby-venues selects three missing columns (`community_added_by_name`, `community_notes`, `community_photo_path`). A read-only query reproduces SQL 42703. Last-24-hour project-wide logs show 56 HTTP 500 and 12 HTTP 429 responses, without success responses in that aggregate.
- **Prepared:** `supabase/migrations/20261010145707_repair_nearby_venue_projection_columns.sql`, adding only the three nullable text columns. Applied to left-staging on 2026-10-10 after explicit approval; no broad migration replay, Edge Function deployment, or permission/location change.
- **Next checks:** Post-repair schema inspection confirms all three nullable text columns; the complete deployed venue SELECT now passes with LIMIT 0. Retry the installed device and inspect provider outcomes. Unlike mobile changes, a backend repair can affect the current 0.1.0 build immediately.
- **Evidence and repair plan:** [venue-discovery-2026-10-10.md](venue-discovery-2026-10-10.md).

### 2026-10-11 — Visibility, hosting, nearby coverage and popular-times failures

- **Root causes:** Profiles allow 12 vibes but the presence RPC rejected more than three; staging logs reproduced `too many vibes`. Hosting checked the reviewer-only venue catalog as a regular user, incorrectly rejecting active venues. Discovery requested five places and skipped Google whenever any nearby venue was cached.
- **Applied on staging:** `20261011072041_repair_presence_vibes_and_host_venue_check.sql` aligns the presence limit with profiles and adds a private, active-account-guarded boolean venue helper for the invoker hosting RPC. The migration does not update existing rows and retains ownership RLS, pending review, rate limits and location checks. Local migration filenames now match remote history; the prior schema repair is version `20261010145707`.
- **Deployed:** `nearby-venues` version 17 and `get-popular-times` version 8, both with JWT verification enabled. Discovery requests up to 20 Google results within the existing radius even when cached venues exist. It preserves cached fallback, applies an eight-second provider deadline, pages the catalog deterministically rather than truncating before distance filtering, and preserves disabled-venue state during refresh. Existing per-user rate limits remain. This can increase Google calls compared with the former cache-only behavior and does not guarantee every venue in Google's catalog.
- **Live verification:** `scripts/test-venue-actions-live.mjs` passed twice, including against the final nearby deployment. A disposable real Auth session started/ended presence with 12 vibes, rejected 13, submitted and read an owned pending-review event, and could not enumerate the private venue catalog. Nearby discovery returned six canonical venues within 500 m of the screenshot venue. The rolled-back `venue-actions.sql` fixture also passed on staging. All disposable HTTP test users and venue fixtures were cleaned up; subsequent Auth audit count was zero.
- **Popular-times blocker confirmed:** Two bounded new lookup attempts (Allas Pool and Old Market Hall) reached the deployed worker and failed. Safe diagnostics narrowed the staging response to `provider_http_403:insufficient-permissions`. Correct the Apify token's access to the configured actor and required run/dataset operations before retrying. The local token is rejected and has a different digest from staging, so it was not substituted. Real failed cache entries and quota usage were retained; no cache reset or budget refund was performed. Earlier failed rows retain their 24-hour backoff. No successful provider result or device popular-times recovery is claimed.
- **Client change:** Popular-times errors now display temporary unavailability rather than claiming that the venue has no data. This wording requires the next mobile build. Backend fixes are available to the installed staging TestFlight app immediately.
- **Local validation:** 223 tests across 40 files, TypeScript, five isolated SQL suites and diff checks pass. New helper tests cover pagination beyond 200 rows, legacy geofence coordinates, antimeridian proximity, disabled venue preservation and provider timeouts. These checks do not replace physical-device acceptance.
- **Security advisors:** No errors; unchanged 14 intentionally guarded [security-definer warnings](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), one [leaked-password-protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), and three informational server-only RLS tables without policies.
- **Remaining:** Correct staging Apify permissions, then verify a real provider-to-cache-to-device result. Retest visibility/events/discovery on the device. Existing legal/onboarding/native changes were preserved; source changes remain uncommitted and no new TestFlight build was made for these repairs.
