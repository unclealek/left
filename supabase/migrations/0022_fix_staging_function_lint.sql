-- Fix staging schema-lint errors in identity removal and safety review functions.

create or replace function public.process_identity_removal_request(
  p_request_id uuid,
  p_requesting_user_id uuid default null
)
returns public.identity_removal_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.identity_removal_requests%rowtype;
  v_redacted_email text;
begin
  select *
  into v_request
  from public.identity_removal_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'identity removal request not found';
  end if;

  if p_requesting_user_id is not null and v_request.user_id <> p_requesting_user_id then
    raise exception 'identity removal request does not belong to requesting user';
  end if;

  if v_request.status not in ('pending', 'processing') then
    raise exception 'identity removal request is not processable from status %', v_request.status;
  end if;

  update public.identity_removal_requests
  set status = 'processing',
      failure_reason = null,
      processing_notes = 'Removing direct identity fields while retaining policy-approved records.'
  where id = v_request.id;

  v_redacted_email := 'identity-removed+' || replace(v_request.id::text, '-', '') || '@left.invalid';

  update public.users
  set first_name = 'Removed User',
      provider_subject = 'identity-removed-' || id::text,
      identity_removed = true,
      updated_at = now()
  where id = v_request.profile_user_id;

  update auth.users
  set email = v_redacted_email,
      phone = null,
      raw_user_meta_data = '{}'::jsonb,
      raw_app_meta_data = jsonb_build_object('identity_removed', true),
      updated_at = now()
  where id = v_request.user_id;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'identities' and column_name = 'user_id'
  ) then
    execute 'delete from auth.identities where user_id = $1' using v_request.user_id;
  end if;

  -- Current Supabase auth schemas associate MFA AMR claims through session_id,
  -- not a direct user_id. Remove those claims before deleting their sessions.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'mfa_amr_claims' and column_name = 'session_id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'user_id'
  ) then
    execute '
      delete from auth.mfa_amr_claims as amr
      using auth.sessions as auth_session
      where amr.session_id = auth_session.id
        and auth_session.user_id = $1
    ' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'sessions' and column_name = 'user_id'
  ) then
    execute 'delete from auth.sessions where user_id = $1' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'refresh_tokens' and column_name = 'user_id'
  ) then
    execute 'delete from auth.refresh_tokens where user_id = $1' using v_request.user_id::text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'one_time_tokens' and column_name = 'user_id'
  ) then
    execute 'delete from auth.one_time_tokens where user_id = $1' using v_request.user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'mfa_factors' and column_name = 'user_id'
  ) then
    execute 'delete from auth.mfa_factors where user_id = $1' using v_request.user_id;
  end if;

  update public.identity_removal_requests
  set status = 'completed',
      processed_at = now(),
      failure_reason = null,
      contact_email = v_redacted_email,
      contact_name = null,
      processing_notes = 'Completed identity removal. Direct identity fields were removed; hints, venue history, and safety zones were retained per policy.'
  where id = v_request.id;

  return (
    select irr
    from public.identity_removal_requests irr
    where irr.id = v_request.id
  );
exception
  when others then
    update public.identity_removal_requests
    set status = 'rejected',
        processed_at = now(),
        failure_reason = sqlerrm,
        processing_notes = 'Identity removal failed during backend processing.'
    where id = p_request_id;
    raise;
end;
$$;

revoke all on function public.process_identity_removal_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.process_identity_removal_request(uuid, uuid) to service_role;

create or replace function public.review_safety_report(
  report_id uuid,
  next_status public.safety_report_status,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $review_safety_report$
<<review_safety_report_body>>
begin
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review safety reports';
  end if;

  update public.reports as target_report
  set status = review_safety_report_body.next_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      moderation_notes = nullif(trim(review_safety_report_body.notes), '')
  where target_report.id = review_safety_report_body.report_id;

  if not found then
    raise exception 'safety report % not found', review_safety_report_body.report_id;
  end if;
end review_safety_report_body;
$review_safety_report$;

revoke all on function public.review_safety_report(uuid, public.safety_report_status, text) from public, anon;
grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to authenticated;
grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to service_role;
