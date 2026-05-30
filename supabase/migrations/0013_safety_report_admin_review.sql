do $$
begin
  if not exists (select 1 from pg_type where typname = 'safety_report_status') then
    create type public.safety_report_status as enum (
      'pending',
      'reviewing',
      'resolved',
      'dismissed'
    );
  end if;
end $$;

alter table public.reports
  add column if not exists status public.safety_report_status not null default 'pending',
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists moderation_notes text;

create index if not exists reports_status_created_at_idx
on public.reports (status, created_at desc);

create index if not exists reports_target_user_created_at_idx
on public.reports (target_user_id, created_at desc);

create index if not exists reports_category_created_at_idx
on public.reports (category, created_at desc);

create index if not exists reports_actor_user_created_at_idx
on public.reports (actor_user_id, created_at desc);

create policy "admin reviewers can read reports"
on public.reports for select
using (public.is_admin_reviewer(auth.uid()));

create policy "admin reviewers can update report review fields"
on public.reports for update
using (public.is_admin_reviewer(auth.uid()))
with check (public.is_admin_reviewer(auth.uid()));

create or replace view public.safety_report_review as
select
  r.id as report_id,
  r.status,
  r.category,
  r.notes,
  r.moderation_notes,
  r.created_at as reported_at,
  r.reviewed_at,
  r.reviewed_by,
  reviewer.first_name as reviewed_by_first_name,
  r.actor_user_id as reporter_user_id,
  reporter.first_name as reporter_first_name,
  r.target_user_id,
  target_user.first_name as target_first_name,
  r.presence_session_id,
  ps.venue_id,
  v.name as venue_name,
  ps.intent as session_intent,
  ps.vibes as session_vibes,
  ps.hint_text as session_hint_text,
  ps.status as session_status,
  ps.started_at as session_started_at,
  ps.expires_at as session_expires_at,
  (
    select count(*)::int
    from public.reports prior_reports
    where prior_reports.target_user_id = r.target_user_id
      and prior_reports.id <> r.id
  ) as prior_reports_against_target_count,
  (
    select count(*)::int
    from public.blocks b
    where b.target_user_id = r.target_user_id
       or b.actor_user_id = r.target_user_id
  ) as related_blocks_count,
  (
    select count(*)::int
    from public.approach_attempts aa
    where aa.presence_session_id = r.presence_session_id
  ) as related_approaches_count,
  (
    select count(*)::int
    from public.waves w
    where w.presence_session_id = r.presence_session_id
  ) as related_waves_count
from public.reports r
inner join public.users reporter
  on reporter.id = r.actor_user_id
inner join public.users target_user
  on target_user.id = r.target_user_id
left join public.users reviewer
  on reviewer.id = r.reviewed_by
left join public.presence_sessions ps
  on ps.id = r.presence_session_id
left join public.venues v
  on v.id = ps.venue_id
where public.is_admin_reviewer(auth.uid());

grant select on public.safety_report_review to authenticated;
grant select on public.safety_report_review to service_role;
grant select on public.reports to authenticated;
grant update (status, reviewed_by, reviewed_at, moderation_notes) on public.reports to authenticated;

create or replace function public.review_safety_report(
  report_id uuid,
  next_status public.safety_report_status,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review safety reports';
  end if;

  update public.reports
  set status = next_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      moderation_notes = nullif(trim(notes), '')
  where id = report_id;

  if not found then
    raise exception 'safety report % not found', report_id;
  end if;
end;
$$;

grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to authenticated;
grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to service_role;
