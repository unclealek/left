# Event hosting

The signed-in mobile user can propose a gathering at an active saved venue after completing their profile. No additional API key or administrator password is needed. The submission RPC derives ownership from the authenticated session and enforces a future start time. Existing database constraints validate title, description, capacity and notes.

Open **Host something small** on Home. Enter the venue, title, description, schedule and group size, then submit for review. Reopen this screen to see **Your plans**, including pending, published and rejected status. Session, profile and invalid-venue failures now show actionable messages without losing the form.

A reviewer signs into the existing admin application for the same Supabase project and approves or rejects the proposal in the gathering review queue. Normal hosts cannot publish their own events. After approval, upcoming events appear for people browsing the relevant nearby venue, respecting existing block and hide rules. Attendance uses the existing capacity-checked join/leave function.

## Deployment and verification

Migration 0026 was applied to staging (`xrracivlxgedlzdcrfwx`), the local mobile and admin development target. Production remains a separate deployment.

The rollback-only integration check is `supabase/tests/experience-hosting.sql`. Run it with the authenticated Supabase CLI against staging. It needs an onboarded non-reviewer, a reviewer, and an active venue. It verifies submission, ownership, pending privacy, unauthorized publication denial, future-time validation, reviewer approval, discovery, join/leave and anonymous denial. No test event survives the transaction.

The mobile service tests cover server-derived identity, invalid schedules, profile/session errors and confirmed submission. No private credential is added to the app or Git.
