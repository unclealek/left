-- Transactional development regression: all fixtures and changes roll back.
begin;
create temp table security_fixture(reviewer uuid, reporter uuid, target uuid, report uuid);
insert into security_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on security_fixture to authenticated;
insert into auth.users(id) select reviewer from security_fixture union all select reporter from security_fixture union all select target from security_fixture;
insert into public.users(id,auth_provider,provider_subject,first_name,avatar_style)
 select reviewer,'google'::public.auth_provider,reviewer::text,'Reviewer','minimal'::public.avatar_style from security_fixture union all
 select reporter,'google'::public.auth_provider,reporter::text,'Reporter','minimal'::public.avatar_style from security_fixture union all
 select target,'google'::public.auth_provider,target::text,'Target','minimal'::public.avatar_style from security_fixture;
insert into public.admin_reviewers(user_id) select reviewer from security_fixture;
insert into public.reports(id,actor_user_id,target_user_id,category) select report,reporter,target,'other' from security_fixture;
do $$
declare f record;
begin
 if not exists(select 1 from pg_class where oid='public.safety_report_review'::regclass and 'security_invoker=true'=any(reloptions)) then raise exception 'view is not invoker'; end if;
 if has_table_privilege('anon','public.safety_report_review','select') or has_table_privilege('authenticated','moderation_private.safety_report_review','select') then raise exception 'unsafe moderation read grants'; end if;
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef loop
  if has_function_privilege('anon',f.oid,'execute') then raise exception 'anon definer access: %',f.proname; end if;
 end loop;
 if has_function_privilege('authenticated','public.get_left_presence_counts(uuid[])','execute') or
    has_function_privilege('authenticated','public.rls_auto_enable()','execute') or
    has_function_privilege('authenticated','public.broadcast_venue_presence_change()','execute') or
    has_function_privilege('authenticated','public.end_active_presence_when_venue_hidden()','execute') then raise exception 'internal function client access'; end if;
 if not has_function_privilege('service_role','public.get_left_presence_counts(uuid[])','execute') then raise exception 'presence backend broken'; end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('set_updated_at','compute_shared_alignment','derive_energy_level','normalize_venue_name','venue_distance_meters') and not exists(select 1 from unnest(p.proconfig) c where c like 'search_path=%')) then raise exception 'mutable search path'; end if;
end;
$$;
select set_config('request.jwt.claim.sub',(select reporter::text from security_fixture),true);
set local role authenticated;
do $$
begin
 if public.is_admin_reviewer((select reviewer from security_fixture)) then raise exception 'reviewer membership oracle'; end if;
 if exists(select 1 from public.safety_report_review) then raise exception 'non-reviewer can see review projection'; end if;
 if exists(select 1 from moderation_private.read_safety_report_review()) then raise exception 'non-reviewer can call helper'; end if;
 begin
  perform public.review_safety_report((select report from security_fixture),'reviewing',null);
  raise exception 'non-reviewer mutation succeeded';
 exception when raise_exception then
  if sqlerrm <> 'not authorized to review safety reports' then raise; end if;
 end;
end;
$$;
reset role;
select set_config('request.jwt.claim.sub',(select reviewer::text from security_fixture),true);
set local role authenticated;
do $$
begin
 if not public.is_admin_reviewer() then raise exception 'reviewer check broken'; end if;
 if not exists(select 1 from public.safety_report_review where report_id=(select report from security_fixture) and reporter_first_name='Reporter' and target_first_name='Target') then raise exception 'reviewer cross-user projection broken'; end if;
 if exists(select 1 from public.users where id=(select target from security_fixture)) then raise exception 'base profile access expanded'; end if;
 perform public.review_safety_report((select report from security_fixture),'reviewing','security regression');
 if not exists(select 1 from public.safety_report_review where report_id=(select report from security_fixture) and status='reviewing') then raise exception 'review mutation broken'; end if;
 if public.normalize_venue_name('  TEST  ') <> 'test' or public.derive_energy_level(8) <> 'high' or public.venue_distance_meters(1,1,1,1) <> 0 then raise exception 'helper regression'; end if;
end;
$$;
reset role;
rollback;
