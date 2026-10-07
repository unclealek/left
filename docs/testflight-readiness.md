# First TestFlight build

## Confirmed October 7, 2026

- User's Apple Developer screenshot confirms explicit bundle ID `com.left.mobile`
  and team `3Y42VMC42F`.
- Expo config and both native iOS build configurations now specify that team.
- User supplied App Store Connect Apple ID `6820218499`; configured as
  `submit.testflight.ios.ascAppId`. The remote app record has not been independently inspected.
- Native entitlement and Expo config request Sign in with Apple. The screenshot
  does not show whether that capability is enabled in the Apple portal.
- `eas.json` has a `testflight` store-distribution profile inheriting production
  build settings, using EAS's development environment and explicitly targeting
  staging URL `https://xrracivlxgedlzdcrfwx.supabase.co`.
- Its `EXPO_PUBLIC_SUPABASE_ANON_KEY` must match staging. Remote EAS environment
  values and signing credentials have not yet been verified. No APIFY_TOKEN or
  service-role secret belongs in EAS/client environment variables.
- The supplied Apify dataset passes the actual local normalization function:
  seven days, 168 hourly entries, current busyness 100, absent visit duration.
  The application activity model uses typical hourly values, not that cached
  instantaneous reading as live data.

## Live integration result

The staging smoke test on October 7 passed Auth sign-in, rejection of missing and
invalid tokens, input/unknown-venue validation, and pending cache HTTP response.
The Realtime channel reached SUBSCRIBED and the fixture update persisted, but the
raw UPDATE event timed out after 60 seconds. The test failed and cleaned up its
fixture and disposable account. It stopped before the paid Apify branch: no paid
lookup was made by this attempt. This supersedes the earlier successful synthetic
Realtime result as the latest readiness check; the cause is not yet established.

Next inspect publication membership for `venue_popular_times`, effective SELECT
permissions/RLS, and Realtime replication logs, then rerun the existing test.
An attempted read-only RLS query was blocked by automatic approval review because
of the account usage limit; it returned no database policy evidence.

## Remaining Apple steps

1. Confirm App Store Connect record `6820218499` uses bundle ID `com.left.mobile`.
2. The numeric app ID is now configured for TestFlight submission.
3. Confirm Sign in with Apple is enabled for this identifier in Apple's portal
   and the staging Supabase Apple provider accepts the native bundle ID.
4. Verify EAS development environment values and Apple distribution credentials.
5. Resolve/retest the live Realtime failure and paid provider/cache chain.
6. After review, build with `eas build --platform ios --profile testflight`,
   then submit the specific reviewed build with `eas submit --platform ios
   --profile testflight --id <BUILD_ID>`.

No cloud build, function deployment, migration, or App Store submission was made
during this preparation. Device-level Sign in with Apple and UI acceptance remain
required before release.
