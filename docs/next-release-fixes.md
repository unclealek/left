# Next release fixes — after TestFlight 0.1.0

Updated: 2026-10-21

The user is testing version 0.1.0 on a physical device. Its build number has not been confirmed in this conversation. Fixes made from this point forward are intended for the next release; the next version number is not yet chosen. Local changes are not changes to the installed TestFlight build.

Maintain this log as fixes are made. For each entry, record the symptom, change, validation, and outstanding device checks. Finish and verify the accumulated fixes before preparing the next release.

## 2026-10-21 — TestFlight build 8 preparation

- **Scope:** Accumulated Home/Profile/venue visual updates, native glass navigation, settings and regional preferences, opt-in analytics, location freshness, legal links and shared-component cleanup.
- **Version:** Retain marketing version 0.1.0; increment iOS build 7 to 8 in Expo and both native configurations. Runtime 1.0.1 separates the added native modules from runtime 1.0.0 binaries. No OTA update is part of this release.
- **Validation:** TypeScript and all 418 tests across 72 files pass. Bundle, dependency, secret and cloud build checks are recorded in `docs/releases/2026-10-21-testflight-build-8.md`.
- **Release status:** User authorized Git push and TestFlight submission. Build/upload results will be recorded after execution. Historical entries below describe the status when each change was made.
- **Limitations:** Staging TestFlight target; data export requires the separately approved settings migration. Draft legal documents and unset publication metadata still prevent new-user legal completion. Live Realtime delivery and physical-device regression checks remain outstanding. This mobile submission does not apply backend migrations or publish legal documents.

## Fixed locally, awaiting the next build

### 2026-10-20 — Clarify venue privacy list

- **Symptom:** The newly added people-block list did not match the requested venue controls.
- **Change:** Replaced it with **Hidden & muted venues**, opening the existing venue privacy list with Unhide/Unmute actions. Removed the new people-list UI/helpers and the unapplied blocked-name RPC from the prepared settings migration. Existing profile block/report safety controls remain available.
- **Validation:** TypeScript, 395 app tests and the focused export SQL tests passed. Venue screen navigation checked on iPhone 18 Pro / iOS 27; no venue preference changed during verification.
- **Release status:** Local next-release correction only. Venue controls use the existing backend; only data download still requires the prepared, unapplied settings migration. No deployment, push, TestFlight upload or version bump.

### 2026-10-20 — Account settings, language and measurement units

- **Symptom/request:** Add data download, a manageable venue privacy list, clearer deletion, analytics preferences, licences, installed version/build, app language and local measurement units.
- **Change:** Added functional settings panes, device-persisted preferences, English/Finnish/Swedish catalogs and shared metric/imperial distance conversion. Analytics defaults off and starts only after opt-in. Prepared scoped export RPCs; downloads use JSON and the system file/share flow. Existing deletion processing and ownership policies remain in place. See `docs/settings-and-regional-preferences.md` for scope and language/licence limitations.
- **Validation:** TypeScript and 397 tests across 69 files passed. Focused model/service coverage is 100% statements/lines/functions and 97.53% branches. Isolated SQL ownership/pagination/auth checks pass. Native build and Settings/Home/Profile language checks passed on iPhone 18 Pro / iOS 27; imperial selection, privacy switch off, licence viewer and persistence across development reloads verified. Default language/units restored. Broader database advisor fixture has a baseline-reproduced failure for the pre-existing public gathering preview; other existing security fixtures pass.
- **Release status:** Local implementation and prepared migration only. Migration `20261020100750_account_settings_tools.sql` requires explicit approval before staging application. Data download is not live yet. No push, deployment, new TestFlight build/upload, OTA update or version bump performed for this work.
- **Pending:** Approved staging migration and live scoped success/error tests; native file saving/share cancellation, actual unblock/deletion, account switching, analytics controls and large exports. Finnish/Swedish native-speaker review, remaining dynamic/server copy, native SDK/font attribution audit, Android and physical-device checks remain pending.

### 2026-10-20 — Connect supplied HERE legal pages

