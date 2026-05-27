create table public.admin_reviewers (
  user_id uuid primary key references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_reviewers enable row level security;

create policy "reviewers can read own reviewer record"
on public.admin_reviewers for select
using (auth.uid() = user_id);

create or replace function public.is_admin_reviewer(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_reviewers
    where user_id = check_user_id
  );
$$;

grant execute on function public.is_admin_reviewer(uuid) to authenticated;

create policy "admin reviewers can read venue submissions"
on public.venue_submissions for select
using (public.is_admin_reviewer(auth.uid()));

create or replace function public.approve_venue_submission(
  submission_id uuid,
  matched_venue_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.venue_submissions%rowtype;
  submission_lat double precision;
  submission_lng double precision;
  submission_radius double precision;
  canonical_venue_id uuid;
begin
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review venue submissions';
  end if;

  select *
  into submission_row
  from public.venue_submissions
  where id = submission_id
  for update;

  if not found then
    raise exception 'venue submission % not found', submission_id;
  end if;

  if submission_row.status <> 'pending' then
    raise exception 'venue submission % is not pending', submission_id;
  end if;

  submission_lat := (submission_row.proposed_geofence_json -> 'center' ->> 'latitude')::double precision;
  submission_lng := (submission_row.proposed_geofence_json -> 'center' ->> 'longitude')::double precision;
  submission_radius := coalesce(
    (submission_row.proposed_geofence_json ->> 'radius_meters')::double precision,
    60
  );

  if submission_lat is null or submission_lng is null then
    raise exception 'venue submission % is missing geofence center', submission_id;
  end if;

  if matched_venue_id is not null then
    select id
    into canonical_venue_id
    from public.venues
    where id = matched_venue_id
      and is_active = true;

    if canonical_venue_id is null then
      raise exception 'matched canonical venue % not found or inactive', matched_venue_id;
    end if;
  else
    select v.id
    into canonical_venue_id
    from public.venues v
    where v.is_active = true
      and public.normalize_venue_name(v.name) = public.normalize_venue_name(submission_row.name)
      and public.venue_distance_meters(
        submission_lat,
        submission_lng,
        (v.geofence_json -> 'center' ->> 'latitude')::double precision,
        (v.geofence_json -> 'center' ->> 'longitude')::double precision
      ) <= greatest(submission_radius, 60)
    order by public.venue_distance_meters(
      submission_lat,
      submission_lng,
      (v.geofence_json -> 'center' ->> 'latitude')::double precision,
      (v.geofence_json -> 'center' ->> 'longitude')::double precision
    ) asc
    limit 1;
  end if;

  if canonical_venue_id is not null then
    update public.venue_submissions
    set status = 'duplicate',
        matched_venue_id = canonical_venue_id
    where id = submission_id;

    return canonical_venue_id;
  end if;

  insert into public.venues (
    name,
    type,
    city,
    geofence_json,
    is_active
  )
  values (
    submission_row.name,
    submission_row.type,
    null,
    submission_row.proposed_geofence_json,
    true
  )
  returning id into canonical_venue_id;

  update public.venue_submissions
  set status = 'approved',
      matched_venue_id = canonical_venue_id
  where id = submission_id;

  return canonical_venue_id;
end;
$$;

create or replace function public.reject_venue_submission(
  submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review venue submissions';
  end if;

  update public.venue_submissions
  set status = 'rejected'
  where id = submission_id
    and status = 'pending';

  if not found then
    raise exception 'pending venue submission % not found', submission_id;
  end if;
end;
$$;

grant execute on function public.approve_venue_submission(uuid, uuid) to authenticated;
grant execute on function public.approve_venue_submission(uuid, uuid) to service_role;
grant execute on function public.reject_venue_submission(uuid) to authenticated;
grant execute on function public.reject_venue_submission(uuid) to service_role;
