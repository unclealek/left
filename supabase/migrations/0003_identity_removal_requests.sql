alter table public.account_deletion_requests
rename to identity_removal_requests;

alter index public.account_deletion_requests_user_idx
rename to identity_removal_requests_user_idx;

alter index public.account_deletion_requests_one_open_request_idx
rename to identity_removal_requests_one_open_request_idx;

drop policy "users can read own deletion requests" on public.identity_removal_requests;
drop policy "users can insert own deletion requests" on public.identity_removal_requests;

alter table public.identity_removal_requests
rename column requested_email to contact_email;

alter table public.identity_removal_requests
rename column requested_name to contact_name;

alter table public.identity_removal_requests
add column request_kind text not null default 'identity_removal'
check (request_kind = 'identity_removal');

alter table public.identity_removal_requests
add column identity_fields_to_remove text[] not null default array[
  'email',
  'first_name',
  'provider_subject',
  'auth_provider_metadata',
  'direct_auth_credentials'
];

alter table public.identity_removal_requests
add column retained_record_classes text[] not null default array[
  'hints',
  'venue_history',
  'safety_zones'
];

alter table public.identity_removal_requests
add column processing_notes text;

create policy "users can read own identity removal requests"
on public.identity_removal_requests for select
using (auth.uid() = user_id);

create policy "users can insert own identity removal requests"
on public.identity_removal_requests for insert
with check (auth.uid() = user_id and auth.uid() = profile_user_id);

grant select, insert on public.identity_removal_requests to authenticated;
