-- Run after migration 0033 approval; all changes and fixtures roll back.
begin;
do $$
declare
  venue uuid;
  test_user uuid := gen_random_uuid();
  result jsonb;
  before_runs integer;
begin
  insert into auth.users(id,is_anonymous) values(test_user,false);
  if has_table_privilege('authenticated', 'public.popular_times_run_budget', 'select')
    or has_table_privilege('authenticated', 'public.popular_times_run_budget', 'update')
    or has_function_privilege('authenticated', 'public.claim_popular_times_budgeted(text,uuid,text,uuid)', 'execute')
    or has_function_privilege('anon', 'public.claim_popular_times_budgeted(text,uuid,text,uuid)', 'execute') then
    raise exception 'unsafe budget permissions';
  end if;
  insert into public.venues(name, geofence_json, google_place_id)
    values ('Popular times budget test fixture', '{}', 'test_budget_fixture') returning id into venue;
  update public.popular_times_run_budget set daily_limit=1, usage_day=(now() at time zone 'UTC')::date, runs=0 where id;
  result := public.claim_popular_times_budgeted('test_budget_fixture',venue,'google_scrape',test_user);
  if not (result->>'claimed')::boolean then raise exception 'available budget did not claim'; end if;
  result := public.claim_popular_times_budgeted('test_budget_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean then raise exception 'duplicate claimed'; end if;
  select runs into before_runs from public.popular_times_run_budget where id;
  if before_runs <> 1 then raise exception 'duplicate consumed budget'; end if;
  update public.venue_popular_times set status='ready', expires_at=now()-interval '1 second' where place_id='test_budget_fixture';
  result := public.claim_popular_times_budgeted('test_budget_fixture',venue,'google_scrape',test_user);
  if (result->>'claimed')::boolean or not (result->>'limited')::boolean then raise exception 'daily budget bypassed'; end if;
  update public.venue_popular_times set source='own_telemetry',status='pending',pending_until=now()-interval '1 second' where place_id='test_budget_fixture';
  result := public.claim_popular_times_budgeted('test_budget_fixture',venue,'google_scrape',test_user);
  if result->'row'->>'source' <> 'own_telemetry' or result->'row'->>'status' <> 'pending' then raise exception 'Google modified first-party row'; end if;
  update public.venue_popular_times set source='google_scrape',status='failed',retry_at=now()-interval '1 second' where place_id='test_budget_fixture';
  update public.popular_times_run_budget set usage_day=(now() at time zone 'UTC')::date-1 where id;
  result := public.claim_popular_times_budgeted('test_budget_fixture',venue,'google_scrape',test_user);
  if not (result->>'claimed')::boolean then raise exception 'UTC rollover failed'; end if;
  begin
    perform public.claim_popular_times_budgeted('mismatched_place',venue,'google_scrape',test_user);
    raise exception 'canonical identity mismatch accepted';
  exception when raise_exception then
    if sqlerrm <> 'invalid canonical venue' then raise; end if;
  end;
end;
$$;
rollback;
