# Popular-times cleanup and security reassessment

> Deployment update: the approved migrations and functions are now deployed to development. See [deployment verification](popular-times-deployment.md) for current state and remaining checks. The review below records the pre-deployment assessment.

October 5, 2026. Scope: LEFT's venue activity path, Apify adapter, cache claims, Realtime client, development deployment and the npm runtime dependency tree. This is a targeted code/configuration review, not a penetration test or native-device acceptance test.

## Removal completed

- Removed all BestTime runtime implementation, response normalization, polling/rollback branches, source enum values, provider-only tests, and obsolete local environment settings.
- Deployed the tested presence-only `venue-activity` function to development (`xrracivlxgedlzdcrfwx`).
- Deleted development's `initialize-besttime-venue` and `refresh-besttime-activity` functions and four BestTime secrets (private key, provider mode, mock forecast, mock timezone). No credential values were printed. Removing the stored credential is not revocation at the external provider account.
- Historical migrations 0020/0027 remain intact. Prepared 0034 to drop the old activity cache, its refresh RPC and three provider-specific venue columns without dropping generic venue timezone/address or presence data. It is not applied.
- Current runtime source/config scans contain no BestTime references; historical audit/design documents are explicitly archived.

## Findings and changes

| Priority | Finding | Treatment and current status |
| --- | --- | --- |
| Medium | Per-user request throttling does not bound paid runs across many distinct venues/accounts. | Prepared 0033: atomic shared budget, default 250 Google actor launches per UTC day. Only winning claims consume budget; fresh/pending/backoff rows do not. The new endpoint calls the budgeted RPC and fails closed until it exists. **Not active until migration/deployment.** |
| Medium | Request JSON and provider responses lacked explicit allocation limits. | Added streamed byte limits: 4 KiB authenticated request bodies, 128 KiB provider responses, bounded body-read time, and reader cancellation on failure. Applied to local popular-times endpoint and deployed presence endpoint. Tests include missing/falsified Content-Length and stalled streams. |
| Low | Failure persistence could itself reject, leaving an unhandled background error with SDK details. | Catch database/transport failures inside failure handling; emit only a fixed message and let lease recovery handle state. Verified with a rejecting transport test. Local worker change awaits deployment. |
| Low | An expired first-party pending row could be marked failed by a Google claim before the source-ownership check. | 0033 checks source ownership before changing lease state and validates the canonical venue identity inside the service-only RPC. SQL regression checks now pass in isolated local PostgreSQL (PGlite). |
| Hardening | Overbroad Maps path validation and future accidental response-field exposure. | Require `/maps` or `/maps/…` on google.com/www.google.com, or the exact maps.google.com host; reject provider HTTP redirects, whitelist HTTP output fields. The prior implementation already reconstructed URLs from Place ID, so the path looseness was not an arbitrary-URL SSRF path. |
| Existing dependency risk | npm audit flagged 43 dependency-tree entries (29 high/14 moderate) before cleanup. | Compatible updates changed 13 transitive packages. The follow-up audit reports 37 entries (24 high/13 moderate), no critical entries. Remaining findings are recorded below. No forced Expo/React Native major upgrade was performed. |

The daily cap bounds launch count, not an exact bill. It also cannot stop an authenticated abuser consuming the available shared budget and denying fresh data to other users. The new per-user trigger quota supplements the shared cap; cache hits are unlimited. account controls and provider billing settings are additional operational controls.

## Controls verified

- Final development verification: no BestTime function or secret names remain; presence endpoint version 12 rejects an unauthenticated request with HTTP 401. Existing server-only secret values were checked against the generated web export and were not found.
- Development database: RLS enabled; anonymous cache reads denied; authenticated cache inserts/updates/deletes and direct claim execution denied; service claim execution allowed; Realtime publication includes the cache.
- New paid fetches require a known active canonical venue. Client-supplied URLs are never forwarded unchanged; Place ID determines the Maps URL and cache key.
- APIFY_TOKEN is not configured in development; the adapter reads it only server-side, sent as a bearer header to a fixed API origin, never returned in app state or logged by the adapter.
- Malformed histograms, invalid hour/score ranges, duplicate hours, mismatched returned Place IDs, oversized payloads and invalid duration types are rejected. Honest `has_data=false` remains cached for fourteen days.
- Background writes retain claim-token and pending-status predicates; provider failures back off for twenty-four hours. No live actor calls were made by tests.
- Realtime subscriptions are shared and released; initial subscription races and stale HTTP response races are regression-tested. Public aggregate venue activity is intentionally readable by authenticated users; it contains no user presence identities.

Supabase documents that [background tasks remain subject to worker limits](https://supabase.com/docs/guides/functions/background-tasks), which is why failure/backoff and lease recovery remain necessary. [Postgres Changes uses publication configuration and RLS](https://supabase.com/docs/guides/realtime/postgres-changes); both were inspected on development.

## Validation and outstanding deployment work

- All 118 tests pass; app TypeScript and independent new-backend-helper TypeScript checks pass.
- Scoped pipeline coverage: 100% lines/statements, 87.68% branches, 91.3% functions. This scope includes the provider, worker, bounded JSON reader, endpoint, model and subscription controller; it does not claim React hook rendering or native-device coverage.
- Expo production web export passes after the transitive dependency updates, exercising bundle resolution and SVG/assets. Native device testing remains separate.
- Migrations 0033, 0034 and 20261004220526 await review before remote execution. All three popular-times SQL suites pass locally; independent two-session contention checks remain a staging verification. Migration 0032 was previously applied and verified.
- Development has no APIFY_TOKEN and no deployed get-popular-times. Configure that secret securely, then deploy the popular-times endpoint and updated venue-details after all pending migrations. No production deployment or database change was made in this cleanup.

## Remaining dependency advisories

Counts are affected package entries, not 37 distinct exploits in the mobile runtime. The production dependency tree includes Expo/RN build tooling. Exploit reachability was not established for each transitive package; a clean audit is not claimed. Some suggested remediations require major SDK/native changes or have no offered fix. The list below captures npm's remaining direct advisory sources; parent package entries inherit these findings.

| Package | Severity | npm remediation | Advisories |
| --- | --- | --- | --- |
| braces | high | react-native 0.87.1 (major change) | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) |
| image-size | high | Update dependency chain within supported constraints | [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) |
| node-forge | high | No offered fix | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) |
| postcss | high | No offered fix | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q), [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) |
| uuid | moderate | expo-dev-client 57.0.19 (major change) | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) |
