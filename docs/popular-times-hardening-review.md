# Popular-times hardening — local review

> Deployment update: the approved migrations and functions are now deployed to development. See [deployment verification](popular-times-deployment.md) for current state and remaining checks. The review below records the pre-deployment assessment.

No Edge Function deployments, remote migrations or secret changes were performed in this hardening pass. Earlier cleanup removed BestTime runtime code and development's old functions/secrets; the obsolete database fields remain until the pending cleanup migration is approved.

## 1. Authentication

`get-popular-times` requires a Bearer session and the existing `withSupabase({auth:'user'})` validation. It additionally verifies the supplied token with Auth `getUser` and rejects anonymous Auth users. Missing/invalid/anonymous sessions return 401 with `A signed-in Supabase session is required`. CORS preflight remains available without authentication.

The React Native subscription calls the shared authenticated `supabase.functions.invoke`. The installed SDK reads the current session access token automatically; no client token override or service key was added. An SDK transport test confirms the Authorization header carries the supplied session token. User quota identity comes from the validated Auth user, never from request JSON.

## 2. Paid-trigger quota

Migration `20261004220526_popular_times_user_trigger_limits.sql` adds private `rate_limits(user_id, action, window_start, count)` and a fixed 10-per-hour atomic UPSERT. The service-only claim RPC now requires the authenticated user ID as its fourth argument. The old overload is removed to prevent bypass.

The transaction locks the Place ID (including absent rows), checks the cache, checks shared budget, consumes user quota, and creates a pending lease. Concurrent same-place callers cannot create duplicate leases or consume duplicate quota; different-place callers serialize the shared budget and atomically increment the user counter. SQL exceptions roll back quota, budget and claim together. Denied claims return 429 plus Retry-After, log the user UUID and scope, and never leave a new pending row. Another user can still fetch a venue denied to the first user. The fixed window resets one hour after its first accepted trigger.

Removed this endpoint's request-wide limiter. Fresh ready/no-data, pending and failed-in-backoff reads consume neither user quota nor global budget. Auth still applies. The global 250-launch UTC daily cap remains. These are launch-count limits, not a guaranteed currency cap; multiple accounts can still exhaust the shared budget.

## 3. Input validation

Only HTTPS URLs with exact `google.com`/`www.google.com` Maps paths or exact `maps.google.com` host are accepted. Credentials, nonstandard ports, unrelated hosts/paths, malformed IDs and oversized inputs are rejected with 400 (oversized bodies: 413). The forwarded URL is reconstructed from the canonical Place ID, so arbitrary caller paths/query parameters are never passed to Apify. Database matching requires a known active venue with that same ID.

Place IDs use a bounded URL-safe character check (5–255 characters); this is an application bound, not a claim that Google guarantees that size or a `ChIJ` prefix. Google's [Place ID documentation](https://developers.google.com/maps/documentation/places/web-service/place-id) describes variable formats and no maximum length.

## 4. RLS before/after

Before is the read-only development snapshot in `popular-times-rls-before.json` (project `xrracivlxgedlzdcrfwx`). After is the schema verified locally, **not a deployed state**.

| Table / access | Before (development) | After (local) |
| --- | --- | --- |
| venue_popular_times RLS | enabled | enabled |
| SELECT policy | `Authenticated users read shared popular times`, authenticated, USING(true) | unchanged |
| anon cache SELECT/INSERT/UPDATE/DELETE | denied | denied |
| authenticated cache SELECT | allowed | allowed |
| authenticated cache INSERT/UPDATE/DELETE | denied | denied |
| service_role cache SELECT/INSERT/UPDATE/DELETE | allowed | allowed |
| rate_limits | absent | RLS enabled, no client policies; service_role SELECT/INSERT/UPDATE/DELETE only |
| quota and claim functions | no user quota; old claim signature | EXECUTE revoked from PUBLIC/anon/authenticated; service_role only |

```diff
 venue_popular_times: ENABLE ROW LEVEL SECURITY
 SELECT TO authenticated USING (true)
 -- No policy/grant change to venue_popular_times was necessary.
+rate_limits: ENABLE ROW LEVEL SECURITY
+REVOKE ALL ON rate_limits FROM PUBLIC, anon, authenticated
+GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO service_role
+-- No client policies on rate_limits.
```

Database owners retain administrative access. The service role bypasses RLS server-side; the mobile app has only its public anon key plus user session. Actual SET ROLE tests verified cache SELECT succeeds and writes/quota access fail for authenticated clients.

## 5. Secrets audit

- Scanned 381 working-tree text files including local env files and 952 Git blobs reachable from all local refs. No actual Apify/BestTime credential values were found in working files or local Git history. References in server code, empty templates, tests and archived documentation are not credentials.
- Read-only `supabase secrets list` on development: **APIFY_TOKEN absent; no BestTime secret names remain**. It is therefore not accurate to claim a configured Apify token currently lives in secrets. Before deployment, configure it there securely. Production secrets were not inspected.
- Incidental finding: the same Google API key exists in ignored `.env:1` and `.env.production:3`. Its value is not reproduced here. No matching history candidate was found; the earlier generated web bundle scan did not contain it. Verify its API/application restrictions and keep any server-only key in Edge Function secrets.
- No history rewrites were performed. This is a pattern-based scan of available local refs, not proof about unreachable commits, other clones, remote-only branches, binary files or provider-side key status. Working-tree dependencies/vendor, symlinks and files over 10 MB were excluded.

## Local verification

- 118 Vitest tests passed; application TypeScript check passed.
- Scoped pipeline coverage: 100% statements/lines, 87.68% branches, 91.3% functions.
- Applied all four pipeline migrations to isolated PGlite PostgreSQL; all three SQL suites passed, covering cache/backoff, budget rollover, source ownership, quota exhaustion/reset, denied-row absence, other-user independence, permissions and removal of the bypass overload.
- PGlite is an isolated single-engine harness, not a multi-session load test. Independent simultaneous database-session testing and deployed JWT/Realtime/actor smoke tests remain staging checks after approval. No paid actor call was made.

Reproduce SQL checks without adding a mobile dependency:

```sh
npm install --prefix /tmp/left-popular-times-local-db --save-exact @electric-sql/pglite
node scripts/test-popular-times-sql.mjs /tmp/left-popular-times-local-db/node_modules/@electric-sql/pglite/dist/index.js
```

Pending review: migrations 0033, 0034 and 20261004220526, server secret provisioning, and Edge Function/app deployment. No deployment is authorized by this report.
