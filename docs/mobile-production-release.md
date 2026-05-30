# Mobile Production Release

This app uses Expo/EAS for distributable mobile builds.

## Build Profiles

- `development`: internal development-client build for local debugging.
- `preview`: internal production-mode build for testing before store release.
- `production`: store-ready production build with app version auto-incrementing.

## Required EAS Environment Variables

Set these in EAS for the production environment. Do not rely on local `.env.production` for cloud builds.

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "<production Supabase URL>"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<production anon key>"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "<production Google Places key>"
```

Use staging values for preview builds if you want internal builds to avoid production data.

## Local Checks

Run these before starting an EAS build:

```bash
npm run typecheck
npx expo install --check
NODE_ENV=production npx expo export --platform all --output-dir dist-mobile-check
rm -rf dist-mobile-check
```

## Build Commands

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Production Supabase Auth

Production Supabase must allow the app callback URL:

```text
left://auth/callback
```

The staging LAN callback URL should not be required for store builds.

## Release Test Pass

Test these on a real device before submitting:

- Google sign-in and session restore.
- Venue detection and home feed loading.
- Become visible, visible timer, and visibility session recovery.
- Hide, block, report, and safety controls.
- Account deletion request flow.
- Logout and fresh sign-in.
