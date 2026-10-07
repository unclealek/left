begin;
create temp table location_fixture(u uuid,v uuid,missing_v uuid);
insert into location_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on location_fixture to authenticated;
insert into auth.users(id) select u from location_fixture;
insert into public.users(id,auth_provider,provider_subject,first_name,avatar_style) select u,'google',u::text,'Location test','minimal' from location_fixture;
insert into public.venues(id,name,geofence_json,latitude,longitude)
 select v,'Location fixture','{"center":{"latitude":60.17,"longitude":24.94},"radius_meters":60}',60.17,24.94 from location_fixture;
insert into public.venues(id,name,geofence_json) select missing_v,'Missing center fixture','{}' from location_fixture;
select set_config('request.jwt.claim.sub',(select u::text from location_fixture),true);
set local role authenticated;
do $$
declare lat double precision; lng double precision; venue uuid; session_id uuid;
begin
 for lat,lng in select * from (values(null::double precision,24.94::double precision),(60.17,null),(null,null),('NaN'::double precision,24.94),('Infinity'::double precision,24.94),(91,24.94),(60.17,181)) coords loop
  begin
   perform public.start_presence_session((select v from location_fixture),'casual_chat','{}',null,lat,lng,30);
   raise exception 'invalid location accepted';
  exception when raise_exception then
   if sqlerrm <> 'invalid location' then raise; end if;
  end;
 end loop;
 begin
  perform public.start_presence_session((select missing_v from location_fixture),'casual_chat','{}',null,60.17,24.94,30);
  raise exception 'venue without coordinates accepted';
 exception when raise_exception then
  if sqlerrm <> 'venue location unavailable' then raise; end if;
 end;
 begin
  perform public.start_presence_session((select v from location_fixture),'casual_chat','{}',null,0,0,30);
  raise exception 'remote location accepted';
 exception when raise_exception then
  if sqlerrm <> 'you must be near this venue' then raise; end if;
 end;
 session_id:=public.start_presence_session((select v from location_fixture),'casual_chat','{}',null,60.17,24.94,30);
 if session_id is null then raise exception 'valid location rejected'; end if;
 begin
  perform public.end_presence_session(session_id,null);
  raise exception 'null end status accepted';
 exception when raise_exception then
  if sqlerrm <> 'invalid end status' then raise; end if;
 end;
 if not public.end_presence_session(session_id,'session_ended') then raise exception 'owner end failed'; end if;
end;
$$;
reset role;
rollback;
