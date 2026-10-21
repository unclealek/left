-- Prepared locally; apply only after explicit approval.
-- Reuse ready cache rows indefinitely, including legacy rows with past expiry dates.
-- Keep failed retry windows, pending leases, quotas and privileges unchanged.
begin;
create or replace function public.claim_popular_times_budgeted(p_place_id text, p_venue_id uuid, p_source text, p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.venue_popular_times;
  budget public.popular_times_run_budget;
  quota jsonb;
  today date := (now() at time zone 'UTC')::date;
begin
  if p_user_id is null or not exists(select 1 from auth.users where id=p_user_id and not coalesce(is_anonymous,false)) then
    raise exception 'registered user required';
  end if;
  if p_source is null or p_source not in ('google_scrape','self_report','own_telemetry') then raise exception 'invalid provider source'; end if;
  if p_place_id is null or p_place_id !~ '^[A-Za-z0-9_-]{5,255}$' or not exists (
    select 1 from public.venues where id=p_venue_id and google_place_id=p_place_id and is_active
  ) then raise exception 'invalid canonical venue'; end if;
  -- Also locks absent rows: quota denial must never leave a pending cache row.
  perform pg_advisory_xact_lock(hashtextextended(p_place_id,0));
  select * into r from public.venue_popular_times where place_id=p_place_id for update;
  if found then
    if r.source <> p_source and r.source <> 'google_scrape' then return jsonb_build_object('claimed',false,'row',to_jsonb(r)); end if;
    if r.status='pending' and coalesce(r.pending_until,'-infinity') <= now() then
      update public.venue_popular_times set status='failed',retry_at=now()+interval '24 hours',pending_until=null,claim_token=null
        where place_id=p_place_id returning * into r;
    end if;
    if r.status='pending' or r.status='ready' or (r.status='failed' and r.retry_at>now()) then
      return jsonb_build_object('claimed',false,'row',to_jsonb(r));
    end if;
  end if;
  if p_source='google_scrape' then
    select * into budget from public.popular_times_run_budget where id for update;
    if not found then raise exception 'run budget unavailable'; end if;
    if budget.usage_day <> today then budget.runs:=0; end if;
    if budget.runs >= budget.daily_limit then
      return jsonb_build_object('claimed',false,'limited',true,'limit_scope','global','retry_after_seconds',
        greatest(1,ceil(extract(epoch from ((today+1)::timestamp at time zone 'UTC')-now()))::integer));
    end if;
    quota:=public.consume_popular_times_trigger(p_user_id);
    if not (quota->>'allowed')::boolean then
      return jsonb_build_object('claimed',false,'limited',true,'limit_scope','user','retry_after_seconds',quota->'retry_after_seconds');
    end if;
    update public.popular_times_run_budget set usage_day=today,runs=budget.runs+1 where id;
  end if;
  insert into public.venue_popular_times(place_id,venue_id,source,claim_token,pending_until)
    values(p_place_id,p_venue_id,p_source,gen_random_uuid(),now()+interval '3 minutes')
    on conflict(place_id) do update set status='pending',source=excluded.source,venue_id=excluded.venue_id,
      claim_token=excluded.claim_token,pending_until=excluded.pending_until,retry_at=null returning * into r;
  return jsonb_build_object('claimed',true,'row',to_jsonb(r));
end;
$$;
revoke all on function public.claim_popular_times_budgeted(text,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.claim_popular_times_budgeted(text,uuid,text,uuid) to service_role;
commit;
