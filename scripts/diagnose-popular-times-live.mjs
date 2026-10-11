// Single bounded staging provider lookup; preserves cache and actual quota.
// Requires explicit --allow-paid flag; credentials never printed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
assert(process.argv.includes('--allow-paid'), 'Explicit --allow-paid required');
const ref = 'xrracivlxgedlzdcrfwx';
assert.equal(readFileSync(new URL('../supabase/.temp/project-ref', import.meta.url), 'utf8').trim(), ref);
let keys;
try {
  keys = JSON.parse(execFileSync('supabase', ['projects', 'api-keys', '--project-ref', ref, '-o', 'json'],
    { encoding: 'utf8', timeout: 60_000, stdio: ['ignore', 'pipe', 'pipe'] }));
} catch { throw new Error('Staging credentials unavailable; command output withheld'); }
const anon = keys.find(k => k.name === 'anon')?.api_key;
const service = keys.find(k => k.name === 'service_role')?.api_key;
assert(anon && service);
const url = `https://${ref}.supabase.co`;
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }) } };
const admin = createClient(url, service, options);
const client = createClient(url, anon, options);
const run = randomUUID();
let userId, token;
const ok = (result, label) => { assert(!result.error, `${label}: ${result.error?.code ?? 'request failed'}`); return result.data; };
async function invoke(name, body) {
  const response = await fetch(`${url}/functions/v1/${name}`, { method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
  return { status: response.status, data: await response.json() };
}
const place = process.argv.find(arg => arg.startsWith('--place-id='))?.slice('--place-id='.length);
assert(place && /^[A-Za-z0-9_-]{5,255}$/.test(place), 'Provide a known uncached --place-id');
try {
 assert.equal(ok(await admin.from('venue_popular_times').select('place_id').eq('place_id',place).maybeSingle(),'Cache preflight'),null,'Refuse cached place; no cache resets');
 const email=`provider-diagnostic-${run}@example.invalid`,password=`${randomUUID()}Aa!9`;
 userId=ok(await admin.auth.admin.createUser({email,password,email_confirm:true}),'Create fixture').user.id;
 token=ok(await client.auth.signInWithPassword({email,password}),'Sign in').session.access_token;
 const response=await invoke('get-popular-times',{placeId:place,placeUrl:`https://www.google.com/maps/search/?api=1&query=Google%20Maps&query_place_id=${place}`});
 console.log('Provider trigger:',response.status,response.data.status??response.data.error);
 if(response.status===200 && response.data.status==='pending') {
  for(let i=0;i<30;i++) {
   await new Promise(r=>setTimeout(r,5000));
   const row=ok(await admin.from('venue_popular_times').select('status,has_data,popular_times').eq('place_id',place).single(),'Read result');
   if(row.status!=='pending') {console.log('Provider result:',row.status,'has_data:',row.has_data,'days:',Object.keys(row.popular_times??{}).length);break;}
   if(i===29)console.log('Provider still pending after bounded wait');
  }
 }
} finally {
 if(userId)ok(await admin.auth.admin.deleteUser(userId),'Clean fixture');
 console.log('PASS disposable auth cleanup; real cache and quota retained');
}
