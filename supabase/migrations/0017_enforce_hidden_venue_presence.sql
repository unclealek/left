create or replace view public.active_presence_sessions as
select ps.*
from public.presence_sessions ps
where ps.ended_at is null
  and ps.expires_at > now()
  and ps.status in ('visible', 'discoverable', 'expiring')
  and not exists (
    select 1
    from public.venue_preferences vp
    where vp.user_id = ps.user_id
      and vp.venue_id = ps.venue_id
      and vp.hidden = true
  );

drop policy if exists "users can insert own sessions" on public.presence_sessions;
drop policy if exists "users can update own sessions" on public.presence_sessions;

create policy "users can insert own sessions"
on public.presence_sessions for insert
with check (
  auth.uid() = user_id
  and (
    status not in ('activating', 'visible', 'discoverable', 'expiring')
    or not exists (
      select 1
      from public.venue_preferences vp
      where vp.user_id = auth.uid()
        and vp.venue_id = presence_sessions.venue_id
        and vp.hidden = true
    )
  )
);

create policy "users can update own sessions"
on public.presence_sessions for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    status not in ('activating', 'visible', 'discoverable', 'expiring')
    or not exists (
      select 1
      from public.venue_preferences vp
      where vp.user_id = auth.uid()
        and vp.venue_id = presence_sessions.venue_id
        and vp.hidden = true
    )
  )
);

create or replace function public.end_active_presence_when_venue_hidden()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.hidden = true and (tg_op = 'INSERT' or old.hidden is distinct from true) then
    update public.presence_sessions
    set
      status = 'session_ended',
      ended_at = now()
    where user_id = new.user_id
      and venue_id = new.venue_id
      and ended_at is null
      and status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');
  end if;

  return new;
end;
$$;

drop trigger if exists end_active_presence_when_venue_hidden on public.venue_preferences;

create trigger end_active_presence_when_venue_hidden
after insert or update of hidden on public.venue_preferences
for each row execute function public.end_active_presence_when_venue_hidden();

update public.presence_sessions ps
set
  status = 'session_ended',
  ended_at = now()
from public.venue_preferences vp
where vp.user_id = ps.user_id
  and vp.venue_id = ps.venue_id
  and vp.hidden = true
  and ps.ended_at is null
  and ps.status in ('activating', 'visible', 'discoverable', 'expiring', 'paused');
