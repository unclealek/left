-- Pending approval: shared cap on paid actor launches, independent of user accounts.
begin;
create table public.popular_times_run_budget (
  id boolean primary key default true check (id),
  daily_limit integer not null default 250 check (daily_limit between 0 and 10000),
  usage_day date not null default (now() at time zone 'UTC')::date,
  runs integer not null default 0 check (runs >= 0)
);
alter table public.popular_times_run_budget enable row level security;
revoke all on public.popular_times_run_budget from public, anon, authenticated;
grant select, insert, update on public.popular_times_run_budget to service_role;
insert into public.popular_times_run_budget(id) values (true);

-- Retire the uncapped entrypoint, so an old deployment fails closed.
drop function public.claim_popular_times(text, uuid, text);
create function public.claim_popular_times_budgeted(p_place_id text, p_venue_id uuid, p_source text default 'google_scrape')
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.venue_popular_times;
  budget public.popular_times_run_budget;
  token uuid := gen_random_uuid();
  inserted boolean;
  today date := (now() at time zone 'UTC')::date;
begin
  if p_source not in ('google_scrape', 'self_report', 'own_telemetry') or p_source is null then
    raise exception 'invalid provider source';
  end if;
  if p_place_id is null or p_place_id !~ '^[A-Za-z0-9_-]{5,255}$' or not exists (
    select 1 from public.venues where id = p_venue_id and google_place_id = p_place_id and is_active
  ) then raise exception 'invalid canonical venue'; end if;

  insert into public.venue_popular_times(place_id, venue_id, source, claim_token, pending_until)
    values (p_place_id, p_venue_id, p_source, token, now() + interval '3 minutes')
    on conflict (place_id) do nothing;
  inserted := found;
  select * into r from public.venue_popular_times where place_id = p_place_id for update;
  if not inserted then
    -- A Google refresh cannot alter the state of first-party rows, even abandoned ones.
    if r.source <> p_source and r.source <> 'google_scrape' then
      return jsonb_build_object('claimed', false, 'row', to_jsonb(r));
    end if;
    if r.status = 'pending' and coalesce(r.pending_until, '-infinity') <= now() then
      update public.venue_popular_times set status = 'failed', retry_at = now() + interval '24 hours',
        pending_until = null, claim_token = null where place_id = p_place_id returning * into r;
    end if;
    if r.status = 'pending' or (r.status = 'ready' and r.expires_at > now())
      or (r.status = 'failed' and r.retry_at > now()) then
      return jsonb_build_object('claimed', false, 'row', to_jsonb(r));
    end if;
  end if;

  if p_source = 'google_scrape' then
    -- Serialize winning claims across different venues as well as different users.
    select * into budget from public.popular_times_run_budget where id for update;
    if not found then raise exception 'run budget unavailable'; end if;
    if budget.usage_day <> today then budget.runs := 0; end if;
    if budget.runs >= budget.daily_limit then
      update public.venue_popular_times set status = 'failed', retry_at = now() + interval '24 hours',
        pending_until = null, claim_token = null where place_id = p_place_id returning * into r;
      return jsonb_build_object('claimed', false, 'limited', true, 'row', to_jsonb(r));
    end if;
    update public.popular_times_run_budget set usage_day = today, runs = budget.runs + 1 where id;
  end if;

  update public.venue_popular_times set status = 'pending', source = p_source,
    venue_id = p_venue_id, claim_token = token, pending_until = now() + interval '3 minutes', retry_at = null
    where place_id = p_place_id returning * into r;
  return jsonb_build_object('claimed', true, 'row', to_jsonb(r));
end;
$$;
revoke all on function public.claim_popular_times_budgeted(text, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_popular_times_budgeted(text, uuid, text) to service_role;
commit;
