-- Hosting uses the signed-in identity; no admin credential belongs in the app.
create or replace function public.submit_experience_proposal(
  p_venue_id uuid, p_title text, p_description text, p_starts_at timestamptz,
  p_capacity integer, p_accessibility_notes text default '', p_cost_notes text default ''
) returns uuid
language plpgsql security invoker set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.users where id = auth.uid() and onboarding_completed) then
    raise exception 'complete your profile before hosting';
  end if;
  if not exists (select 1 from public.venues where id = p_venue_id and is_active) then
    raise exception 'choose an active venue';
  end if;
  if p_starts_at is null or p_starts_at <= now() then raise exception 'choose a future start time'; end if;
  insert into public.experiences(host_user_id, venue_id, title, description, starts_at, capacity, accessibility_notes, cost_notes, status)
  values(auth.uid(), p_venue_id, trim(p_title), trim(p_description), p_starts_at, p_capacity,
    trim(coalesce(p_accessibility_notes, '')), trim(coalesce(p_cost_notes, '')), 'pending_review')
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.submit_experience_proposal(uuid,text,text,timestamptz,integer,text,text) from public, anon;
grant execute on function public.submit_experience_proposal(uuid,text,text,timestamptz,integer,text,text) to authenticated;