- **Symptom:** Terms, Privacy and Community links defaulted to temporary Google placeholders.
- **Change:** Shared legal manifest and `.env.example` now use the three user-supplied `here-web-azure.vercel.app` routes. Preserve HTTPS validation, release overrides, the unchecked agreement and independent permissions. All pages explicitly remain pre-launch drafts without versions/effective dates; publication metadata remains blank and final acceptance stays disabled by default.
- **Validation:** All three public routes returned HTTP 200 with expected text and draft notices. New regression first failed against the Google defaults, then passed after the change. Focused legal/account/onboarding tests (18) and TypeScript passed. Content-readiness findings are in `docs/legal-website-migration.md`.
- **Release status:** Local app/configuration only, intended for the next release after installed TestFlight 0.1.0. No hosted page edits, registry writes, migrations, deployment, EAS configuration, new build, OTA update or push. New-user completion remains blocked until approved legal publication and registry setup.
- **Pending device checks:** Open each document from sign-in, onboarding and Settings; return to the same screen; verify browser/offline errors and separate location/notification permissions. Then verify real acceptance persistence/renewal after final publication. No simulator or physical-device run performed for this URL-only change.

### 2026-10-18 — Remove dead UI code and consolidate shared implementations

- **Request:** Audit unused code and ensure repeated UI reuses existing components.
- **Change:** Removed 207 unused style definitions across 13 modules, two unused pills, two retired onboarding screen exports, obsolete screen literals/navigation tokens and unused avatar sizing branches. Shared native glass material/fallback rendering now serves cards and tabs; one accessibility preference implementation serves glass, navigation and existing loading/onboarding/auth animations. Ten UUID validators now use one tested helper. Home and venue details share artwork mapping without changing screen-specific inference or distance copy. After explicit user approval, removed the retired LegalScreen, home-presence helper and its test file. Native session storage and background task registration were retained.
- **Validation:** TypeScript and 311 tests across 51 files passed after the three tests for the retired helper were removed; focused changed-code coverage exceeds 90 percent statements/branches/functions. Admin production build and all three isolated popular-times SQL suites/permission checks passed; the SQL runner and old cache assertions were aligned with the already-approved indefinite-cache policy. Native simulator build and session restoration passed on iPhone 18 Pro/iOS 27; all tabs, Home glass/cards and opaque accessibility fallback were checked and settings restored. Diff whitespace checks passed.
- **Release status:** Local cleanup only. Three reviewed unused files deleted after approval. No backend deployment, EAS/TestFlight/OTA update, commit or push performed for this cleanup. Physical-device, older-iOS and Android regression checks remain pending. Detailed evidence and the three approved file removals are in `docs/code-reuse-cleanup.md`.

### 2026-10-18 — Native Liquid Glass bottom navigation

- **Request:** Floating native glass navigation for Home, Map, Venues and Profile, preserving existing navigation and screen content.
- **Change:** Replaced the dark custom track/solid green icon bubble with a reusable capsule using genuine native GlassView surfaces and a moss-tinted glass selection pill. Added SDK 54-compatible ExpoSymbols for iOS SF Symbols; Android/web retain Left icons and solid surfaces, older iOS uses system blur. Added live Reduce Motion/Transparency handling, light/dark navigation colors, larger labels, RTL selection geometry and measured footer clearance. Appearance now follows the system. No router migration or changes to auth/location/backend flows.
- **Validation:** iPhone 18 Pro/iOS 27 native simulator build and launch passed; all four tabs and selected states verified, Profile's final content clears the bar, and light/dark, larger text and accessibility fallback states checked. Navigation/compatibility coverage exceeds 90 percent statements, branches and functions. Full TypeScript/tests and diff checks passed; no lint configuration exists. Android/older-iOS behavior is covered by component logic tests, not device execution.
- **Release status:** Local simulator build only. A new EAS/TestFlight binary is required for ExpoSymbols; existing runtime 1.0.0 binaries must not receive this JS as an OTA update. Choose a compatible new runtime during release preparation. Marketing version/build number were not changed; no upload or OTA publication occurred.
- **Next-build checks:** Repeat tab, deep-link/return-path, safe-area, VoiceOver, light/dark, reduced motion/transparency and large-text checks on a physical iPhone; exercise older iOS and Android. See `docs/liquid-glass-navigation.md` for details and local testing instructions.

### 2026-10-18 — Reuse popular-times cache indefinitely

