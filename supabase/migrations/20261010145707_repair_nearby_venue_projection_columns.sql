-- Repair schema drift observed in left-staging on 2026-10-10.
-- nearby-venues v15 selects these nullable metadata columns before querying Google.
-- They were defined in 0029, but are absent from the live venues table.
-- Narrow repair only: no data rewrite, policy change, or replay of 0029.
alter table public.venues
  add column if not exists community_added_by_name text,
  add column if not exists community_notes text,
  add column if not exists community_photo_path text;
