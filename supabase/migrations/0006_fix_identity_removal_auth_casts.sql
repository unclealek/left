create or replace function public.process_identity_removal_request(
  p_request_id uuid,
  p_requesting_user_id uuid default null
)
returns public.identity_removal_requests
language plpgsql
security definer
set search_path = public, auth
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
      updated_at = now()
  where id = v_request.profile_user_id;

  update auth.users
  set email = v_redacted_email,
      phone = null,
      raw_user_meta_data = '{}'::jsonb,
      raw_app_meta_data = jsonb_build_object('identity_removed', true),
      updated_at = now()
  where id = v_request.user_id;

  if to_regclass('auth.identities') is not null then
    execute 'delete from auth.identities where user_id = $1' using v_request.user_id;
  end if;

  if to_regclass('auth.sessions') is not null then
    execute 'delete from auth.sessions where user_id = $1' using v_request.user_id;
  end if;

  if to_regclass('auth.refresh_tokens') is not null then
    execute 'delete from auth.refresh_tokens where user_id = $1' using v_request.user_id::text;
  end if;

  if to_regclass('auth.one_time_tokens') is not null then
    execute 'delete from auth.one_time_tokens where user_id = $1' using v_request.user_id;
  end if;

  if to_regclass('auth.mfa_factors') is not null then
    execute 'delete from auth.mfa_factors where user_id = $1' using v_request.user_id;
  end if;

  if to_regclass('auth.mfa_amr_claims') is not null then
    execute 'delete from auth.mfa_amr_claims where user_id = $1' using v_request.user_id;
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

grant execute on function public.process_identity_removal_request(uuid, uuid) to service_role;