- **Request:** Disable the 14-day expiry for now and reuse saved popular-times results indefinitely.
- **Change:** The Edge Function returns any ready cache row, even with a legacy past expiry. Completed jobs now save `expires_at=null`. The mobile activity model accepts ready rows regardless of expiry, so saved charts remain visible. Successful no-data results are also retained indefinitely. Failed retry windows, pending leases, provider quotas and fetched timestamps are unchanged.
- **Database:** Applied `reuse_popular_times_indefinitely` to left-staging after explicit approval, aligning the budgeted claim function with indefinite ready-cache reuse, including concurrent cache claims. Existing cache rows were retained. Claims remain restricted to service role.
- **Validation:** TypeScript and all 265 tests passed; changed-code coverage is 92.3 percent statements, 83.33 percent branches and 100 percent lines/functions. Transactional SQL tests passed on staging and rolled back their fixtures, covering indefinite reuse at quota and failed-retry budget checks. Authenticated live HTTP checks passed for expired and null-expiry rows with and without histograms, without consuming lookup quota. Disposable Auth/cache fixtures were cleaned up; no paid Apify runs occurred. The separate Realtime smoke check subscribed successfully but timed out waiting for its UPDATE; automatic Realtime delivery remains unverified. Security advisors do not flag the changed claim function; other project advisories remain outside this change.
- **Release status:** Staging migration applied and `get-popular-times` version 10 deployed with JWT verification enabled. Mobile display change remains local; older installed builds still enforce expiry when rendering and need the next mobile update. No new TestFlight build uploaded.

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

### 2026-10-19 — Hospitality Home and anonymous presence presentation

- **Local change:** Bundled the supplied café background, redesigned current-venue,
  visibility, People here, nearby carousel and hosting sections using existing app
  flows and Liquid Glass navigation. Removed Home identity previews, duplicate
  visibility CTAs and distance-derived walking estimates. Forecasts are labelled
  “Typically”; unsupported density is omitted.
- **Reliability:** Manual presence changes await backend confirmation; stored expiry
  still clears discoverability offline. Shared venue-photo/details requests now
  deduplicate and briefly reuse user-scoped memory responses, with failure backoff.
  The unlimited saved popular-times cache is unchanged.
- **Validation:** TypeScript, 323 automated tests, admin build and diff checks pass.
  iPhone 18 Pro simulator native build and private Home/hosting/venue gate checked.
  Venue photos encountered staging 429 responses. Large-text layout fix needs visual
  recheck after sign-in; real visibility toggling, other device sizes, Android and
  physical-device acceptance remain pending. See `docs/home-redesign.md`.
- **Release:** No new dependencies, backend deployment, migration, version bump or
  TestFlight upload. This Home change adds no native rebuild requirement; earlier
  native-navigation changes still need a new binary for installed older builds.

### 2026-10-19 — Match Home to supplied visual reference

- Removed the extra heading/inset hero; Home now extends its hero behind the status
  bar, overlaps the visibility card, uses a right-side eye icon and white Go private
  action, and shows compact intent circles and nearby venue cards. Reuses the current
  buttons, photo service, privacy rules and native navigation.
- Checked private/visible local simulator previews at full width and 320pt; corrected
  large-text Maps/address stacking. Restored the normal app and simulator text size.
  No invented people counts/walking times, production preview data or backend writes.
- No new dependency/native rebuild requirement. Real photos remain subject to the
  existing provider availability/rate limits. See `docs/home-redesign.md`.

### 2026-10-19 — Real café photo for missing Home venue imagery

- Reused the existing licensed onboarding café-interior photo as Home's fallback
  when location/venue photography is missing or the remote image fails. Real venue
  photos stay preferred, including while private. The fallback is visibly marked
  illustrative and cannot create a confirmed location or enable presence.
- Added image load/failure regression checks. No new download, dependency, backend
  change or native rebuild requirement.

### 2026-10-19 — Reuse photographic fallback across pages

- Extracted shared VenuePhoto and PhotoCredits components; removed the duplicate
  Home and venue-detail rendering/loading/attribution code. Reused on nearby cards,
  venue details/guest previews, private Venues, Profile and saved-places empty state.
