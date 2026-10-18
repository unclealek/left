# Next release fixes — after TestFlight 0.1.0

Updated: 2026-10-18

The user is testing version 0.1.0 on a physical device. Its build number has not been confirmed in this conversation. Fixes made from this point forward are intended for the next release; the next version number is not yet chosen. Local changes are not changes to the installed TestFlight build.

Maintain this log as fixes are made. For each entry, record the symptom, change, validation, and outstanding device checks. Finish and verify the accumulated fixes before preparing the next release.

## Fixed locally, awaiting the next build

### 2026-10-18 — Home location and nearby places stay current

- **Symptom:** Home can retain places from the last visibility session when the user has moved, including the old venue name after detection returns no venues.
- **Change:** Request a fresh foreground location fix on entry and return to the app, and periodically while a signed-in discovery screen is active with location enabled. Automatic requests are coalesced and spaced at least 90 seconds apart. Runtime polling continues without requesting GPS every three seconds. Clear the previous venue summary when no venue is detected, and reset social counts when the venue changes. Visibility is not required for discovery.
- **Validation:** TypeScript passed; all 261 tests across 47 files passed. Eight new regressions cover location-before-runtime ordering, rapid resume throttling, overlapping requests, failure recovery, empty/missing venues, venue changes and ambiguity. New helper coverage is 100 percent for statements, branches, functions and lines. Native lifecycle/GPS behavior has not been verified on a device.
- **Release status:** Local mobile fix only; no backend deployment, version change, build or TestFlight upload.
- **Next-build checks:** While invisible, move between locations and reopen Home; verify nearby places update. Move away from detected venues and confirm the old venue clears. Check foreground-only permission, denied permission, failed GPS/network lookup, and rapid background/foreground transitions.

### 2026-10-12 — Cost suggestions, read-only guest browsing and reviewed gathering sharing

- **Change:** Cost/potluck presets, ±€1 controls and editable amounts/details in Host something small; guest entry on sign-in with a separate read-only browsing UI. Approved future plans can share compact links once a real share origin is configured. Prepared a minimal public gathering-preview RPC and GET-only web fallback page; no profiles/participant identities or guest write handlers.
- **Validation:** 253 tests across 46 files, TypeScript, diff checks, helper coverage above 80 percent and isolated SQL authorization/filtering checks pass. iPhone 18 Pro previews verified guest/venue browsing, potluck suggestions and the amount increment from €5 to €6. Normal app restored; no proposal submitted.
- **Release status:** Local implementation only; no guest-sharing migration or function deployment, hosted domain, native associated-domain setup, new build or OTA update. Missing share origin disables share controls. Cost notes use the existing schema.
- **Pending:** User approval for migration `20261012164051_guest_shared_gathering_preview.sql`, share domain and actual public download URL. Then live guest/approval filtering and write-denial checks, universal-link/download testing and a new device build. See [guest-gathering-sharing.md](guest-gathering-sharing.md).


### 2026-10-12 — Put the real popular-times histogram inside its card

- **Symptom:** On the installed build, a "Popular times available" card shows decorative bars, while the actual weekday controls and histogram appear separately below it.
- **Change:** Populated results now render the real weekday selector, summary, histogram and hourly details inside one card under Popular times. Removed the duplicate availability banner and decorative bars from both available and unavailable states. Weekday tabs scroll horizontally to keep Sunday on the same row. Loading, failed and no-data messages retain their existing semantics.
- **Validation:** TypeScript, five chart-model tests and diff checks passed. iPhone 18 Pro simulator preview read real cached Fazer Café data and showed the complete histogram inside the card; selecting Sunday updated its summary. A separate no-data layout preview showed only the unavailable message, with no decorative histogram. Both temporary previews removed and the normal app restored. React component review checked conditional rendering, existing state reset keys and tab accessibility.
- **Release status:** Local mobile fix made after uploading 0.1.0 (6). Not included in build 6; no new build or OTA update submitted for this change. Physical-device verification remains pending the next release.

### 2026-10-12 — Popular-times actor contract mismatch

