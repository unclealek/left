do $$
begin
  create type public.social_interaction_event_type as enum (
    'became_visible',
    'profile_viewed',
    'wave_sent',
    'approach_started',
    'approach_connected',
    'prompt_dismissed',
    'user_hidden',
    'user_blocked',
    'user_reported'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.social_interaction_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  visibility_session_id uuid references public.presence_sessions(id) on delete set null,
  event_type public.social_interaction_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (target_user_id is null or actor_user_id <> target_user_id)
);

create index if not exists social_interaction_events_actor_session_created_idx
on public.social_interaction_events (actor_user_id, visibility_session_id, created_at desc);

create index if not exists social_interaction_events_actor_type_created_idx
on public.social_interaction_events (actor_user_id, event_type, created_at desc);

alter table public.social_interaction_events enable row level security;

create policy "users can read own social interaction events"
on public.social_interaction_events for select
using (auth.uid() = actor_user_id);

create policy "users can insert own social interaction events"
on public.social_interaction_events for insert
with check (auth.uid() = actor_user_id);

grant select, insert on public.social_interaction_events to authenticated;