- Real photos remain preferred and fallback imagery is marked illustrative. Profile
  respects Reduce Transparency. No added API calls, copied assets, dependencies,
  backend changes or native rebuild requirement.
- TypeScript, 328 tests and diff checks pass. Native visual acceptance of the newly
  changed pages remains separate from automated component checks.

### 2026-10-19 — Focused Home refinement and real app-state captures

- Home uses the approved warm blurred interior as its fallback, while real venue
  imagery/metadata stays preferred. Simplified unconfirmed visibility copy and
  shortened private People here copy for an approximately 22% normal-width height
  reduction. Existing navigation and bottom content clearance retained.
- Verified native UIGlassEffect implementation in the installed Expo module. Captured
  the existing no-venue state, real Oodi confirmation/photo using public simulated
  GPS coordinates, and full host-card clearance above the footer. No fabricated
  backend responses or presence activation; simulator location restored to None.
- TypeScript, 330 tests and diff checks pass. Screenshots and verification boundaries
  are recorded in `docs/home-redesign.md`. No dependency/native rebuild requirement.

### 2026-10-19 — Category-aware venue placeholders

- Shared VenuePhoto selects category-specific café/bar/restaurant/library/workspace/
  park/gym/airport imagery from existing venue metadata and clear category names.
  Unknown places keep a general interior; all samples are labelled illustrative.
  Actual venue photography remains preferred. No simulated location or confirmation
  changes, no added runtime provider calls.
- Added seven documented stock assets (~1.3 MB); reused existing café/general photos.
  Removed unused illustration-selector code without deleting original artwork.
  No dependency, backend deployment or native-code change.
- **Validation:** TypeScript, 350 tests across 56 files, and diff checks pass. Source
  images were visually inspected; this change does not claim physical-device QA.

### 2026-10-19 — Guest mode shares the product interface

- Reused Home, private Map, venue/gathering details and native Liquid Glass footer
  for guest Home/Map/Venues/Profile. Extracted ProfileHero for both member and guest
  screens. Preserved member eligibility checks and guest sign-in gates.
- Guest previews do not request location or member presence; sample imagery and
  venue content remain labelled. Measured footer clearance keeps hosting accessible.
- Native build and all four tabs checked on iPhone 18 Pro / iOS 27.0 with Location
  None; screenshots in output/reviews/guest-product-design. Temporary preview entry
  restored. No backend deployment, version bump or TestFlight update.
- Validation: TypeScript, all 358 tests across 57 files and diff checks pass.

### 2026-10-19 — Restrict guests to the linked gathering

- Supersedes general guest browsing: removed the Auth guest entry and guest tabs,
  sample venues and Profile. Signed-out shared links show only the linked event
  through the existing detail component; venue/attendance/back actions open sign-in.
- Missing/unavailable links cannot open discovery. Stale or cancelled link requests
  cannot display a prior event. No backend/schema/deployment changes.
- Validation: TypeScript, 357 tests across 57 files and diff checks pass. Native
  event-only visual QA and deployed public links remain unverified.
### 2026-10-19 — Complete local PostHog tracking configuration

- Added explicit member/guest screen tracking for state-driven navigation and
  disabled provider autocapture. Screen events contain names and access mode only.
- Made existing AsyncStorage persistence explicit; configured ignored local
  production environment variables. No dependency or native rebuild requirement.
- Validation: TypeScript, 364 tests, production iOS bundle export, and diff checks
  pass. New analytics modules have 100% unit-test coverage.
- With explicit approval, configured and read back both PostHog variables in EAS
  development/preview/production. The EU ingestion endpoint accepted the labelled
  setup event with HTTP 200 / status Ok. Dashboard visibility and running-app
  delivery remain unverified. No TestFlight update performed by this setup step.
- Full verification boundaries and follow-up steps: `docs/posthog-setup.md`.

### 2026-10-19 — TestFlight build 7 requested

- User authorized TestFlight upload. Marketing version remains 0.1.0; native and
  Expo build numbers advanced from 6 to 7. EAS testflight profile retains staging.
- Current workspace uploaded to EAS build 5e23e5c9-011d-4607-a5c9-d690929b8872;
  automatic submission b33433e4-bb35-424d-9fd2-4163b9138c32 scheduled.
