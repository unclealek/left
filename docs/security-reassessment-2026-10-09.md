# Security remediation and reassessment — 9 October 2026

Scope: the first five findings in the assessment handoff, implemented in order: logout, account removal, account isolation, Google OAuth, native session storage. The migration and both Edge Functions have been deployed to left-staging (`xrracivlxgedlzdcrfwx`) with user authorization. Production was not changed.

## Results

| Finding | Local remediation | Release status |
| --- | --- | --- |
| Logout leaves presence visible | Query all own active server sessions; end them before auth sign-out. Block concurrent activation and retain authentication for retry on failure. Clear UI only after success. | Implemented and regression-tested; confirm with two physical-device accounts. |
| Removal leaves access JWTs usable | New restrictive RLS policies consult authoritative Auth removal state. Existing authenticated privileged RPCs get internal guards. Client writes cannot change removal state. Removal ends active presence and redacts remaining profile prompts/active hints. | Applied on staging; live SQL and deployed HTTP tests verify removal and rejection of the pre-removal JWT. Production rollout remains outstanding. |
| Missing Apple revocation | Request fresh Apple authorization at removal, exchange its one-use code on the server, verify the Apple-signed ID token and subject against the authenticated account, then revoke the refresh token before SQL removal. Fail closed and allow retry of pending requests. | Function deployed to staging and tested with mocked Apple responses. Staging has neither APPLE_CLIENT_ID nor APPLE_CLIENT_SECRET; real Apple-account verification remains blocked. |
| Cross-account local data | Account-scoped location/preferences/prompts/defaults; never import unowned legacy data. Logout stops location work, clears sensitive account data and dismisses venue notifications. Reject late location writes, stale session responses and another account's notifications. Precise coordinates remain in memory with a five-minute read lifetime. | Implemented and regression-tested; OS task behavior still requires device verification. |
| Google implicit callback | Configure PKCE; accept a single code only from the exact expected native callback; reject token-bearing callbacks and propagate failed code exchanges. | Implemented/tested; complete Google OAuth on physical devices before release. |
| Native plaintext session storage | Expo SecureStore adapter uses Keychain/Keystore. Large Unicode sessions are chunked into protected items; writes publish a manifest only after the chunks succeed. Per-key serialization prevents refresh/logout races. Existing AsyncStorage credentials migrate only after a successful protected write, and logout removes protected and legacy copies. | Implemented/tested; iOS native compile succeeds. Test Keychain/Keystore behavior on devices, including upgrade and restart. |

The account-removal migration intentionally retains policy-governed safety records. It does not invent a retention policy or erase historical safety data. Old signed download URLs are not invalidated by these RLS changes; finalize the overall retention/deletion policy separately.

## Validation

- Full Vitest suite: **192 tests pass across 34 files**. TypeScript checks pass.
- Isolated PGlite PostgreSQL runtime applies all repository migrations, then passes `rpc-authorization.sql`, `presence-location-validation.sql`, `database-advisor-hardening.sql` and the new `removed-account-access.sql`. The new fixture uses the same JWT subject after removal and verifies read/write denial, protected removal flags, ended presence and redacted prompts.
- PGlite supplies minimal Auth/Storage catalog fixtures and a no-op Realtime send function. This validates SQL behavior, not Supabase Auth services, Realtime delivery or production configuration.
- Storage coverage: 99.06% lines, 96.18% statements, 97.5% functions, 85.13% branches. Targeted logout/PKCE/Apple-revocation helpers: 100% across measured categories. These are scoped results, not whole-app coverage.
- iOS CocoaPods integration includes `ExpoSecureStore 15.0.8`. A full unsigned Debug simulator build with `xcodebuild` succeeded for the generic iOS Simulator destination. This is compilation, not a native acceptance test or signed release archive.
- Final **Android, iOS and web** bundle exports pass after the last source changes.
- `git diff --check` passes.

To reproduce the SQL regression locally:

```sh
npm install --prefix /tmp/left-security-db-runtime --no-save --ignore-scripts @electric-sql/pglite@0.5.8
node scripts/test-security-migrations.mjs
```

## Staging rollout completed

- Applied `supabase/migrations/20261009172103_enforce_removed_account_access.sql`; remote migration history matches version `20261009172103`.
- Automatic approval review rejected the original broad dynamic rewrite. The accepted migration instead names 23 application/storage policies and 14 privileged RPCs explicitly and performs no existing-data backfill. Preflight found no removed accounts with active presence. Future removal uses the updated cleanup trigger.
- All four SQL regression fixtures also passed against staging in rolled-back transactions.
- Deployed `process-identity-removal` version 10 and `get-popular-times` version 3, preserving `verify_jwt: true` for both.
- Both endpoints reject missing and invalid tokens with HTTP 401.
- `scripts/test-account-security-live.mjs` passed with a disposable non-Apple account: input validation and request ownership, successful removal, ended presence and redacted hint, then denial of profile reads/writes, privileged RPCs and both functions using its pre-removal JWT. The script cleaned up its disposable fixtures. It makes no paid-provider or Apple requests.
- Security advisors report zero errors, 15 warnings and three informational findings. Warnings comprise 14 intentionally authenticated, internally guarded [security-definer functions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) and disabled [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Informational findings concern three server-only rate/budget tables without RLS policies.

## Remaining release steps

1. Configure server-only `APPLE_CLIENT_ID` (native bundle ID) and a valid `APPLE_CLIENT_SECRET`; neither is currently present on staging. Keep signing keys and client secrets outside public variables, source and chat. Establish secret rotation. Removal fails closed when credentials are missing or Apple rejects them.
2. Build/install the updated native client. SecureStore requires a new native build; an OTA-only JavaScript update to the old binary is insufficient.
3. Verify with disposable device accounts: Google/Apple login, logout while visible as seen from another account, network-failed logout and retry, A→logout→B account isolation, background location after logout, Apple revocation failure/retry, and secure-session migration/restart/logout.
4. Complete production configuration review and an explicitly authorized production rollout after staging acceptance.

Future tables and authenticated privileged RPCs must preserve the active-account guard; the migration hardens the currently deployed schema, rather than automatically rewriting future functions.

## Reassessment verdict

**The five findings have implemented remediations with passing automated checks and a verified staging rollout. The app is still not ready for public publication.** Non-Apple removal and old-token denial passed live staging tests; Apple removal still requires server credentials and real-account verification. End-to-end Apple/Google and native storage/task behavior are not certified by mocked tests or a successful build.

The browser adapter still uses browser storage and needs the web application's own XSS/hosting controls; this change hardens native credential storage. Account storage isolation applies on both platforms.

Previously identified blockers outside this requested scope remain: dependency advisories (latest installation audit reported 1 critical, 24 high, 5 moderate affected root dependency entries), unfinished legal documents and retention/controller details, unverified production/EAS settings, disabled staging leaked-password protection, and the previously recorded provider/Realtime integration failure. No claim is made that these were fixed or newly validated by this work.
