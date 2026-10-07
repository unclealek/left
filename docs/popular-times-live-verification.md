# Live popular-times verification

Verified against **left-staging** (`xrracivlxgedlzdcrfwx`) on October 6, 2026.

## Passed over the actual network

`npm run test:popular-times:live` creates a disposable confirmed Auth user, signs
in through the real password endpoint, and uses that user's JWT for client calls.
The service key is fetched from the existing Supabase CLI login into memory only,
for fixture setup and cleanup. It is not used as the client identity.

Six checks passed:

1. Real Auth sign-in yields a non-anonymous session.
2. The deployed Edge Function rejects missing and malformed JWTs with 401.
3. Signed-in HTTP calls reach the handler: invalid input returns 400, unknown venue 404.
4. A pending cache fixture returns 200 without the internal claim token in HTTP output.
5. An authenticated WebSocket receives an actual Postgres UPDATE. The application's
   `createPopularTimesSubscriptions` implementation also transitions from pending
   to ready. The ready row is written by the fixture harness, **not Apify**.
6. Eight concurrent HTTP cache reads return ready and create no trigger quota row.

Cleanup removed the synthetic cache row, signed out the session, and deleted the
disposable Auth user. No real venue was changed and no paid request was made.

The first live attempt passed the first four checks but timed out waiting for the
Realtime update. Service logs showed tenant initialization and replication startup
around that attempt. The instrumented rerun passed after verifying the update
affected exactly one row and allowing 60 seconds for the raw event. This is evidence
of a successful live run, **not proof that cold-start delivery cannot fail**.

## Remaining: real provider and mobile acceptance

The last inspected staging secret list had no `APIFY_TOKEN`. Therefore the real
HTTP → claim → background worker → Apify → cache → Realtime chain remains unverified.
The default smoke test explicitly prints `NOT RUN` for this path.

Configure a real token in staging's Edge Function secrets, then select a known,
active venue with no existing popular-times cache entry and run:

```sh
npm run test:popular-times:live -- --allow-paid --paid-place-id=GOOGLE_PLACE_ID
```

This explicitly permits a paid provider request. The test refuses to remove or
expire an existing cache, subscribes before the trigger, requires a pending HTTP
response followed by a ready `google_scrape` Realtime update, checks a subsequent
HTTP cache read and a single user quota increment. A `failed` update or timeout
fails the test. The resulting real cache and global budget usage remain intact;
they are not synthetic reservations and must not be refunded.

`ready` with `has_data=false` validates a completed no-data result, not a populated
histogram. This Node-based test uses the production subscription module but does
not render the mobile UI or validate device networking/lifecycle behavior.

Requires a modern Node version with TypeScript stripping (verified on Node 26),
installed project dependencies, a Supabase CLI login with staging access, and the
existing staging project link. Production project refs are rejected.
