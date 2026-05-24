# Identity Removal Policy

`LEFT` supports identity removal rather than full historical erasure.

## Removed

When an identity-removal request is processed, the system should remove or redact direct identity fields:

- auth email
- auth provider metadata
- auth login credentials / auth account linkage
- `public.users.first_name`
- `public.users.provider_subject`

## Retained

The current product policy intentionally retains selected product records:

- hints
- venue-linked history
- safety zones

These retained records should no longer expose direct identity fields after processing.

## Backend Expectations

The mobile client only creates a request record in `public.identity_removal_requests`.
Actual identity removal must be executed by a secure backend processor with privileged access.

That processor should:

1. Verify the request is eligible for processing.
2. Remove direct identity fields from auth and profile records.
3. Preserve allowed retained record classes under the current policy.
4. Mark the request as `completed` or `rejected` with processing notes.
