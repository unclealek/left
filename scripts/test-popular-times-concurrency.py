"""Development-only multi-session DB test. No Edge Function or paid actor calls.
Creates random synthetic users/venues, then removes only those fixtures and refunds
only their synthetic budget reservations. Requires the existing Supabase CLI login.
"""
import concurrent.futures
import datetime
import json
from pathlib import Path
import subprocess
import uuid

REF = 'xrracivlxgedlzdcrfwx'
if Path('supabase/.temp/project-ref').read_text().strip() != REF:
    raise SystemExit('Refusing to run outside the known development project')
now = datetime.datetime.now(datetime.timezone.utc)
if now.hour == 23 and now.minute >= 55:
    raise SystemExit('Run away from UTC budget rollover')
prefix = 'security_concurrency_' + uuid.uuid4().hex
users = [str(uuid.uuid4()) for _ in range(3)]
venues = [str(uuid.uuid4()) for _ in range(13)]
places = [prefix + '_' + str(i) for i in range(13)]
receipt = Path('/tmp/' + prefix + '.json')
receipt.write_text(json.dumps({'users': users, 'venues': venues, 'places': places}))

def query(sql):
    result = subprocess.run(['supabase', 'db', 'query', '--linked', '--project-ref', REF, sql],
                            capture_output=True, text=True, timeout=60)
    if result.returncode:
        raise RuntimeError('Development SQL failed: ' + (result.stderr + result.stdout)[-1500:])
    return json.loads(result.stdout)['rows']

def quote_list(values):
    return ','.join("'" + v + "'" for v in values)  # UUIDs/generated ASCII identifiers only.

def claim(args):
    i, user = args
    return query(f"select pg_backend_pid() as pid, public.claim_popular_times_budgeted('{places[i]}','{venues[i]}','google_scrape','{user}') as result, pg_sleep(0.6)")[0]

try:
    budget = query("select daily_limit,case when usage_day=(now() at time zone 'UTC')::date then runs else 0 end as runs from public.popular_times_run_budget where id")[0]
    if budget['daily_limit'] - budget['runs'] < 11:
        raise RuntimeError('Insufficient available development budget; no limits modified')
    setup = "begin; insert into auth.users(id,is_anonymous) values " + ','.join(f"('{u}',false)" for u in users) + ';'
    setup += 'insert into public.venues(id,name,geofence_json,google_place_id,is_active) values ' + ','.join(f"('{v}','Security concurrency fixture','{{}}','{p}',true)" for v,p in zip(venues,places)) + ';commit;'
    query(setup)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        same = list(pool.map(claim, [(0, users[i % 2]) for i in range(8)]))
    assert sum(r['result']['claimed'] for r in same) == 1, 'Duplicate same-venue claims'
    assert len({r['pid'] for r in same}) > 1, 'Test did not use independent database sessions'
    print('PASS: eight requests from two users on independent sessions produce one claim', flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        different = list(pool.map(claim, [(i, users[2]) for i in range(1,13)]))
    assert sum(r['result']['claimed'] for r in different) == 10, 'Per-user quota raced'
    denied = [r for r in different if r['result'].get('limit_scope') == 'user']
    assert len(denied) == 2, 'Expected two quota denials'
    count = query(f"select count from public.rate_limits where user_id='{users[2]}' and action='popular_times_trigger'")[0]['count']
    assert count == 10, 'Quota counter exceeded 10'
    rows = query(f"select count(*)::integer as count from public.venue_popular_times where place_id in ({quote_list(places)})")[0]['count']
    assert rows == 11, 'Denied requests created cache rows'
    print('PASS: twelve distinct venues concurrently yield ten claims, two denials, and no denied pending rows', flush=True)
finally:
    # No worker is launched, so each synthetic row corresponds to exactly one reservation.
    # Subtract only our reservations; never overwrite unrelated usage or the configured cap.
    query(f"""begin;
      with removed as (delete from public.venue_popular_times where place_id in ({quote_list(places)}) returning pending_until)
      update public.popular_times_run_budget set runs=greatest(0,runs-(select count(*) from removed where ((pending_until-interval '3 minutes') at time zone 'UTC')::date=usage_day)) where id;
      delete from public.venues where id in ({quote_list(venues)});
      delete from auth.users where id in ({quote_list(users)});
      commit;""")
    remaining = query(f"select (select count(*) from public.venues where id in ({quote_list(venues)}))+(select count(*) from auth.users where id in ({quote_list(users)}))+(select count(*) from venue_popular_times where place_id in ({quote_list(places)})) as count")[0]['count']
    assert remaining == 0, 'Fixture cleanup incomplete; see ' + str(receipt)
    print('PASS: synthetic users, venues, cache rows and their budget reservations cleaned up', flush=True)
