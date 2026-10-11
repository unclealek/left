// Isolated PostgreSQL compatibility test. No remote connections or real user data.
// npm install --prefix /tmp/left-security-db-runtime --no-save --ignore-scripts @electric-sql/pglite@0.5.8
// node scripts/test-security-migrations.mjs
import { readFile, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
const runtime = process.env.LEFT_PGLITE_RUNTIME ?? "/tmp/left-security-db-runtime/node_modules/@electric-sql/pglite";
const { PGlite } = await import(pathToFileURL(path.join(runtime, "dist/index.js")));
const { pgcrypto } = await import(pathToFileURL(path.join(runtime, "dist/contrib/pgcrypto.js")));
const db = new PGlite({ extensions: { pgcrypto } });
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create schema extensions; create schema realtime;
    create table realtime.messages(topic text);
    alter table realtime.messages enable row level security;
    create function realtime.topic() returns text language sql stable as $$ select ''::text $$;
    create function realtime.send(jsonb,text,text,boolean) returns void language plpgsql as $$ begin return; end $$;
    create function public.rls_auto_enable() returns event_trigger language plpgsql as $$ begin return; end $$;
    grant usage on schema public, auth, storage to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    create table auth.users(id uuid primary key, email text, phone text, raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}', updated_at timestamptz, is_anonymous boolean default false);
    create table auth.identities(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, provider text);
    create table auth.sessions(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users);
    create table auth.refresh_tokens(user_id text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select current_user::text $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
    create publication supabase_realtime;
  `);
  for (const name of (await readdir("supabase/migrations")).filter(n => n.endsWith(".sql")).sort()) {
    try { await db.exec(await readFile(`supabase/migrations/${name}`, "utf8")); }
    catch (error) { throw new Error(`Migration ${name}: ${error.message}`); }
  }
  for (const name of ["rpc-authorization.sql", "presence-location-validation.sql", "database-advisor-hardening.sql", "removed-account-access.sql", "venue-actions.sql"]) {
    try { await db.exec(await readFile(`supabase/tests/${name}`, "utf8")); }
    catch (error) { throw new Error(`Fixture ${name}: ${error.message}`); }
    console.log(`PASS ${name}`);
  }
} finally { await db.close(); }
