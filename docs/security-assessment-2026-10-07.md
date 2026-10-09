# Security and publication assessment — 7 October 2026

**Recommendation: do not publish publicly yet.** Reviewed commit `2bcc6cb`, local source/dependencies and read-only metadata from live `left-staging` (`xrracivlxgedlzdcrfwx`). Findings below distinguish code defects from release evidence still missing. No application changes, remote writes, deployments, paid lookups or destructive tests were performed.

## Confirmed findings

### 1. High: logout can leave the user visible at a venue

`src/app/LeftApp.tsx:2446` awaits `supabase.auth.signOut()` before `clearLocalSessionState()` starts the asynchronous `endSessionState()` call. The latter invokes `end_presence_session` using the now-signed-out client. The live RPC requires `auth.uid()` and ownership. Therefore a successful logout removes the credentials needed to terminate presence; the local UI hides the session without a confirmed server change. Other people can continue seeing that presence until its expiry/staleness rules remove it.

End and confirm server presence while authenticated, then sign out. Handle failure explicitly, including offline logout. Verify with a second account viewing the venue. This finding is based on code ordering and the live RPC definition, not a destructive live reproduction.

### 2. High: account removal does not immediately close access or fully implement the Apple lifecycle

The deployed `process_identity_removal_request` matches `supabase/migrations/0025_discovery_profiles_saved_experiences.sql:445`. It redacts fields and removes refresh sessions, but retains `auth.users`, public profile and safety-zone records. Live profile/safety-zone policies only check `auth.uid()`; existing access JWTs can remain usable until expiry. Authenticated users also retain UPDATE privilege on `users.identity_removed`, with no protecting trigger. The app's identity-removed check is therefore not an authorization boundary.

The removal routine does not end active presence or clear all free-text profile/presence fields. No Apple token-revocation implementation was found; Apple sign-in consumes the ID token but does not retain/exchange the authorization code for that purpose. Resolve server-enforced removed-account/session checks, active-presence termination, documented retained-data rules and Apple revocation before release. Add regression coverage using a previously issued token after removal. Do not automatically erase policy-required safety records without deciding the retention policy.

