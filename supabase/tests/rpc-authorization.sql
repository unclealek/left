-- Synthetic users only; every fixture and mutation is rolled back.
begin;
create temp table rpc_fixture(a uuid,b uuid,v uuid,other_v uuid,sa uuid,sb uuid,attempt uuid,experience uuid);
insert into rpc_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on rpc_fixture to authenticated;
insert into auth.users(id) select a from rpc_fixture union all select b from rpc_fixture;
insert into public.users(id,auth_provider,provider_subject,first_name,avatar_style)
 select a,'google'::public.auth_provider,a::text,'User A','minimal'::public.avatar_style from rpc_fixture union all
 select b,'google'::public.auth_provider,b::text,'User B','minimal'::public.avatar_style from rpc_fixture;
insert into public.venues(id,name,geofence_json,latitude,longitude)
 select v,'RPC test','{}'::jsonb,60.17,24.94 from rpc_fixture union all
 select other_v,'Other RPC test','{}'::jsonb,60.17,24.94 from rpc_fixture;
insert into public.presence_sessions(id,user_id,venue_id,intent,vibes,status,started_at,expires_at)
 select sa,a,other_v,'casual_chat'::public.intent_type,'{}'::text[],'visible'::public.presence_status,now(),now()+interval '30 minutes' from rpc_fixture union all
 select sb,b,v,'casual_chat'::public.intent_type,'{}'::text[],'visible'::public.presence_status,now(),now()+interval '30 minutes' from rpc_fixture;
insert into public.approach_attempts(id,from_user_id,to_user_id,presence_session_id,started_at,expires_at)
 select attempt,b,a,sa,now(),now()+interval '1 minute' from rpc_fixture;
insert into public.saved_venues(user_id,venue_id) select b,v from rpc_fixture;
insert into public.experiences(id,host_user_id,venue_id,title,description,starts_at,capacity,status)
 select experience,b,v,'Security fixture','Synthetic authorization fixture only',now()+interval '1 day',3,'published' from rpc_fixture;
select set_config('request.jwt.claim.sub',(select a::text from rpc_fixture),true);
set local role authenticated;
do $$
declare owned uuid;
begin
 if public.end_presence_session((select sb from rpc_fixture),'session_ended') then raise exception 'ended other user session'; end if;
 if public.finish_approach_attempt((select attempt from rpc_fixture),'connected') then raise exception 'finished other user approach'; end if;
 if exists(select 1 from public.get_nearby_feed((select b from rpc_fixture),(select v from rpc_fixture))) then raise exception 'spoofed viewer accepted'; end if;
 if exists(select 1 from public.get_current_venue_context((select v from rpc_fixture))) then raise exception 'context without presence'; end if;
 if exists(select 1 from public.get_saved_venues()) then raise exception 'other user saved venue leaked'; end if;
 if not public.consume_api_rate_limit('venue-details') then raise exception 'fresh user quota rejected'; end if;
 begin
  perform public.start_approach_attempt((select sb from rpc_fixture));
  raise exception 'remote approach accepted';
 exception when raise_exception then
  if sqlerrm <> 'you must be visible at the same venue' then raise; end if;
 end;
 begin
  perform public.record_social_interaction_event('approach_cancelled',(select b from rpc_fixture),(select sb from rpc_fixture),'{}');
  raise exception 'event attached to other user session';
 exception when raise_exception then
  if sqlerrm <> 'invalid visibility session' then raise; end if;
 end;
 if not public.record_social_interaction_event('approach_cancelled',(select b from rpc_fixture),(select sa from rpc_fixture),'{}') then raise exception 'own event rejected'; end if;
 begin
  perform public.review_experience((select experience from rpc_fixture),'published',null);
  raise exception 'ordinary user reviewed experience';
 exception when raise_exception then
  if sqlerrm <> 'not authorized to review experiences' then raise; end if;
 end;
 if not exists(select 1 from public.get_published_experiences(array[(select v from rpc_fixture)]) where id=(select experience from rpc_fixture)) then raise exception 'published experience unavailable'; end if;
 if not public.set_experience_attendance((select experience from rpc_fixture),true) then raise exception 'own attendance rejected'; end if;
 if public.set_experience_attendance((select experience from rpc_fixture),false) then raise exception 'attendance removal failed'; end if;
 if has_function_privilege('authenticated','public.approve_venue_submission(uuid,uuid)','execute') or has_function_privilege('authenticated','public.reject_venue_submission(uuid)','execute') then raise exception 'retired review RPC exposed'; end if;
 begin
  perform public.record_current_legal_acceptance('invalid-test-version','invalid-test-version','invalid-test-version');
  raise exception 'invalid legal versions accepted';
 exception when raise_exception then
  if sqlerrm <> 'legal document versions are not current' then raise; end if;
 end;
end;
$$;
reset role;
-- Verify attribution as database owner rather than relying on client RLS to hide mistakes.
do $$
begin
 if exists(select 1 from public.api_request_limits where user_id=(select b from rpc_fixture)) then raise exception 'quota charged another user'; end if;
 if not exists(select 1 from public.api_request_limits where user_id=(select a from rpc_fixture) and endpoint='venue-details') then raise exception 'quota attribution absent'; end if;
 if exists(select 1 from public.social_interaction_events where actor_user_id=(select b from rpc_fixture)) then raise exception 'event attributed to another user'; end if;
 if not exists(select 1 from public.social_interaction_events where actor_user_id=(select a from rpc_fixture) and visibility_session_id=(select sa from rpc_fixture)) then raise exception 'event attribution absent'; end if;
end;
$$;
update public.presence_sessions set venue_id=(select v from rpc_fixture) where id=(select sa from rpc_fixture);
set local role authenticated;
do $$
declare approach uuid;
begin
 if not exists(select 1 from public.get_current_venue_context((select v from rpc_fixture))) then raise exception 'own context unavailable'; end if;
 if not exists(select 1 from public.get_nearby_feed((select a from rpc_fixture),(select v from rpc_fixture)) where profile_user_id=(select b from rpc_fixture)) then raise exception 'legitimate nearby feed broken'; end if;
 select approach_id into approach from public.start_approach_attempt((select sb from rpc_fixture));
 if not public.finish_approach_attempt(approach,'cancelled') then raise exception 'own approach completion broken'; end if;
end;
$$;
reset role;
insert into public.blocks(actor_user_id,target_user_id) select b,a from rpc_fixture;
set local role authenticated;
do $$
begin
 if exists(select 1 from public.get_published_experiences(array[(select v from rpc_fixture)]) where id=(select experience from rpc_fixture)) then raise exception 'blocked host visible'; end if;
 if exists(select 1 from public.get_nearby_feed((select a from rpc_fixture),(select v from rpc_fixture)) where profile_user_id=(select b from rpc_fixture)) then raise exception 'blocked profile visible'; end if;
 begin
  perform public.set_experience_attendance((select experience from rpc_fixture),true);
  raise exception 'blocked attendance accepted';
 exception when raise_exception then
  if sqlerrm <> 'experience is not available' then raise; end if;
 end;
 begin
  perform public.start_approach_attempt((select sb from rpc_fixture));
  raise exception 'blocked approach accepted';
 exception when raise_exception then
  if sqlerrm <> 'target unavailable' then raise; end if;
 end;
end;
$$;
reset role;
rollback;
