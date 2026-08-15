-- Use explicit local aliases so PL/pgSQL and plpgsql_check resolve function
-- parameters without confusing them with report columns or table names.

create or replace function public.review_safety_report(
  report_id uuid,
  next_status public.safety_report_status,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report_id alias for $1;
  v_next_status alias for $2;
  v_notes alias for $3;
begin
  if not public.is_admin_reviewer(auth.uid()) then
    raise exception 'not authorized to review safety reports';
  end if;

  update public.reports as target_report
  set status = v_next_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      moderation_notes = nullif(trim(v_notes), '')
  where target_report.id = v_report_id;

  if not found then
    raise exception 'safety report % not found', v_report_id;
  end if;
end;
$$;

revoke all on function public.review_safety_report(uuid, public.safety_report_status, text) from public, anon;
grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to authenticated;
grant execute on function public.review_safety_report(uuid, public.safety_report_status, text) to service_role;
