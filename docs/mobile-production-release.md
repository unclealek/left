# Mobile Production Release

This app uses Expo/EAS for distributable mobile builds.

## Build Profiles

- `development`: internal development-client build for local debugging.
- `preview`: internal Android APK build using the preview EAS environment.
- `ios-simulator-preview`: internal iOS Simulator build using the preview EAS environment.
- `ios-device-preview`: internal iOS device build using the preview EAS environment.
- `production`: store-ready production build with app version auto-incrementing.

## Required EAS Environment Variables

Set these in EAS for the production environment. Do not rely on local `.env.production` for cloud builds.

Install or upgrade EAS CLI first:

```bash
npm install -g eas-cli
eas --version
```

```bash
eas env:create production --scope project --type string --visibility sensitive --name EXPO_PUBLIC_SUPABASE_URL --value "<production Supabase URL>"
eas env:create production --scope project --type string --visibility sensitive --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<production anon key>"
eas env:create production --scope project --type string --visibility sensitive --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "<restricted public Mapbox token>"
```

Expo embeds every `EXPO_PUBLIC_*` value in the compiled app, so these variables cannot be true secrets. Use Google Cloud restrictions to protect the Google Places key.

Older EAS CLI versions used `secret:create`, but that command is deprecated:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "<production Supabase URL>"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<production anon key>"
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "<restricted public Mapbox token>"
```

Use staging values in the `preview` environment so internal builds avoid production data.

Google Places is server-side. Set it in the Supabase project that hosts the Edge Functions:

```bash
supabase secrets set GOOGLE_PLACES_API_KEY="<restricted production Google Places key>"
```

## Local Checks

Run these before starting an EAS build:

```bash
npm run typecheck
npm test
npx expo install --check
NODE_ENV=production npx expo export --platform all --output-dir dist-mobile-check
rm -rf dist-mobile-check
```

Treat the command output as the source of truth. Do not rely on this document as evidence that the checks passed recently.

For local iOS builds, CocoaPods requires a UTF-8 terminal locale. If `npx expo run:ios` fails with `Unicode Normalization not appropriate for ASCII-8BIT`, run:

```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
npx expo run:ios
```

Add the two `export` lines to `~/.zshrc` if you want the fix to persist.

## Build Commands

```bash
eas build --platform android --profile preview
eas build --platform ios --profile ios-simulator-preview
eas build --platform ios --profile ios-device-preview
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Production Supabase Auth

Production Supabase must allow the app callback URL:

```text
left://auth/callback
```

The staging LAN callback URL should not be required for store builds.

## App Icon

The repository contains Expo, Android adaptive-icon, splash, and native iOS app-icon assets. The production icon uses a flat Yellow Green `#C6E385` background with the centered black Left mark enlarged by 20% from the original asset so the change remains visible at launcher size; Android adaptive-icon configuration uses the same background color and scaled foreground. Verify the system-applied mask and appearance in the device preview build before submission.

## Release Test Pass

Test these on a real device before submitting:

- Google sign-in and session restore.
- Venue detection, venue selection, and venue submission fallback.
- Become visible, visible timer, and visibility session recovery.
- Social Momentum card behavior: observing, warming up, engaging, connected, dismiss, and suppression after block/report.
- Approach countdown expiry and delayed follow-up prompt recovery after app resume.
- Hide, block, report, and safety controls.
- Hidden/muted venue preference clearing from settings.
- Identity-removal request, confirmation, loading, retry, recorded status, and forced sign-out flow.
- Neutral Logout action, confirmation, and fresh sign-in.
- Shared button pressed, disabled, loading, selected, icon, and destructive states.
- Automatic visibility expiry while the app is open and after the app has been backgrounded.
- Persisted approach cancellation and automatic approach expiry.

## Dependency Audit

Run `npm audit fix` without `--force`. As of August 10, 2026, the remaining advisories are in Expo/Metro build-tool dependencies and require a breaking Expo SDK upgrade to resolve. Do not force that upgrade inside a release candidate; track and test it as a dedicated SDK migration.
