begin;
create temp table removal_fixture(u uuid, v uuid, p uuid, r uuid);
insert into removal_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on removal_fixture to authenticated;
insert into auth.users(id) select u from removal_fixture;
insert into public.users(id,auth_provider,provider_subject,first_name,avatar_style,profile_prompt,approach_prompt)
select u,'apple',u::text,'Removal test','minimal','private prompt','private approach' from removal_fixture;
insert into public.venues(id,name,geofence_json,latitude,longitude) select v,'Removal fixture','{}',60.17,24.94 from removal_fixture;
insert into public.presence_sessions(id,user_id,venue_id,intent,vibes,status,started_at,expires_at,hint_text)
select p,u,v,'casual_chat','{}','visible',now(),now()+interval '30 minutes','private hint' from removal_fixture;
insert into public.identity_removal_requests(id,user_id,profile_user_id,contact_email,contact_name,auth_provider)
select r,u,u,'fixture@example.invalid','Removal test','apple' from removal_fixture;
select set_config('request.jwt.claim.sub',(select u::text from removal_fixture),true);
set local role authenticated;
do $$ begin
  begin
    update public.users set identity_removed=true where id=(select u from removal_fixture);
    raise exception 'client modified removal state';
  exception when insufficient_privilege then null; end;
  if not exists(select 1 from public.users) then raise exception 'active user read broken'; end if;
end $$;
reset role;
select public.process_identity_removal_request(r,u) from removal_fixture;
-- Preserve the same JWT subject to simulate a previously issued, unexpired token.
set local role authenticated;
do $$ begin
  if exists(select 1 from public.users) then raise exception 'removed JWT can read profile'; end if;
  if exists(select 1 from public.presence_sessions) then raise exception 'removed JWT can read presence'; end if;
  if exists(select 1 from public.get_saved_venues()) then raise exception 'removed JWT can call read RPC'; end if;
  begin
    perform public.start_presence_session((select v from removal_fixture),'casual_chat','{}',null,60.17,24.94,30);
    raise exception 'removed JWT can start presence';
  exception when insufficient_privilege then null; end;
  update public.users set identity_removed=false where id=(select u from removal_fixture);
  if found then raise exception 'removed JWT reset removal state'; end if;
end $$;
reset role;
do $$ begin
  if exists(select 1 from public.presence_sessions where id=(select p from removal_fixture) and (ended_at is null or hint_text is not null)) then
    raise exception 'removal did not end and redact presence'; end if;
  if exists(select 1 from public.users where id=(select u from removal_fixture) and (not identity_removed or profile_prompt<>'Removed' or approach_prompt<>'Removed')) then
    raise exception 'removal did not protect and clear profile'; end if;
end $$;
rollback;
