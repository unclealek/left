-- Prepared only. Run after approval and migrations 0032–0033, on development/staging.
-- The rollback leaves no fixtures behind. For parallel locking validation, also run
-- two separate sessions claiming the same missing place and assert exactly one claimed=true.
begin;
do $$
declare
  first_claim jsonb;
  result jsonb;
  venue uuid;
  test_user uuid := gen_random_uuid();
begin
  insert into auth.users(id,is_anonymous) values(test_user,false);
  if has_table_privilege('anon', 'public.venue_popular_times', 'select')
    or has_table_privilege('authenticated', 'public.venue_popular_times', 'insert')
    or has_table_privilege('authenticated', 'public.venue_popular_times', 'update')
    or has_table_privilege('authenticated', 'public.venue_popular_times', 'delete')
    or has_function_privilege('authenticated', 'public.claim_popular_times_budgeted(text,uuid,text,uuid)', 'execute') then
    raise exception 'unsafe cache permissions';
  end if;
  if not has_table_privilege('authenticated', 'public.venue_popular_times', 'select') then
    raise exception 'Realtime cache read missing';
  end if;
  insert into public.venues(name, geofence_json, google_place_id) values ('Popular times test fixture', '{}', 'test_popular_times_fixture') returning id into venue;
  update public.popular_times_run_budget set daily_limit=250, usage_day=(now() at time zone 'UTC')::date, runs=0 where id;
  first_claim := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if not (first_claim->>'claimed')::boolean then raise exception 'first claim failed'; end if;
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean then raise exception 'duplicate pending claim'; end if;
  update public.venue_popular_times set status='ready',has_data=false,expires_at=now()+interval '14 days',claim_token=null where place_id='test_popular_times_fixture';
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean then raise exception 'no-data cache retriggered'; end if;
  update public.venue_popular_times set expires_at=now()-interval '1 second' where place_id='test_popular_times_fixture';
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if not (result->>'claimed')::boolean then raise exception 'expired cache did not refresh'; end if;
  if result->'row'->>'claim_token' = first_claim->'row'->>'claim_token' then raise exception 'lease reused'; end if;
  update public.venue_popular_times set pending_until=now()-interval '1 second' where place_id='test_popular_times_fixture';
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean or result->'row'->>'status' <> 'failed' then raise exception 'abandoned lease not backed off'; end if;
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean then raise exception 'failed row retried before backoff'; end if;
  update public.venue_popular_times set retry_at=now()-interval '1 second' where place_id='test_popular_times_fixture';
  result := public.claim_popular_times_budgeted('test_popular_times_fixture',venue,'google_scrape',test_user);
  if not (result->>'claimed')::boolean then raise exception 'backoff expiry did not refresh'; end if;
end;
$$;
rollback;