- **Evidence:** The supplied Apify run belongs to `compass/crawler-google-places` (actor `nwua9Gu5YrADL7ZDj`), while LEFT's backend called `crawlerbros/google-maps-popular-times`. Of 50 supplied results, 11 contain `popularTimesHistogram` and 39 contain empty histograms. Two include a current busyness snapshot. This sample does not establish Google's coverage for venues whose scrape returned an empty histogram.
- **Local change:** Default to Compass with one exact Place ID, `scrapePlaceDetailPage=true`, and review/image/contact enrichment disabled. Map abbreviated weekdays and `occupancyPercent` into the existing chart/cache format, select the matching Place ID, reject ambiguous or malformed responses, and keep completed no-data results separate from failures. The previous actor remains explicitly selectable through server-only `APIFY_POPULAR_TIMES_ACTOR=crawlerbros/google-maps-popular-times`.
- **Validation:** Supplied sample reduced to public venue names, IDs, histograms and busyness values for regression fixtures. Provider tests cover both formats, identity, missing fields, malformed data and request settings. Full tests, TypeScript and diff checks passed; provider coverage exceeds 80 percent for statements, branches, functions and lines.
- **Release status:** Deployed to staging as `get-popular-times` version 9, with JWT verification enabled, after user approval. One real lookup for Fazer Café Kluuvikatu passed HTTP → Compass worker → ready cache with data → authenticated Realtime → cached HTTP, consuming exactly one test-user trigger. The real cache and shared quota usage were retained; disposable Auth/cache smoke fixtures were cleaned up. No secret changes, quota resets or migration were needed. The paid smoke script now also accepts an existing failed row after its retry delay has expired, without deleting or expiring it.
- **Simulator verification:** A temporary preview of the real venue component read the real authenticated staging cache on iPhone 18 Pro. Monday's hourly bars rendered, and selecting Tuesday changed the chart summary to Tuesday's values. Preview removed and normal app restored. This verifies component/cache behavior, not an installed physical-device TestFlight session. Simulator GPS was configured to the public Fazer Café coordinates for discovery testing; discovery returned canonical nearby venues.
- **Remaining:** Retest populated and no-data venues on the physical device. Other failed entries retain their 24-hour backoff. The synchronous worker retains its bounded 90-second Apify request and 100-second client deadline; actor runs exceeding it will still fail and need separate execution-lifecycle work.

### 2026-10-12 — TestFlight build 0.1.0 (6)

- **Scope:** Venue hero fills the top/sides, with controls below the safe-area inset; Compass popular-times backend verified separately on staging. Existing source changes and native Expo Updates dependencies preserved.
- **Version:** Marketing version stays 0.1.0. Build 5 was confirmed as an existing finished EAS store build, so native Debug/Release build settings, Info.plist and Expo iOS metadata now use build 6.
- **Readiness:** 235 tests, TypeScript, online Expo dependency compatibility, iOS production bundle export and diff checks passed. EAS development URL and anon JWT both target staging `xrracivlxgedlzdcrfwx`; profile and active signing credentials target `com.left.mobile` and team `3Y42VMC42F`.
- **EAS:** Build `ca29ed65-85a6-4011-8061-36bcc2c298ef` finished successfully on the `testflight` profile. Submission `f9dce5b3-741a-4ed2-b465-8a91e3a667f1` successfully uploaded this exact binary to App Store Connect app `6820218499`. Apple processing/testing availability remains separate from upload success. Automated "What to test" notes were rejected before scheduling because the EAS plan does not support changelog submission; binary submission without notes succeeded.
- **Known limitation:** Legal environment variables are unconfigured in EAS development. Placeholder links intentionally keep new-user onboarding blocked; this is an existing-account testing build, not a new-user/public release. Physical-device acceptance remains pending.

### 2026-10-12 — Venue image fills the top of the screen

- **Symptom:** The venue detail image leaves a blank band above it and appears inset from the screen edges.
- **Change:** Removed the detail screen's top safe-area margin and hero padding. The image now spans the screen width and extends behind the status bar, with rounded bottom corners. Its height includes the top safe-area inset, while back/save controls stay below that inset.
- **Validation:** TypeScript and diff whitespace checks passed. A temporary local preview using the real venue component and matching scroll-container styles confirmed the illustration reaches the top and side edges on iPhone 17 Pro and iPhone 18 Pro simulators. Back navigation and the save control responded in the preview; save used local state only. The preview was removed and the normal app restored. Live venue discovery returned no nearby results during this check, so this does not prove the live discovery-to-detail flow or backend save behavior.
- **Release status:** Local change for the next mobile build; not uploaded to TestFlight.
- **Next-build checks:** Open venue details on a notched iPhone; confirm the image reaches the top and sides, back/save controls remain accessible, and scrolling and pull-to-refresh still work. Check both illustrations and loaded venue photos.

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