- TypeScript, 357 tests, diff checks and production iOS export passed locally.
  Cloud build/upload/Apple processing and installed-device verification pending.
  No Supabase deployment or public gathering-link setup performed.
- EAS native build FINISHED successfully; automatic submission FINISHED at
  2026-10-19 16:18 Helsinki. Build 0.1.0 (7) uploaded to App Store Connect.
  Apple processing/TestFlight availability and physical-device acceptance are separate.

### 2026-10-19 — Full-screen contextual venue backgrounds

- Replaced the Profile/private-venue photo-card treatment with one fixed VenueBackground
  shared across main product screens, behind scroll content and the existing native
  Liquid Glass navigation. Profile identity header is transparent; rounded cards use
  translucent ivory/white surfaces, with a blurred photo and ivory readability wash.
- Reuses VenuePhoto and its category resolver/failure path. Current venue takes priority
  among usable nearby results; otherwise the nearest candidate within 250m provides
  imagery. Without enabled location and coordinates, or with invalid/distant results,
  uses the general interior. No simulated GPS, extra requests or presence changes.
- Reduce Transparency removes background photography. Existing photo credit component
  retained for actual venue photos; placeholders explicitly labelled illustrative.
- TypeScript, 371 tests across 61 files and diff checks passed locally. Not included
  in already-uploaded TestFlight build 7; no release version change or backend deployment.

Native simulator build passed. Home, Profile and private Venues were visually checked
on iPhone 18 Pro / iOS 27.0 with Location None; generic fallback is expected. Screenshots:
`output/reviews/contextual-background/profile.png` and `venues-private.png`.
No simulated GPS or visibility activation used. Live nearby-category switching and
physical-device acceptance remain separate from automated selection tests.

### 2026-10-19 — Match Profile section structure to supplied reference

- Replaced the old overview layout with a single ProfileOverview, reusing ProfileHero,
  icons, existing edit workflow, background and native footer. Order: identity, interest
  pills, one visibility/safety card, three-column compass, completion, saved places,
  recent moments. Removed the standalone Style card and duplicated visibility notes.
- Added a reusable SVG completion ring with full track and exact progress arc; preserves
  existing four-field completion calculation. Actual membership year/counts/state shown.
  Settings, safety, visibility, editing and saved-place actions use existing handlers.
- Compass stacks at larger accessibility text sizes; Reduce Transparency uses solid
  cards. No backend/schema changes, fabricated counts or account changes.
- TypeScript, 376 tests across 63 files and diff checks pass. Visually checked on
  iPhone 18 Pro / iOS 27.0, including lower-card/footer clearance and edit/back routing.
  Screenshots: output/reviews/profile-reference/top.png and lower-sections.png.
  Local change only; not included in uploaded TestFlight build 7.

### 2026-10-19 — Remove decorative background caption

- Removed the app-rendered illustrative-photo caption from the shared full-screen
  VenueBackground so it no longer floats over Profile or other screen content.
  Category selection and required credits for actual venue photos are retained.
  Local change only; not included in TestFlight build 7.


### 2026-10-20 — Confirm launch languages and extend translated messages

- User confirmed English, Finnish and Swedish. Extended the existing language
  preference through runtime dialogs/errors, venue notifications and accessibility
  labels. Background notification copy reads the saved device preference before
  React mounts; unavailable storage safely follows the device language.
- Localized gathering schedules, numeric/cost displays and illustrative-photo labels.
  Distance conversion remains independently selectable; currency amounts and user
  names/content retain their meaning. Placeholder interpolation preserves literal
  names and does not reinterpret replacement characters or nested placeholders.
- Validation: TypeScript and 404 tests across 70 files pass, including new translation,
  notification, interpolation and formatting regressions. Earlier iPhone 18 Pro /
  iOS 27 simulator checks cover settings selection/persistence; this message-copy
  follow-up was not rechecked in the simulator.
- Local only. Native-speaker review, larger-text checks and physical iOS/Android
  verification remain pending. No backend deployment, push, version bump or
  TestFlight upload. See docs/settings-and-regional-preferences.md for scope.


### 2026-10-20 — Correct account deletion retry feedback

