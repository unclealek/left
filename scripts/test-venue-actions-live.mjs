// Staging HTTP regression. Disposable auth/profile/venue; one Google discovery request.
// Popular-times reads an existing backoff cache only; no paid actor trigger.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
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
let userId, venueId, token;
const ok = (result, label) => { assert(!result.error, `${label}: ${result.error?.code ?? 'request failed'}`); return result.data; };
async function invoke(name, body) {
  const response = await fetch(`${url}/functions/v1/${name}`, { method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
  return { status: response.status, data: await response.json() };
}
try {
 const email = `venue-actions-${run}@example.invalid`, password = `${randomUUID()}Aa!9`;
 userId = ok(await admin.auth.admin.createUser({email,password,email_confirm:true}), 'Create fixture').user.id;
 token = ok(await client.auth.signInWithPassword({email,password}), 'Sign in').session.access_token;
 ok(await admin.from('users').insert({id:userId,auth_provider:'google',provider_subject:run,first_name:'Action fixture',avatar_style:'minimal',onboarding_completed:true}), 'Profile');
 venueId = ok(await admin.from('venues').insert({name:`Action fixture ${run}`,geofence_json:{radius_meters:120},latitude:0,longitude:0}).select('id').single(),'Venue').id;
 const args={p_venue_id:venueId,p_intent:'casual_chat',p_vibes:Array.from({length:12},(_,i)=>`Vibe ${i}`),p_hint_text:'Blue cap',p_latitude:0,p_longitude:0,p_duration_minutes:30};
 const session=ok(await client.rpc('start_presence_session',args),'Start visibility');assert(session);
 assert((await client.rpc('start_presence_session',{...args,p_vibes:[...args.p_vibes,'extra']})).error);
 assert(ok(await client.rpc('end_presence_session',{p_session_id:session,p_status:'session_ended'}),'End visibility'));
 console.log('PASS authenticated HTTP visibility with twelve vibes; thirteen rejected; session ended');
 const proposal=ok(await client.rpc('submit_experience_proposal',{p_venue_id:venueId,p_title:'Fixture coffee',p_description:'Testing a private pending coffee plan',p_starts_at:new Date(Date.now()+86400000).toISOString(),p_capacity:8,p_accessibility_notes:'',p_cost_notes:''}),'Submit event');
 const row=ok(await client.from('experiences').select('status,host_user_id').eq('id',proposal).single(),'Read own event');
 assert.equal(row.status,'pending_review');assert.equal(row.host_user_id,userId);
 assert.deepEqual(ok(await client.from('venues').select('id').eq('id',venueId),'Private catalog'),[]);
 console.log('PASS authenticated HTTP event submission, owner read and private venue catalog');
 const discovery=await invoke('nearby-venues',{latitude:60.1744305,longitude:24.7808168,radiusMetres:500});
 assert.equal(discovery.status,200,'Nearby HTTP response');
 console.log(`PASS nearby HTTP: ${discovery.data.venues?.length ?? 0} canonical venues within 500m`);
 assert(discovery.data.venues?.length > 5,'Discovery should exceed original five-place result');
 const place='ChIJXcgtbiz1jUYRWUfsOKRJbkQ';
 const cached=ok(await admin.from('venue_popular_times').select('status,retry_at').eq('place_id',place).single(),'Read backoff');
 if(cached.status==='failed' && Date.parse(cached.retry_at)>Date.now()) {
  const popular=await invoke('get-popular-times',{placeId:place,placeUrl:`https://www.google.com/maps/search/?api=1&query=Google%20Maps&query_place_id=${place}`});
  assert.equal(popular.status,200);assert.equal(popular.data.status,'failed');
  console.log('PASS popular-times cached failure returned with backoff; provider recovery still unverified');
 } else console.log('SKIP popular-times request: would trigger provider work');
} finally {
 const failed=[];
 if(userId && (await admin.auth.admin.deleteUser(userId)).error) failed.push('auth');
 if(venueId && (await admin.from('venues').delete().eq('id',venueId)).error) failed.push('venue');
 assert.equal(failed.length,0,`Cleanup failed: ${failed}`);
 console.log('PASS disposable fixture cleanup');
}
