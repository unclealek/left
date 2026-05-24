create type deletion_request_status as enum (
  'pending',
  'processing',
  'completed',
  'rejected',
  'cancelled'
);

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_user_id uuid references public.users(id) on delete set null,
  requested_email text not null,
  requested_name text,
  auth_provider auth_provider,
  payload jsonb not null default '{}'::jsonb,
  status deletion_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  failure_reason text
);

create index account_deletion_requests_user_idx
on public.account_deletion_requests (user_id, requested_at desc);

create unique index account_deletion_requests_one_open_request_idx
on public.account_deletion_requests (user_id)
where status in ('pending', 'processing');

alter table public.account_deletion_requests enable row level security;

create policy "users can read own deletion requests"
on public.account_deletion_requests for select
using (auth.uid() = user_id);

create policy "users can insert own deletion requests"
on public.account_deletion_requests for insert
with check (auth.uid() = user_id and auth.uid() = profile_user_id);

grant select, insert on public.account_deletion_requests to authenticated;
