// Isolated database only. Never connects to staging or production.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href);
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;grant usage on schema public to anon,authenticated;
 create table public.users(id uuid primary key,identity_removed boolean,onboarding_completed boolean);
 create table public.venues(id uuid primary key,name text,is_active boolean);
 create table public.experiences(id uuid primary key,host_user_id uuid,venue_id uuid,title text,description text,starts_at timestamptz,ends_at timestamptz,capacity integer,accessibility_notes text,cost_notes text,status text);
 create table public.experience_attendees(experience_id uuid,user_id uuid);
 alter table public.users enable row level security;alter table public.venues enable row level security;alter table public.experiences enable row level security;alter table public.experience_attendees enable row level security;
 insert into users values ('11111111-1111-4111-8111-111111111111',false,true);
 insert into venues values ('22222222-2222-4222-8222-222222222222','Cafe',true);
 insert into experiences values ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','A reviewed plan','Description',now()+interval '1 day',null,8,'','Free','published');`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261012164051_guest_shared_gathering_preview.sql',import.meta.url),'utf8'));
 const query="select get_shared_gathering('33333333-3333-4333-8333-333333333333') as plan";
 await db.exec('set role anon');
 let result=(await db.query(query)).rows[0].plan;
 assert.equal(result.title,'A reviewed plan');assert(!('hostUserId' in result));assert(!('hostFirstName' in result));
 for(const sql of ['select * from users','select * from experience_attendees','insert into experiences(id) values(gen_random_uuid())','update experiences set status=\'published\''])await assert.rejects(db.query(sql),/permission denied/);
 await db.exec('reset role');
 for(const status of ['pending_review','rejected','cancelled','completed','draft']){
  await db.query('update experiences set status=$1',[status]);await db.exec('set role anon');assert.equal((await db.query(query)).rows[0].plan,null);await db.exec('reset role');
 }
 await db.exec("update experiences set status='published',starts_at=now()-interval '1 day';set role anon");assert.equal((await db.query(query)).rows[0].plan,null);await db.exec('reset role');
 await db.exec("update experiences set starts_at=now()+interval '1 day';update users set identity_removed=true;set role anon");assert.equal((await db.query(query)).rows[0].plan,null);await db.exec('reset role');
 await db.exec("update users set identity_removed=false;update venues set is_active=false;set role anon");assert.equal((await db.query(query)).rows[0].plan,null);
 console.log('PASS guest public preview: published-only, future-only, active host/venue, no profile or participant access, no writes');
}finally{await db.close();}
