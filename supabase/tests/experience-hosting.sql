-- Run against staging after migration 0026. All test data is rolled back.
begin;
select set_config('test.host', (select id::text from public.users where onboarding_completed and not public.is_admin_reviewer(id) limit 1), true);
select set_config('test.reviewer', (select user_id::text from public.admin_reviewers limit 1), true);
select set_config('test.venue', (select id::text from public.venues where is_active limit 1), true);
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', current_setting('test.host'), true);
do $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'test requires an onboarded non-reviewer'; end if;
  v_id := public.submit_experience_proposal(current_setting('test.venue')::uuid, 'Hosting integration check', 'Temporary transaction-only event for verifying the hosting lifecycle.', now()+interval '7 days', 6);
  perform set_config('test.event', v_id::text, true);
  if not exists(select 1 from public.experiences where id=v_id and host_user_id=auth.uid() and status='pending_review') then raise exception 'host ownership or pending status failed'; end if;
  if exists(select 1 from public.get_published_experiences(null) where id=v_id) then raise exception 'pending event leaked into discovery'; end if;
  begin
    perform public.review_experience(v_id, 'published');
    raise exception 'ordinary host unexpectedly published';
  exception when raise_exception then
    if sqlerrm <> 'not authorized to review experiences' then raise; end if;
  end;
  begin
    perform public.submit_experience_proposal(current_setting('test.venue')::uuid, 'Past event', 'This should fail because the event start is in the past.', now()-interval '1 day', 6);
    raise exception 'past event unexpectedly accepted';
  exception when raise_exception then
    if sqlerrm <> 'choose a future start time' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub', current_setting('test.reviewer'), true);
select public.review_experience(current_setting('test.event')::uuid, 'published');
select set_config('request.jwt.claim.sub', current_setting('test.host'), true);
do $$
begin
  if not exists(select 1 from public.get_published_experiences(null) where id=current_setting('test.event')::uuid) then raise exception 'published event not discoverable'; end if;
  if not public.set_experience_attendance(current_setting('test.event')::uuid, true) then raise exception 'joining failed'; end if;
  if public.set_experience_attendance(current_setting('test.event')::uuid, false) then raise exception 'leaving failed'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  begin
    perform public.submit_experience_proposal(current_setting('test.venue')::uuid, 'Anonymous event', 'Anonymous callers must not be able to submit a new event.', now()+interval '7 days', 6);
    raise exception 'anonymous submission unexpectedly accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
select 'PASS: host submission, ownership, pending privacy, reviewer authorization, future-time validation, publication, discovery, join/leave, anonymous denial; all test data rolled back' as result;