References: [Supabase sign-out and access-token lifetime](https://supabase.com/docs/guides/auth/signout), [Apple account deletion and token revocation](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple).

### 3. High: Google OAuth uses an interceptable bearer-token callback

`src/lib/supabase.ts:17` does not set `flowType`; the installed auth library defaults to `implicit`. `src/features/auth/auth-service.ts:130` accepts access and refresh tokens from the custom `left://` callback. A malicious application registering the same scheme can potentially intercept the redirect. Use PKCE with a verifier bound to the initiating app and remove the implicit-token fallback; consider verified application/universal links. Test callback replay and mismatched verifier rejection on physical devices.

[React Native's security guidance](https://reactnative.dev/docs/security) describes custom deep-link interception and recommends PKCE for OAuth redirects.

### 4. High: local venue data crosses account boundaries

`src/features/location/location-storage.ts:5` uses device-global keys for venue preferences, coordinates, activation defaults and approach prompts. `src/app/LeftApp.tsx:1181` merges those preferences into the signed-in user's server data, and session restoration calls that synchronization. Logout does not clear these stores. After account A signs out and B signs in on the same installation, A's venue preferences can be exposed to and uploaded into B's account.

Scope account data by user ID, explicitly separate intentional pre-auth preferences, and clear sensitive runtime state on logout/removal. Verify account A → logout → account B. Background location is registered persistently, and no stop-on-logout path was found; include stopping the task and preventing signed-out coordinate persistence in this fix.

### 5. Medium: refresh tokens persist in unencrypted storage

`src/lib/supabase.ts:19` stores sessions in AsyncStorage with persistence enabled. It is not a remote exploit by itself, but increases exposure if app storage/backups are obtained. Use Keychain/Keystore-backed native storage with an appropriate migration and sign-out cleanup strategy. Coordinates also persist in AsyncStorage and need an explicit lifetime. [React Native storage guidance](https://reactnative.dev/docs/security).

### 6. Release gate: fresh dependency advisories need remediation and triage

Live npm registry audits returned:

| Lockfile | Critical | High | Moderate | Low |
| --- | ---: | ---: | ---: | ---: |
| Mobile/root | 1 | 24 | 5 | 0 |
| Admin | 0 | 5 | 1 | 1 |

These are affected dependency-tree entries, not distinct exploitable app vulnerabilities. Root direct-advisory packages are `shell-quote`, `compression`, `source-map-js`, `braces`, `node-forge` and `sprintf-js`. Much of the exposure is in development/build tools; runtime reachability was not established.

The critical finding is `shell-quote@1.10.0`, via `react-native → react-devtools-core`. [The advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv) identifies a command-injection condition requiring attacker-controlled tokens and lists `1.11.0` as patched. The audit also offers fixes for compression and source-map-js. Admin has its own vulnerable PostCSS/Vite and related tooling tree, unaffected by root overrides. Apply compatible fixes, reassess unresolved chains, then run exports/build checks. Do not blindly force the suggested React Native major upgrade.

## Publication blockers and missing evidence

- **Legal content is unfinished.** `src/features/legal/legal-content.ts:19`: terms and community guidelines are empty drafts; privacy remains a draft with controller/contact details missing. `legalContentReady` is false and the application only requires legal acceptance when it is true (`src/app/LeftApp.tsx:1631`). Supply approved, versioned documents and enforce the release gate. Reconcile location disclosures with actual server/provider processing; `nearby-venues-service.ts:29` sends coordinates before a venue is matched, despite the background notification claiming they stay on-device until a match.
- **Production is not verified.** The configured TestFlight profile intentionally uses development EAS environment values and staging (`eas.json:36`). Live project discovery identifies `left-staging` as healthy and the project named `left` as inactive. This does not prove which backend production EAS variables target. Verify a deliberate production target, its migrations, secrets, provider restrictions, backups, auth redirects and release credentials before publication. Staging tests do not certify production.
- **Latest recorded provider/Realtime test failed.** `docs/testflight-readiness.md` records a Realtime UPDATE timeout and no completed paid-provider branch. This run confirms the cache table is in `supabase_realtime` and has authenticated SELECT policy; it does not establish event delivery or resolve the timeout. Rerun the full HTTP → provider → cache → Realtime flow after diagnosis. Native Apple login, deletion/revocation and store signing remain unverified here.
- **Leaked-password protection remains disabled on staging**, confirmed by the live advisor. This is especially relevant to the password-based admin dashboard. Enable supported protection or document a reviewed alternative; verify admin MFA enforcement and production Auth settings separately. [Supabase remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Checks completed and limits

- `npm test`: **136 passing tests**, 25 files. `npm run typecheck`: passed.
- Gitleaks scanned **80 commits**. Both reported matches were verified as `ExpoAppleAuthentication` CocoaPods checksums, including a copied lockfile in the review artifact. No confirmed credential leak from that scan. This is not proof that every binary/archive or external artifact is secret-free.
- Live staging migration history contains all 37 committed migrations, including both database-hardening migrations. This supersedes older memory notes about missing migration 0032.
- Live security advisor: **0 errors, 15 warnings**, plus 3 informational notices. Fourteen warnings concern authenticated SECURITY DEFINER RPCs; they are not automatically vulnerabilities. Three RLS-without-policy notices concern server-only rate/budget tables and do not justify opening client access. [Privileged RPC review guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Read-only catalog query found no ordinary public tables with RLS disabled. Sampled profile/session/safety-zone policies enforce ownership; nearby-feed SQL requires a matching viewer presence and excludes blocked users. This does not cover all authorization paths or prove resistance to location spoofing.
- No new native build, penetration test, cross-account live mutation test, Apple portal verification, Google key restriction audit, EAS secret inspection or production database assessment was performed. Existing historical fixture results were not counted as newly passing tests.

Suggested order: fix logout and removal authorization; isolate local account data; harden OAuth and token storage; update dependencies; finalize legal content; verify the production environment and end-to-end device/release flows.
