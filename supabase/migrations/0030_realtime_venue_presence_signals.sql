-- Broadcast only a minimal "this venue changed" signal. Clients re-fetch their
-- already RLS-filtered feed, so raw presence rows never reach Realtime clients.
drop policy if exists "active venue members receive presence signals" on realtime.messages;
create policy "active venue members receive presence signals"
on realtime.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.presence_sessions aps
    where aps.user_id = auth.uid()
      and aps.ended_at is null
      and aps.status in ('activating', 'visible', 'discoverable', 'expiring', 'paused')
      and realtime.topic() = ('venue:' || aps.venue_id::text)
  )
);

create or replace function public.broadcast_venue_presence_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_venue_id uuid;
begin
  if tg_op = 'DELETE' then
    v_venue_id := old.venue_id;
  else
    v_venue_id := new.venue_id;
  end if;
  -- Profile edits and other irrelevant session updates should not wake every
  -- person in the venue. A join, leave, visibility change, or venue move does.
  if tg_op = 'UPDATE'
    and old.venue_id is not distinct from new.venue_id
    and old.status is not distinct from new.status
    and old.ended_at is not distinct from new.ended_at then
    return new;
  end if;

  perform realtime.send(
    jsonb_build_object('venue_id', v_venue_id::text),
    'presence-changed',
    'venue:' || v_venue_id::text,
    true
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists venue_presence_realtime_signal on public.presence_sessions;
create trigger venue_presence_realtime_signal
after insert or update of venue_id, status, ended_at or delete on public.presence_sessions
for each row execute function public.broadcast_venue_presence_change();
