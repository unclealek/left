# Replit setup

## Main preview

The Replit preview runs the Expo app in web mode:

```bash
npx expo start --web --port 5000 --host lan
```

The `Start application` workflow runs this command on port `5000`.

## Environment

The mobile preview expects these Replit Secrets:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

These values are used by Expo at startup. Supabase authentication and live venue flows still depend on the configured Supabase project and its deployed edge functions.

## Checks

```bash
npm run typecheck
npm test
npm --prefix admin run typecheck
npm run admin:build
```

## Admin app

The admin moderation app lives in `admin/` and can be run separately with:

```bash
npm run admin:web
```

It requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, plus a reviewer record in `public.admin_reviewers`.