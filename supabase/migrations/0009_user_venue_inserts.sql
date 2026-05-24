create policy "authenticated users can insert venues"
on public.venues for insert
with check (auth.role() = 'authenticated');