- Saved requests whose processing is unconfirmed now show a pending status with a
  retry action, rather than claiming nothing was removed or showing success.
  Deletion dialogs consistently use account-deletion wording in English, Finnish
  and Swedish. Confirmation and Apple authorization remain required.
- A thrown processing/network error now preserves the saved request's retry path;
  unexpected earlier errors return the UI from its busy state. Existing pending
  requests are reused on retry.
- TypeScript, 405 tests and diff checks pass. Added a regression for processing
  transport failure. No real account deleted, backend deployed or TestFlight
  uploaded; simulator/device verification remains pending for this change.


### 2026-10-20 — Integrate deletion with Settings rows

- Replaced the separate deletion warning card and repeated button with one red
  action row in the shared Session card alongside Log out. Uses the same icon,
  typography, dividers and spacing as other settings rows; retention explanation
  stays directly below the action label. Pending/error feedback stays in the card.
- Existing deletion confirmation, authorization and retry behavior retained.
  Session actions are disabled while deletion submits, with accessibility state.
- TypeScript, 405 tests and diff checks pass. Local UI change; simulator/device
  appearance still needs verification. Device Hub shows the previous loaded UI,
  but CoreSimulator service access was denied when attempting to reload this change.


### 2026-10-20 — Match supplied deletion-action reference

- Supersedes the shared Session menu-card treatment above: Log out and Delete
  account are centered neutral text rows with subtle top/bottom dividers, no
  icons, chevrons, warning border or explanatory paragraph in the resting state.
  Uses the app's existing type/color tokens. Retention explanation remains in
  the confirmation; pending/error feedback and disabled/busy states are preserved.
- This action only deletes; no unsupported account-pause option is advertised.
- Local UI change. Simulator/device visual verification remains pending.


### 2026-10-20 — Reload current Settings bundle in simulator

- User screenshot showed the original warning-card UI. Restarted local Metro and
  reconnected iPhone 18 Pro / iOS 27 to the current bundle. Runtime accessibility
  now reports the new Log out / Delete account action rows without the old Session
  heading, warning paragraph or Request account deletion button.
- Settings restored after reload. Bottom-row visual inspection is still pending:
  automated scroll gestures did not move the Device Hub viewport. Metro remains
  running so the user can inspect the updated UI directly. No account action run.


### Home venue freshness follow-up

- Symptom: Home could show a previously detected venue farther from the user's
  current position. The persisted venue survived after transient coordinates
  expired, and foreground lookup failure left it displayed as current.
- Runtime reads now clear current/selected venue, nearby candidates and dwell
  state when the coordinate fix has expired or is absent. Explicitly clearing
  coordinates also removes the transient fix. Foreground lookup failure clears
  stale venue discovery; account ownership is rechecked after the GPS lookup.
- Foreground requests use High accuracy. Automatic venue matching rejects unknown,
  invalid or greater-than-100m reported accuracy; nearby suggestions remain
  available for confirmation. Existing venue-distance/security limits unchanged.
- Validation: TypeScript, 414 tests across 71 files and diff checks pass. Regression
  coverage includes expired fixes, coarse/unknown accuracy, lookup failure and
  account changes during GPS acquisition. No simulated GPS or live location data
  used. Physical-device checks while moving between venues, indoors and with
  Precise Location disabled remain pending. Local only; no TestFlight upload.


### Visibility slide confirmation follow-up

- Symptom: sliding to activate redirected to Pick your venue when several places
  were nearby, then required the activation gesture again.
- Activation now resolves the venue from freshly refreshed runtime coordinates,
  not the previous render's Home venue/selection flags. One dialog shows venue,
  intent, vibes, duration and hint. Go visible revalidates location and activates;
  a changed venue requires a new confirmation. Change venue is optional and returns
  to confirmation after selection without requiring another slide.
- The confirmed venue is persisted as selected so the multi-venue monitor does
  not immediately redirect the newly visible session back to the picker. Existing
  permission, hidden-venue, fresh-fix, accuracy, distance and server checks remain.
- Validation: TypeScript, 418 tests across 72 files and diff checks pass. New tests
  cover multiple candidates, explicit selection, no detected venue, expired/missing
  coordinates and out-of-range candidates. No real visibility session created.
  Simulator/physical-device flow checks remain pending. Local only; no deployment
  or TestFlight upload.
