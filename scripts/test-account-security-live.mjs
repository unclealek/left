// Staging only. Creates a disposable account/venue; cleans up only this run's fixtures.
// Credentials are kept in memory. No Apple or paid-provider calls.
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
let userId, venueId, requestId, token;
const ok = (result, label) => { assert(!result.error, `${label}: ${result.error?.code ?? 'request failed'}`); return result.data; };
async function invoke(name, body) {
  const response = await fetch(`${url}/functions/v1/${name}`, { method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
  return { status: response.status, data: await response.json() };
}
try {
  const email = `security-removal-${run}@example.invalid`, password = `${randomUUID()}Aa!9`;
  userId = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'Create fixture').user.id;
  token = ok(await client.auth.signInWithPassword({ email, password }), 'Sign in').session.access_token;
  ok(await admin.from('users').insert({ id: userId, auth_provider: 'google', provider_subject: run,
    first_name: 'Security Fixture', avatar_style: 'minimal', profile_prompt: 'Fixture prompt', approach_prompt: 'Fixture approach' }), 'Create profile');
  const venue = ok(await admin.from('venues').insert({ name: `Security fixture ${run}`, geofence_json: {}, latitude: 60.17, longitude: 24.94 }).select('id').single(), 'Create venue');
  venueId = venue.id;
  const presence = ok(await admin.from('presence_sessions').insert({ user_id: userId, venue_id: venueId, intent: 'casual_chat',
    vibes: [], status: 'visible', hint_text: 'Fixture hint', started_at: new Date().toISOString(), expires_at: new Date(Date.now()+1_800_000).toISOString() }).select('id').single(), 'Create presence');
  assert.equal((await invoke('process-identity-removal', {})).status, 400);
  assert.equal((await invoke('process-identity-removal', { requestId: randomUUID() })).status, 404);
  console.log('PASS authenticated removal validation and ownership rejection');
  requestId = ok(await client.from('identity_removal_requests').insert({ user_id: userId, profile_user_id: userId,
    contact_email: email, contact_name: 'Security Fixture', auth_provider: 'google' }).select('id').single(), 'Create removal request').id;
  const removed = await invoke('process-identity-removal', { requestId });
  assert.equal(removed.status, 200, 'Removal HTTP status'); assert.equal(removed.data.ok, true);
  const row = ok(await admin.from('presence_sessions').select('ended_at,hint_text').eq('id', presence.id).single(), 'Verify presence');
  assert(row.ended_at); assert.equal(row.hint_text, null);
  console.log('PASS deployed non-Apple removal ends presence and redacts active hint');
  // The client still holds its pre-removal JWT; do not refresh it.
  assert.deepEqual(ok(await client.from('users').select('id').eq('id', userId), 'Old-token read'), []);
  assert.deepEqual(ok(await client.from('users').update({ identity_removed: false }).eq('id', userId).select('id'), 'Old-token write'), []);
  assert((await client.rpc('consume_api_rate_limit', { p_endpoint: 'venue-details' })).error, 'Old-token privileged RPC must fail');
  assert.equal((await invoke('get-popular-times', {})).status, 401);
  assert.equal((await invoke('process-identity-removal', { requestId })).status, 401);
  console.log('PASS pre-removal JWT denied profile reads/writes, privileged RPC and both Edge Functions');
} finally {
  const failures = [];
  if (requestId && (await admin.from('identity_removal_requests').delete().eq('id', requestId)).error) failures.push('request');
  if (userId && (await admin.auth.admin.deleteUser(userId)).error) failures.push('user');
  if (venueId && (await admin.from('venues').delete().eq('id', venueId)).error) failures.push('venue');
  assert.equal(failures.length, 0, `Fixture cleanup failed: ${failures.join(', ')}`);
  console.log('PASS disposable fixtures cleaned up');
}
