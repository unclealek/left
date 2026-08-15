# Left

Mobile social discovery app built with Expo, React Native, TypeScript, and Supabase.

## What Is Here

This repository contains:
- the mobile app in the repo root
- the admin venue moderation app in `admin/`
- Supabase migrations and one edge function in `supabase/`
- product, engineering, and ops documentation in `docs/`

The current app includes:
- a privacy-forward welcome screen with working Google sign-in and an explicitly deferred email option
- three profile-setup steps plus a completion reveal: first name, social shape, background location, and “signal ready” handoff
- venue home with venue pulse, bubble preview, and Social Momentum card
- venue disambiguation when multiple nearby venues are detected
- user-submitted venue suggestions when the right venue is missing
- presence activation with intent, up to two vibes, duration, and hint text
- nearby feed backed by Supabase when UUID-backed venue and user records exist
- profile inspection with approach, hide, block, and report actions
- approach countdown flow plus delayed follow-up feedback prompt
- safety controls for pause, end session, hide venue, and mute venue notifications
- profile editing for first name, avatar style, default intent, and default vibes
- settings for safety access, notification preferences, app information, logout, and identity removal
- shared action buttons with pressed, disabled, loading, icon, destructive, and selected states

The canonical implementation lives in [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx).

## Quickstart

Requirements:
- Node 20+
- npm
- Xcode for iOS simulator builds
- Android Studio for Android emulator/device builds
- Supabase CLI if you want a fully local backend

Install dependencies for both apps:

```bash
npm install
npm --prefix admin install
```

Create local env files from the example values:

```bash
cp .env.example .env
cp .env.example admin/.env
```

Required mobile env vars:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

Required Supabase Edge Function secret:
- `GOOGLE_PLACES_API_KEY`

Required admin env vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Start the mobile app:

```bash
npm run start
```

Run native mobile targets:

```bash
npm run ios
npm run android
```

Start the admin app:

```bash
npm run admin:web
```

Useful checks:

```bash
npm run typecheck
npm test
npm --prefix admin run typecheck
npm run admin:web
npm run admin:build
```

Expected local outcome:
- the Expo app starts and can render the signed-out shell
- Google sign-in and live backend flows require valid Supabase project configuration
- venue detection uses the authenticated `nearby-venues` Edge Function; its server environment must contain `GOOGLE_PLACES_API_KEY`
- the admin app requires a valid reviewer account in `public.admin_reviewers`

## Local Backend

The repo includes Supabase config, migrations, and the `process-identity-removal` edge function, but local backend setup has caveats:
- `supabase/config.toml` is configured for local development
- migrations exist in `supabase/migrations/`
- `supabase/config.toml` references `supabase/seed.sql`, but that seed file is not currently present in the repo

Use [docs/local-development.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/local-development.md) for the current local backend workflow and caveats.

## Documentation

- Local development: [docs/local-development.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/local-development.md)
- Current implementation contract: [docs/current-implementation-contract.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/current-implementation-contract.md)
- Product: [docs/left-product-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-product-spec.md)
- Engineering: [docs/left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md)
- Location + venue logic: [docs/location-venue-logic.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/location-venue-logic.md)
- Admin safety operations: [docs/admin-safety-ops.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/admin-safety-ops.md)
- Production release: [docs/mobile-production-release.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/mobile-production-release.md)
- Mobile QA: [docs/mobile-qa-checklist.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/mobile-qa-checklist.md)
- Known gaps: [docs/not-production-ready.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/not-production-ready.md)
- Identity removal policy: [docs/identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md)
- Social Momentum: [docs/social-momentum.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/social-momentum.md)
