create table public.venue_preferences (
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  venue_name text not null,
  hidden boolean not null default false,
  muted boolean not null default false,
  cooldown_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create index venue_preferences_user_updated_idx
on public.venue_preferences (user_id, updated_at desc);

create trigger set_venue_preferences_updated_at
before update on public.venue_preferences
for each row execute function public.set_updated_at();

alter table public.venue_preferences enable row level security;

create policy "users can manage own venue preferences"
on public.venue_preferences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.venue_preferences to authenticated;
