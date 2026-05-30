# Admin Safety Operations

Status:
- operational guide for reviewing user safety reports directly in Supabase

Scope:
- use this when reports are low-volume or handled by technical operators
- a dedicated admin UI is intentionally deferred until report volume or moderator staffing justifies it

Related implementation:
- [supabase/migrations/0001_left_mvp.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0001_left_mvp.sql)
- [supabase/migrations/0012_admin_reviewers.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0012_admin_reviewers.sql)
- [supabase/migrations/0013_safety_report_admin_review.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0013_safety_report_admin_review.sql)

## Operator Access

Safety review uses the same reviewer model as venue moderation:

- reviewer users live in `public.admin_reviewers`
- `public.is_admin_reviewer(auth.uid())` gates access
- only authenticated reviewer users can read `public.safety_report_review`
- only authenticated reviewer users can call `public.review_safety_report(...)`

The reviewer must exist in `auth.users` before being inserted into `public.admin_reviewers`. Admin-only email/password accounts do not need a matching `public.users` app profile row.

## Report Lifecycle

Report statuses:

- `pending`: submitted by a user and not reviewed yet
- `reviewing`: an operator has started review
- `resolved`: the report was reviewed and action was taken or no further action is needed
- `dismissed`: the report was reviewed and dismissed

Reports are created by the mobile app in `public.reports` with:

- reporter user id
- target user id
- optional presence session id
- category
- optional notes
- timestamp

The mobile app immediately hides the reported person from the reporter's current feed. Reporting does not automatically end the target user's session.

## Review Queue

Use this query in Supabase SQL editor:

```sql
select *
from public.safety_report_review
where status = 'pending'
order by reported_at desc;
```

The view includes:

- report id, status, category, notes, and moderation notes
- reporter and target user ids/names
- venue and presence session context when available
- session intent, vibes, hint, status, start, and expiry
- prior report count against the target
- related block, wave, and approach counts

## Mark Report Reviewing

```sql
select public.review_safety_report(
  'REPORT_UUID_HERE',
  'reviewing',
  'Initial review started.'
);
```

## Resolve Report

```sql
select public.review_safety_report(
  'REPORT_UUID_HERE',
  'resolved',
  'Reviewed. Action taken or no further action needed.'
);
```

## Dismiss Report

```sql
select public.review_safety_report(
  'REPORT_UUID_HERE',
  'dismissed',
  'Reviewed and dismissed.'
);
```

## Useful Follow-Up Queries

Reports against one target:

```sql
select *
from public.safety_report_review
where target_user_id = 'TARGET_USER_UUID_HERE'
order by reported_at desc;
```

Recent blocks involving one user:

```sql
select *
from public.blocks
where actor_user_id = 'USER_UUID_HERE'
   or target_user_id = 'USER_UUID_HERE'
order by created_at desc;
```

Presence session context:

```sql
select *
from public.presence_sessions
where id = 'PRESENCE_SESSION_UUID_HERE';
```

## Current Limitations

- There is no dedicated admin safety UI yet.
- There is no user suspension or ban table yet.
- Report review status does not automatically trigger enforcement actions.
- Review notes should avoid sensitive personal information beyond what is needed for moderation.
- RLS and integration tests should be added for the review view and function before scaling moderation beyond trusted operators.
