# Local Development

This document covers the current developer setup path for the mobile app, admin app, and local Supabase stack.

## Scope

Use this doc when you need to:
- boot the mobile app locally
- boot the admin moderation app locally
- point both apps at the same Supabase project
- run the Supabase stack locally with the current repository state

This is a description of the repo as it exists today, not an idealized setup.

## 1. Prerequisites

- Node 20+
- npm
- Xcode for iOS simulator work
- Android Studio for Android emulator/device work
- Supabase CLI for local backend work

## 2. Install Dependencies

From the repo root:

```bash
npm install
npm --prefix admin install
```

## 3. Environment Variables

Start from the shared example file:

```bash
cp .env.example .env
cp .env.example admin/.env
```

Mobile app variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

Supabase Edge Function secret:

- `GOOGLE_PLACES_API_KEY`

Admin app variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Important rules:

- point the mobile and admin apps at the same Supabase project unless you are intentionally testing split environments
- `EXPO_PUBLIC_*` values are embedded in Expo builds and are not secret
- Google Places is called only by the authenticated `nearby-venues` Edge Function; do not expose its key through an `EXPO_PUBLIC_*` variable
- set the hosted secret with `supabase secrets set GOOGLE_PLACES_API_KEY=<value>` and restrict it in Google Cloud

## 4. Run The Apps

Mobile app:

```bash
npm run start
```

Native targets:

```bash
npm run ios:simulator
npm run android
```

For Xcode 27 / Device Hub and native lifecycle details, see [iOS scene lifecycle](ios-scene-lifecycle.md).

Admin app:

```bash
npm run admin:web
```

Useful checks:

```bash
npm run typecheck
npm test
npm --prefix admin run typecheck
npm run admin:build
```

## 5. Current Supabase Layout

The repository includes:

- config in [supabase/config.toml](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/config.toml:1)
- migrations in [supabase/migrations](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations)
- one edge function in [supabase/functions/process-identity-removal/index.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/functions/process-identity-removal/index.ts:1)

The config currently enables local migrations and local seeding, but there is an important caveat:

- [supabase/config.toml](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/config.toml:60) references `./seed.sql`
- `supabase/seed.sql` is not present in the repository right now

That means a clean local reset path is not fully documented by the repo state alone.

## 6. Local Supabase Workflow

If you have Supabase CLI installed, the practical workflow is:

1. Start the local stack with `supabase start`.
2. Check whether the local project boots cleanly with the current config.
3. Apply or reapply migrations as needed.
4. If reset/seed fails, treat the missing `supabase/seed.sql` as the first thing to fix.

Because the seed file is missing, avoid assuming `supabase db reset` is currently reliable without first restoring or replacing the seed step.

Recommended verification after boot:

- confirm the local API and Studio endpoints come up
- inspect that the schema contains the tables/views/functions expected by the mobile and admin apps
- verify the latest migration set before testing Social Momentum or admin moderation flows

## 7. Admin Reviewer Bootstrap

The admin app is not open to any authenticated user. It requires a reviewer record.

Reviewer access is gated by:

- `public.admin_reviewers`
- `public.is_admin_reviewer(...)`

Relevant schema:

- [supabase/migrations/0012_admin_reviewers.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0012_admin_reviewers.sql:1)
- [supabase/migrations/0014_admin_reviewers_auth_users_fk.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0014_admin_reviewers_auth_users_fk.sql:1)

Current reviewer bootstrap rules:

- create the auth user first
- then insert that auth user id into `public.admin_reviewers`
- the reviewer does not need a matching `public.users` app profile row under the current documented model

If the admin app signs in successfully but still denies access, the first thing to verify is whether the user id exists in `public.admin_reviewers`.

## 8. Edge Function Notes

The repo contains one edge function:

- `process-identity-removal`

Source:

- [supabase/functions/process-identity-removal/index.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/functions/process-identity-removal/index.ts:1)

This function:

- requires authenticated user context
- expects a JSON body containing `requestId`
- calls the privileged database RPC `process_identity_removal_request`

Use the identity removal policy and engineering spec together when validating this flow:

- [docs/identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md:1)
- [docs/left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md:726)

## 9. Known Local Dev Caveats

- Vitest covers the extracted lifecycle rules, but backend RLS/integration and device E2E coverage are still missing.
- Production runtime does not use seeded people or venues; local backend development therefore needs real seed data or manual records.
- Migrations through `0021_expire_stale_lifecycle_records.sql` were confirmed synchronized with staging on August 10, 2026.
- Migration `0022_fix_staging_function_lint.sql` was applied and fixed the identity-removal schema-lint error.
- Migration `0023_fix_safety_review_parameter_binding.sql` was applied and linked staging schema lint completed without errors on August 10, 2026.
- Clean local reset and staging behavior validation remain.
- The missing `supabase/seed.sql` file is the main local backend reproducibility gap.

## 10. Recommended Next Docs Cleanup

The next documentation improvements after this file should be:

1. add an explicit Supabase CLI command sequence once the seed/reset path is fixed
2. document reviewer bootstrap with copy-paste SQL once the preferred setup path is settled
3. separate durable setup docs from temporary verification/status notes
