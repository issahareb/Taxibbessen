import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { readReconciliation } from './reconcile-requests.mjs';

// Temporary fixtures only. The CLI entry point refuses any remote database.
export async function checkDatabaseReconciliation(client) {
  await client.query(`CREATE TEMP TABLE bookings (id integer, created_at timestamp, is_test boolean, analytics_session_id text)`);
  await client.query(`CREATE TEMP TABLE analytics_events (created_at timestamptz, session_id text, event_type text, target text)`);
  await client.query(`INSERT INTO bookings SELECT i, '2026-10-01T12:00:00'::timestamp, i = 11,
    CASE WHEN i <= 5 THEN repeat('a',32) ELSE NULL END FROM generate_series(1,11) i`);
  await client.query(`INSERT INTO bookings VALUES (12,'2026-10-02T00:00:00',false,NULL), (13,'2026-09-30T23:59:59',false,NULL)`);
  await client.query(`INSERT INTO analytics_events SELECT '2026-10-01T12:00:00Z', repeat(chr(96+i),32), 'form_submit','ride' FROM generate_series(1,5) i`);
  await client.query(`INSERT INTO analytics_events VALUES
    ('2026-10-01T12:01:00Z', repeat('a',32), 'form_submit','contact'),
    ('2026-10-01T12:02:00Z', repeat('a',32), 'form_attempt','contact'),
    ('2026-10-01T12:03:00Z', repeat('a',32), 'form_error','contact'),
    ('2026-10-02T00:00:00Z', repeat('z',32), 'form_submit','ride')`);
  const result = await readReconciliation(client, {
    from:'2026-10-01T00:00:00Z',to:'2026-10-02T00:00:00Z',details:true,
    evidence:[{kind:'booking',bookingId:1,messageId:'fixture-mail',timestamp:'2026-10-01T12:00:01Z',event:'accepted'}],
  });
  assert.equal(result.savedHeroRequests,10);
  assert.equal(result.excludedTestRecords,1);
  assert.equal(result.formSubmitSessions,5);
  assert.equal(result.formSubmitEvents,6);
  assert.deepEqual(result.forms.find(x=>x.kind==='contact'),{kind:'contact',successes:1,successSessions:1,attempts:1,errors:1});
  assert.equal(result.records[0].providerAcceptedMessages,1);
  assert.equal(result.records[0].deliveredMessages,0);
  assert.equal(result.mailComparison.bookingsWithoutSuppliedMailEvidence,9);
  assert.equal(result.records.filter(r=>r.sessionHasTrackedHeroSubmit).length,5);
  assert.ok(!JSON.stringify(result).includes('a'.repeat(32)));
  const aggregate=await readReconciliation(client,{from:'2026-10-01T00:00:00Z',to:'2026-10-02T00:00:00Z'});
  assert.equal(aggregate.records,undefined);
  console.log('Read-only diagnosis database fixture passed: 10 stored requests, 5 sessions, 6 events, tests, boundaries, contact separation and mail acceptance without delivery. Synthetic data only.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url=new URL(process.env.DATABASE_URL);
  assert.ok(['127.0.0.1','localhost'].includes(url.hostname));
  assert.equal(url.pathname,'/taxi_measurement_test');
  const {default:pg}=await import('pg');
  const client=new pg.Client({connectionString:url.href});
  try { await client.connect(); await checkDatabaseReconciliation(client); }
  finally { await client.end(); }
}
