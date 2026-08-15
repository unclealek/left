-- Keep server-side lifecycle state aligned even when no client is open.

alter type public.social_interaction_event_type add value if not exists 'approach_cancelled';

create or replace function public.expire_stale_lifecycle_records()
returns table (presence_sessions_expired integer, approach_attempts_expired integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  expired_presence_count integer;
  expired_approach_count integer;
begin
  update public.presence_sessions
  set
    status = 'session_ended',
    ended_at = coalesce(ended_at, expires_at),
    updated_at = now()
  where ended_at is null
    and expires_at <= now()
    and status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');

  get diagnostics expired_presence_count = row_count;

  update public.approach_attempts
  set
    status = 'expired',
    updated_at = now()
  where status = 'started'
    and expires_at <= now();

  get diagnostics expired_approach_count = row_count;

  return query select expired_presence_count, expired_approach_count;
end;
$$;

revoke all on function public.expire_stale_lifecycle_records() from public, anon, authenticated;
grant execute on function public.expire_stale_lifecycle_records() to service_role;

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron with schema extensions;

    if not exists (
      select 1
      from cron.job
      where jobname = 'left-expire-stale-lifecycle-records'
    ) then
      perform cron.schedule(
        'left-expire-stale-lifecycle-records',
        '* * * * *',
        'select public.expire_stale_lifecycle_records();'
      );
    end if;
  end if;
end;
$$;
