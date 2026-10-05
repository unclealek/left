// Isolated PostgreSQL runtime, never connects to Supabase. Install PGlite outside the app:
// npm install --prefix /tmp/left-popular-times-local-db --save-exact @electric-sql/pglite
// node scripts/test-popular-times-sql.mjs /tmp/left-popular-times-local-db/node_modules/@electric-sql/pglite/dist/index.js
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const {PGlite} = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
try {
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key, is_anonymous boolean default false);
create function auth.uid() returns uuid language sql as 'select null::uuid';
create table public.venues(id uuid primary key default gen_random_uuid(),name text,geofence_json jsonb,google_place_id text unique,is_active boolean default true);
create publication supabase_realtime;
grant usage on schema public to anon,authenticated,service_role;`);
for (const file of ['0032_venue_popular_times.sql','0033_popular_times_run_budget.sql','0034_remove_legacy_venue_activity.sql','20261004220526_popular_times_user_trigger_limits.sql']) {
 await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
}
for(const file of ['popular-times.sql','popular-times-budget.sql','popular-times-user-limits.sql']) {
 await db.exec(await readFile(new URL('../supabase/tests/'+file,import.meta.url),'utf8'));
 console.log('PASS '+file);
}
await db.exec('set role authenticated');
await db.query('select * from public.venue_popular_times');
for (const sql of ["insert into venue_popular_times(place_id) values('denied')","update venue_popular_times set status='failed'","delete from venue_popular_times",'select * from rate_limits',"select consume_popular_times_trigger(gen_random_uuid())"]) {
 await assert.rejects(db.query(sql),/permission denied/);
}
await db.exec('reset role');
const policies=await db.query(`select policyname,roles,cmd,qual,with_check from pg_policies where tablename in ('venue_popular_times','rate_limits') order by tablename,policyname`);
console.log('PASS actual authenticated read/write/function permissions');
console.log(JSON.stringify(policies.rows,null,2));
} finally {await db.close();}
