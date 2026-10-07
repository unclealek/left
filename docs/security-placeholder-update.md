# Placeholder and remaining security work

## Completed locally

- Server-only template at `supabase/functions/.env.example` now contains `APIFY_TOKEN=REPLACE_WITH_APIFY_TOKEN`. Root Expo `.env.example` no longer contains server configuration.
- Provider rejects this sentinel (including surrounding whitespace) before any cache claim or quota increment. Cached rows remain readable. A placeholder never triggers an actor request or a 24-hour failed cache entry.
- The ignored `supabase/functions/.env.local` also has the sentinel. It is not deployed.
- Moved the Google key out of Expo's `.env` and `.env.production` into ignored server-only `supabase/functions/.env.local`, mode 0600. The original value was preserved and never printed. It does not match the staging server secret's reported digest, so no remote credential was overwritten or rotated. Google Cloud restrictions still need verification in the correct Google project.
- Resolved the image-size advisories with a minimal build-only Metro API adapter backed by upstream image-size 2.0.3. The adapter preserves Metro's synchronous path/buffer interface, not the vulnerable parser. See `tooling/metro-image-size/README.md`.

## Verification

- Clean `npm ci --ignore-scripts` and `npm ls image-size image-size-modern --all` passed.
- All 126 tests passed, including placeholder cache/quota protections and parser compatibility. TypeScript passed.
- Web and iOS bundle exports passed after removal of the server key from Expo env files.
- npm audit now reports 22 high-severity affected dependency-tree entries, zero moderate/critical. Remaining roots are braces 3.0.3 and node-forge 1.4.0, also the latest versions returned by the registry. No patched drop-in version was available; these findings are not dismissed or claimed fixed.

## Auth and deployment blockers

The signed-in Chrome dashboard identifies project `xrracivlxgedlzdcrfwx` as **left-staging**, in the **Nawn FREE** organization. Prior reports called this project development; both names refer to the same project ref. No other project was changed.

Supabase's [password-security documentation](https://supabase.com/docs/guides/auth/password-security) states that leaked-password protection requires **Pro or above**. It is not a free toggle for this organization. No subscription/billing change or Auth change was made. Dashboard automation subsequently exposed only the sidebar and could not read the protection controls; the plan requirement is independently documented.

Automatic approval review rejected deployment of the placeholder guard, citing the earlier instruction to implement locally and wait for review. No workaround was attempted. The remote APIFY_TOKEN was not set: setting the placeholder without deploying its guard would let the older code treat it as a real token and create failed cache rows.

Next authorized remote sequence: deploy `get-popular-times` with the guard, then set only `APIFY_TOKEN=REPLACE_WITH_APIFY_TOKEN` on staging. New uncached lookups remain intentionally disabled until a real token replaces it. Production remains unchanged.
