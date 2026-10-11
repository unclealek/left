begin;
create temp table action_fixture(u uuid,v uuid);
insert into action_fixture values(gen_random_uuid(),gen_random_uuid());
grant select on action_fixture to authenticated;
insert into auth.users(id) select u from action_fixture;
insert into public.users(id,auth_provider,provider_subject,first_name,avatar_style,onboarding_completed)
select u,'google',u::text,'Action fixture','minimal',true from action_fixture;
insert into public.venues(id,name,geofence_json,latitude,longitude)
select v,'Action fixture','{"radius_meters":120}',60.17,24.94 from action_fixture;
select set_config('request.jwt.claim.sub',(select u::text from action_fixture),true);
set local role authenticated;
do $$
declare result uuid;
begin
 if exists(select id from public.venues where id=(select v from action_fixture)) then raise exception 'venue catalog exposed'; end if;
 result := public.start_presence_session((select v from action_fixture),'casual_chat',array_fill('Open'::text,array[12]),'Blue cap',60.17,24.94,30);
 if result is null then raise exception 'twelve profile vibes rejected'; end if;
 begin
  perform public.start_presence_session((select v from action_fixture),'casual_chat',array_fill('Open'::text,array[13]),'Blue cap',60.17,24.94,30);
  raise exception 'oversized vibes accepted';
 exception when raise_exception then if sqlerrm <> 'too many vibes' then raise; end if; end;
 result := public.submit_experience_proposal((select v from action_fixture),'Friendly coffee','Meet for coffee and conversation',now()+interval '1 day',8,'','');
 if not exists(select 1 from public.experiences where id=result and host_user_id=auth.uid() and status='pending_review') then raise exception 'proposal not owned and pending'; end if;
 begin
  perform public.submit_experience_proposal(gen_random_uuid(),'Friendly coffee','Meet for coffee and conversation',now()+interval '1 day',8,'','');
  raise exception 'unknown venue accepted';
 exception when raise_exception then if sqlerrm <> 'choose an active venue' then raise; end if; end;
end $$;
reset role;
update public.venues set is_active=false where id=(select v from action_fixture);
set local role authenticated;
do $$ begin
 if security_private.venue_accepts_proposals((select v from action_fixture)) then raise exception 'inactive venue accepted'; end if;
end $$;
reset role;
update public.venues set is_active=true where id=(select v from action_fixture);
update auth.users set raw_app_meta_data='{"identity_removed":true}' where id=(select u from action_fixture);
set local role authenticated;
do $$ begin
 if security_private.venue_accepts_proposals((select v from action_fixture)) then raise exception 'removed account accepted'; end if;
end $$;
reset role;
rollback;
