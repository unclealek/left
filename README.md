# Left

Mobile social discovery app built with Expo, React Native, TypeScript, and Supabase.

## Current Status

The app currently supports:
- Google sign-in
- three-step onboarding: first name, avatar style, background location
- venue home with venue pulse, bubble preview, and Social Momentum card
- venue disambiguation when multiple nearby venues are detected
- user-submitted venue suggestions when the right venue is missing
- presence activation with intent, up to two vibes, duration, and hint text
- nearby feed backed by Supabase when UUID-backed venue and user records exist
- profile inspection with approach, hide, block, and report actions
- approach countdown flow plus delayed follow-up feedback prompt
- safety controls for pause, end session, hide venue, and mute venue notifications
- settings for profile defaults, prompt templates, venue preferences, sign-out, and identity removal

The canonical implementation lives in [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx).

## Run Locally

Requirements:
- Node 20+
- npm
- Xcode for iOS simulator builds
- Android Studio for Android emulator/device builds

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Run native targets:

```bash
npm run ios
npm run android
```

Useful commands:

```bash
npm run typecheck
npm run admin:web
npm run admin:build
```

## Environment

Set these before running a build that uses Supabase or venue detection:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`

Production EAS setup lives in [docs/mobile-production-release.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/mobile-production-release.md).

## Documentation

- Product: [docs/left-product-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-product-spec.md)
- Engineering: [docs/left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md)
- Production release: [docs/mobile-production-release.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/mobile-production-release.md)
- Known gaps: [docs/not-production-ready.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/not-production-ready.md)
- Social Momentum: [docs/social-momentum.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/social-momentum.md)
