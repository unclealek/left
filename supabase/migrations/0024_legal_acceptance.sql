create table if not exists public.legal_document_versions (
  document_id text not null check (document_id in ('terms', 'privacy', 'community')),
  version text not null,
  published_at timestamptz not null,
  content_sha256 text not null,
  active boolean not null default false,
  primary key (document_id, version)
);

create unique index if not exists legal_document_versions_one_active_per_document
  on public.legal_document_versions (document_id)
  where active;

create table if not exists public.legal_acceptances (
  user_id uuid not null references public.users(id) on delete cascade,
  document_id text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, document_id, document_version),
  foreign key (document_id, document_version)
    references public.legal_document_versions(document_id, version)
);

alter table public.legal_document_versions enable row level security;
alter table public.legal_acceptances enable row level security;

create policy "authenticated users can read published legal versions"
  on public.legal_document_versions for select
  to authenticated
  using (true);

create policy "users can read own legal acceptances"
  on public.legal_acceptances for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.record_current_legal_acceptance(
  expected_terms_version text,
  expected_privacy_version text,
  expected_community_version text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  matching_document_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select count(*)
    into matching_document_count
    from public.legal_document_versions
   where active
     and (
       (document_id = 'terms' and version = expected_terms_version)
       or (document_id = 'privacy' and version = expected_privacy_version)
       or (document_id = 'community' and version = expected_community_version)
     );

  if matching_document_count <> 3 then
    raise exception 'legal document versions are not current';
  end if;

  insert into public.legal_acceptances (user_id, document_id, document_version)
  values
    (auth.uid(), 'terms', expected_terms_version),
    (auth.uid(), 'privacy', expected_privacy_version),
    (auth.uid(), 'community', expected_community_version)
  on conflict do nothing;
end;
$$;

revoke all on function public.record_current_legal_acceptance(text, text, text) from public;
grant execute on function public.record_current_legal_acceptance(text, text, text) to authenticated;

comment on table public.legal_document_versions is
  'Server-owned registry of approved, versioned legal documents. Add rows only with approved content releases.';
comment on table public.legal_acceptances is
  'Append-only evidence that a user accepted a specific approved legal document version.';