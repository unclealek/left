-- Local/staging transactional tests. No persistent fixtures.
begin;
do $$
declare
 u uuid:=gen_random_uuid(); other_user uuid:=gen_random_uuid(); v uuid; result jsonb; n integer;
begin
 insert into auth.users(id,is_anonymous) values(u,false),(other_user,false);
 update public.popular_times_run_budget set runs=0,daily_limit=250,usage_day=(now() at time zone 'UTC')::date where id;
 for i in 1..11 loop
  insert into public.venues(name,geofence_json,google_place_id) values('Quota fixture','{}','quota_test_'||i) returning id into v;
  result:=public.claim_popular_times_budgeted('quota_test_'||i,v,'google_scrape',u);
  if i<=10 and not (result->>'claimed')::boolean then raise exception 'quota denied too early'; end if;
  if i=11 and (result->>'limit_scope' <> 'user' or (result->>'claimed')::boolean) then raise exception 'quota bypassed'; end if;
 end loop;
 if exists(select 1 from venue_popular_times where place_id='quota_test_11') then raise exception 'denial left pending row'; end if;
 select count into n from rate_limits where user_id=u;
 if n<>10 then raise exception 'wrong quota count'; end if;
 select runs into n from popular_times_run_budget where id;
 if n<>10 then raise exception 'denial consumed shared budget'; end if;
 result:=public.claim_popular_times_budgeted('quota_test_11',v,'google_scrape',other_user);
 if not (result->>'claimed')::boolean then raise exception 'denied user blocked another user'; end if;
 select id into v from venues where google_place_id='quota_test_1';
 -- Ready, pending and backed-off failures remain readable at quota.
 result:=public.claim_popular_times_budgeted('quota_test_1',v,'google_scrape',u);
 if (result->>'claimed')::boolean or coalesce((result->>'limited')::boolean,false) then raise exception 'pending limited'; end if;
 update venue_popular_times set status='ready',has_data=false,expires_at=now()+interval '14 days' where place_id='quota_test_1';
 result:=public.claim_popular_times_budgeted('quota_test_1',v,'google_scrape',u);
 if result->'row'->>'status'<>'ready' then raise exception 'cache hit limited'; end if;
 update venue_popular_times set expires_at=now()-interval '1 second' where place_id='quota_test_1';
 result:=public.claim_popular_times_budgeted('quota_test_1',v,'google_scrape',u);
 if result->>'limit_scope'<>'user' then raise exception 'expired refresh bypassed quota'; end if;
 if (select status from venue_popular_times where place_id='quota_test_1')<>'ready' then raise exception 'denial mutated existing cache'; end if;
 update rate_limits set window_start=now()-interval '1 hour' where user_id=u;
 result:=public.claim_popular_times_budgeted('quota_test_1',v,'google_scrape',u);
 if not (result->>'claimed')::boolean then raise exception 'window failed to reset'; end if;
 select count into n from rate_limits where user_id=u;
 if n<>1 then raise exception 'reset count wrong'; end if;
 update popular_times_run_budget set daily_limit=0 where id;
 select id into v from venues where google_place_id='quota_test_2';
 update venue_popular_times set status='ready',expires_at=now()-interval '1 second' where place_id='quota_test_2';
 result:=public.claim_popular_times_budgeted('quota_test_2',v,'google_scrape',u);
 if result->>'limit_scope'<>'global' then raise exception 'global cap bypassed'; end if;
 select count into n from rate_limits where user_id=u;
 if n<>1 then raise exception 'global denial charged user'; end if;
 if to_regprocedure('public.claim_popular_times_budgeted(text,uuid,text)') is not null then raise exception 'legacy bypass remains'; end if;
 if has_table_privilege('authenticated','rate_limits','select') or has_function_privilege('authenticated','consume_popular_times_trigger(uuid)','execute') then raise exception 'quota permissions unsafe'; end if;
end;
$$;
rollback;
