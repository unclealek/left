# Guest browsing and reviewed gathering links

Implemented locally on 2026-10-12. No backend migration/deployment, associated-domain change, public hosting or new TestFlight build has been performed for this feature.

## Mobile behavior

- Auth offers **Explore as a guest**, opening a separate `GuestApp` without an anonymous Auth sign-in. It does not mount member presence/attendance/hosting/profile workflows or request location permission.
- Guests can browse a Home preview, an explicitly illustrative venue page, gathering information from an approved shared link, and a profile introduction. Member profiles and presence are not fetched. Actions to host, attend, save or become visible open sign-in. A dedicated non-persistent anon-key client can read only the proposed single-gathering RPC; it has no stored member session.
- Approved, upcoming plans in **Your plans** gain a Share button once `EXPO_PUBLIC_GATHERING_SHARE_ORIGIN` is configured. Published detail pages can also share. Pending/rejected/cancelled/expired plans never receive a share action. Hosts can refresh Your plans to see approval changes.
- The hosting form offers Free, Buy your own, Per person, Split costs, Potluck and Other. Potluck suggestions cover dishes, snacks, drinks and dessert; typed details remain. Expected EUR amounts use ±€1 controls and an editable decimal input, bounded to €0–€1,000. Existing `cost_notes` stores the readable result, so no cost schema migration is needed. It is an expected-spend note, not payment collection.

## Sharing contract

The 22-character URL-safe code reversibly encodes the gathering UUID (no secret or identity token). Public URLs have `/g/<code>`; app links use `left://g/<code>`. Only the configured HTTPS origin and canonical app path are accepted. OAuth URLs are ignored by this handler.

Signed-in recipients use the existing authenticated published-gathering query, preserving blocking/hidden-user rules. Signed-out recipients use the guest preview. The proposed public preview omits host IDs/name and participant identities, and includes only title, description, venue, schedule, capacity, aggregate attendance, cost and accessibility notes. Approved gathering content becomes public to anyone who has its link; it must not contain private host/contact information. Cancelling, rejection, expiry, inactive venues or removed hosts revoke new reads. Pages use `Cache-Control: no-store`.

The migration `supabase/migrations/20261012164051_guest_shared_gathering_preview.sql` adds one fixed-search-path, read-only SECURITY DEFINER RPC with anon/authenticated EXECUTE. It changes no existing rows, grants no table privileges and adds no write capability. It has been tested in an isolated PostgreSQL runtime, **not applied** to staging.

`shared-gathering` is a deliberately public GET-only Edge Function, configured with `verify_jwt=false` because the web page must open without a login. It uses the anon key, never the service role. It rejects invalid codes/queries and mutation methods, escapes rendered content, applies restrictive CSP, and hides database errors. It must be deployed only after the reviewed migration is applied.

## Required setup before live links

1. Obtain explicit user approval before applying the prepared migration to staging, following the user's existing migration preference. Then verify anon preview and denied writes against real staging, with reviewed disposable fixtures.
2. Choose the HTTPS share origin and route `/g/<code>` to the `shared-gathering` function, preserving the code as the last path segment. Confirm host/proxy request limits and HTTPS. Do not expose draft/admin pages.
3. Provide `LEFT_DOWNLOAD_URL` as an actual public TestFlight invitation or public App Store listing. The App Store Connect record alone is not a publicly downloadable link. Without this variable the landing page intentionally says download access is coming soon.
4. Set `EXPO_PUBLIC_GATHERING_SHARE_ORIGIN` in the intended EAS environment only after public hosting works. An empty value leaves share controls unavailable, avoiding broken links.
5. Serve `web/gathering/.well-known/apple-app-site-association` as JSON at the share domain's `/.well-known/apple-app-site-association`, without an authentication challenge or redirect.
6. Run `node scripts/configure-gathering-links.mjs https://<chosen-domain>` to add the real associated domain to Expo and checked-in iOS entitlements. This script edits local config only. Review entitlements, renew the matching provisioning profile, then build. Verify on a physical device using Apple's [universal link setup](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app).
7. Verify installed-app links, fresh-install download fallback, guest preview, sign-in return to the shared plan, and all guest action gates. Installing from the store/TestFlight does **not** automatically recover the original event link: the landing page tells the recipient to return and tap Open LEFT. Deferred-install deep linking is not implemented or claimed.

## Validation

- 253 tests across 46 files, TypeScript and diff checks pass. Feature helper coverage exceeds 80 percent for statements, branches, functions and lines.
- Local SQL checks cover published/future filtering, pending/rejected/cancelled/completed/draft exclusion, removed hosts, inactive venues, omitted host/attendee identities and denied anon table reads/writes.
- Guest component tests exercise hosting, save, primary venue action and attendance gates. Service tests verify one read RPC, no persistent session and safe error handling.
- iPhone 18 Pro temporary previews showed guest Home/venue browsing, potluck suggestions and paid amount controls; tapping + changed €5 to €6. No proposal was submitted. Previews were removed and the normal app restored.
- Public host, live guest RPC, universal links, download flow and physical-device/TestFlight behavior remain unverified until the setup above is completed.
