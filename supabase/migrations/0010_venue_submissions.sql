create table public.venue_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.users(id) on delete cascade,
  name text not null,
  type venue_type not null default 'other',
  address_text text not null,
  notes text,
  proposed_geofence_json jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  matched_venue_id uuid references public.venues(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_venue_submissions_updated_at
before update on public.venue_submissions
for each row execute function public.set_updated_at();

alter table public.venue_submissions enable row level security;

create policy "users can insert own venue submissions"
on public.venue_submissions for insert
with check (auth.uid() = submitted_by);

create policy "users can read own venue submissions"
on public.venue_submissions for select
using (auth.uid() = submitted_by);
