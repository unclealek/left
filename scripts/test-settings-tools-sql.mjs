// Isolated SQL authorization checks; never connects to a remote database.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const runtime=process.env.LEFT_PGLITE_RUNTIME ?? '/tmp/left-settings-db-runtime/node_modules/@electric-sql/pglite/dist/index.js';
const {PGlite}=await import(pathToFileURL(runtime).href);
const db=new PGlite();
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
try {
 await db.exec(`create role anon;create role authenticated;create schema auth;create schema security_private;
 grant usage on schema public,auth,security_private to authenticated;grant usage on schema public to anon;
 create table auth.users(id uuid primary key,is_anonymous boolean default false,active boolean default true);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function security_private.require_active_account() returns void language plpgsql security definer set search_path='' as $$ begin if not exists(select 1 from auth.users where id=auth.uid() and active) then raise exception 'active account required';end if;end;$$;
 revoke all on function security_private.require_active_account() from public; grant execute on function security_private.require_active_account() to authenticated;
 create table public.users(id uuid primary key,first_name text,identity_removed boolean default false);
 create table public.blocks(id uuid primary key,actor_user_id uuid,target_user_id uuid,created_at timestamptz default now());
 insert into auth.users(id) values('${a}'),('${b}');insert into public.users(id,first_name) values('${a}','Alice'),('${b}','Bob');
 insert into blocks values('33333333-3333-4333-8333-333333333333','${a}','${b}',now()),('44444444-4444-4444-8444-444444444444','${b}','${a}',now());`);
 const map=[['presence_sessions','user_id'],['prompt_events','user_id'],['approach_attempts','from_user_id'],['waves','from_user_id'],['contact_exchange_intents','user_id'],['reports','actor_user_id'],['identity_removal_requests','user_id'],['saved_venues','user_id'],['experiences','host_user_id'],['experience_attendees','user_id'],['venue_preferences','user_id'],['legal_acceptances','user_id'],['hidden_users','actor_user_id'],['social_interaction_events','actor_user_id'],['safety_zones','user_id']];
 for(const [table,column] of map)await db.exec(`create table public.${table}(id int,${column} uuid,owned_value text);insert into public.${table} values(1,'${a}','A_ONLY'),(2,'${b}','B_ONLY');alter table public.${table} enable row level security;`);
 await db.exec("alter table public.reports add column review_notes text; update public.reports set review_notes='INTERNAL_REVIEW';");
 await db.exec(await readFile('supabase/migrations/20261020100750_account_settings_tools.sql','utf8'));
 await db.exec(`set role anon`);
 for(const sql of ["select public.export_my_data('profile')"])await assert.rejects(db.query(sql),/permission denied/);
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${a}',false)`);
 for(const category of ['profile','presence','prompts','approaches','waves_sent','contact_choices','reports_submitted','removal_requests','saved_places','gatherings_hosted','gatherings_joined','venue_preferences','legal_acknowledgements','hidden_people','blocked_people','social_interactions','safety_zones']){
  const rows=(await db.query('select public.export_my_data($1) as data',[category])).rows[0].data;
  assert.equal(rows.length,1);assert(!JSON.stringify(rows).includes('B_ONLY'));assert(!JSON.stringify(rows).includes('INTERNAL_REVIEW'));
 }
 await assert.rejects(db.query("select public.export_my_data('auth.users')"),/invalid category/);
 await assert.rejects(db.query("select public.export_my_data('profile',-1)"),/invalid offset/);
 await assert.rejects(db.query('select * from public.users'),/permission denied/);
 await db.exec('reset role');
 await db.exec(`insert into presence_sessions select n,'${a}','PAGE' from generate_series(3,602) n;set role authenticated;`);
 assert.equal((await db.query("select public.export_my_data('presence',0) as data")).rows[0].data.length,500);
 assert.equal((await db.query("select public.export_my_data('presence',500) as data")).rows[0].data.length,101);
 for(const update of [`update auth.users set active=false where id='${a}'`,`update auth.users set active=true,is_anonymous=true where id='${a}'`]){
  await db.exec('reset role');await db.exec(update);await db.exec('set role authenticated');
  await assert.rejects(db.query("select public.export_my_data('profile')"));
 }
 console.log('PASS settings SQL: own-record export, pagination, anonymous/removed-account denial, no raw profile access, category/offset validation.');
} finally {await db.close();}
