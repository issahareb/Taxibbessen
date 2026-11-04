// Explicit-window, read-only production diagnosis. Never imports app startup or
// migrations and never selects names, phone numbers, emails, addresses or notes.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function windowBounds(from, to) {
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (![from, to].every(x => typeof x === 'string' && iso.test(x) && Number.isFinite(Date.parse(x))) || Date.parse(from) >= Date.parse(to)) {
    throw new Error('Provide --from and --to as increasing ISO timestamps with timezone');
  }
  return [new Date(from).toISOString(), new Date(to).toISOString()];
}

export function validateEvidence(input) {
  if (!Array.isArray(input)) throw new Error('Mail evidence must be an array');
  const allowed = new Set(['kind', 'bookingId', 'messageId', 'timestamp', 'event']);
  const identities = new Map();
  return input.map(row => {
    if (!row || Object.keys(row).some(k => !allowed.has(k)) ||
        !['booking', 'contact'].includes(row.kind) ||
        !['accepted', 'delivered', 'received'].includes(row.event) ||
        typeof row.messageId !== 'string' || !/^[A-Za-z0-9@._<>:+/-]{1,250}$/.test(row.messageId) ||
        (row.kind === 'booking' ? !Number.isSafeInteger(row.bookingId) || row.bookingId < 1 : row.bookingId != null)) {
      throw new Error('Invalid mail evidence metadata; omit all personal fields');
    }
    windowBounds(row.timestamp, '9999-12-31T23:59:59Z');
    const identity = `${row.kind}:${row.bookingId ?? ''}`;
    if (identities.has(row.messageId) && identities.get(row.messageId) !== identity) throw new Error('Conflicting message identity');
    identities.set(row.messageId, identity);
    return { ...row, timestamp: new Date(row.timestamp).toISOString() };
  });
}

export function compareEvidence(bookings, evidence, from, to) {
  const rows = validateEvidence(evidence);
  const real = bookings.filter(b => !b.isTest);
  const messageCount = (items, event) => new Set(items.filter(x => !event || x.event === event).map(x => x.messageId)).size;
  return {
    // Evidence is supplied by the operator, not independently authenticated by
    // this script. Events for one message are deduplicated by stable messageId.
    suppliedEvidenceInWindow: Object.fromEntries(['booking', 'contact'].map(kind => {
      const items = rows.filter(x => x.kind === kind && x.timestamp >= from && x.timestamp < to);
      return [kind, { messages: messageCount(items), accepted: messageCount(items, 'accepted'), delivered: messageCount(items, 'delivered'), received: messageCount(items, 'received') }];
    })),
    bookingsWithoutSuppliedMailEvidence: real.filter(b => !rows.some(x => x.kind === 'booking' && x.bookingId === b.id)).length,
    // This does NOT mean an email was not sent or delivered.
    bookingEvidenceWithoutRecordInWindow: [...new Set(rows.filter(x => x.kind === 'booking' && x.timestamp >= from && x.timestamp < to && !bookings.some(b => b.id === x.bookingId)).map(x => x.bookingId))],
    records: real.map(b => {
      const items = rows.filter(x => x.kind === 'booking' && x.bookingId === b.id);
      return { ...b, suppliedMailMessages: messageCount(items), providerAcceptedMessages: messageCount(items, 'accepted'), deliveredMessages: messageCount(items, 'delivered'), mailboxReceivedMessages: messageCount(items, 'received') };
    }),
  };
}

export async function readReconciliation(client, { from, to, evidence = [], details = false }) {
  [from, to] = windowBounds(from, to);
  validateEvidence(evidence);
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '30s'");
    const timezone = (await client.query('SHOW timezone')).rows[0].TimeZone;
    if (!['UTC', 'Etc/UTC', 'GMT'].includes(timezone)) throw new Error('Verify booking timestamp timezone before reconciliation; database must use UTC');
    const params = [from, to];
    const { rows: bookings } = await client.query(`
      SELECT b.id, to_char(b.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
        b.is_test AS "isTest", b.analytics_session_id IS NOT NULL AS "hasAttribution",
        EXISTS (SELECT 1 FROM analytics_events a WHERE a.session_id = b.analytics_session_id
          AND a.event_type = 'form_submit' AND (a.target IN ('text','ride') OR a.target IS NULL)
          AND a.created_at >= $1::timestamptz AND a.created_at < $2::timestamptz) AS "sessionHasTrackedHeroSubmit"
      FROM bookings b
      WHERE b.created_at >= ($1::timestamptz AT TIME ZONE 'UTC')
        AND b.created_at < ($2::timestamptz AT TIME ZONE 'UTC') ORDER BY b.created_at, b.id`, params);
    const { rows: tracking } = await client.query(`
      SELECT coalesce(target, 'legacy') AS kind,
        count(*) FILTER (WHERE event_type = 'form_submit')::int AS successes,
        count(DISTINCT session_id) FILTER (WHERE event_type = 'form_submit')::int AS "successSessions",
        count(*) FILTER (WHERE event_type = 'form_attempt')::int AS attempts,
        count(*) FILTER (WHERE event_type = 'form_error')::int AS errors
      FROM analytics_events WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz
        AND event_type IN ('form_submit','form_attempt','form_error') GROUP BY coalesce(target, 'legacy') ORDER BY kind`, params);
    const { rows: [sessions] } = await client.query(`
      SELECT count(DISTINCT session_id) FILTER (WHERE event_type = 'form_submit')::int AS "formSubmitSessions",
        count(*) FILTER (WHERE event_type = 'form_submit')::int AS "formSubmitEvents"
      FROM analytics_events WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz`, params);
    const comparison = compareEvidence(bookings, evidence, from, to);
    const records = comparison.records;
    delete comparison.records;
    const result = {
      window: { from, to, endExclusive: true, bookingTimestampTimezone: timezone },
      savedHeroRequests: records.length, excludedTestRecords: bookings.length - records.length,
      ...sessions, forms: tracking, mailComparison: comparison,
      limitations: [
        'Supplied mail evidence is not independently verified. No evidence does not mean no delivery.',
        'Contact messages and direct emails have no booking record.',
        'Session association cannot identify which individual submission produced a tracking event.',
        'Tracking may be absent due to consent, blocking or 180-day retention. Historical test flags may be incomplete.',
        'A stored booking proves persistence, not that the browser received the response or email was delivered.',
      ],
      ...(details ? { records } : {}),
    };
    await client.query('ROLLBACK');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--details') options.details = true;
    else if (['--from', '--to', '--mail-evidence'].includes(arg) && argv[i + 1] && !argv[i + 1].startsWith('--')) options[arg.slice(2)] = argv[++i];
    else throw new Error('Usage: --from ISO --to ISO [--mail-evidence metadata.json] [--details]');
  }
  windowBounds(options.from, options.to);
  const evidence = options['mail-evidence'] ? validateEvidence(JSON.parse(await readFile(options['mail-evidence'], 'utf8'))) : [];
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; use an existing read-only database credential');
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, application_name: 'taxibb_readonly_reconciliation' });
  try {
    await client.connect();
    const result = await readReconciliation(client, { ...options, evidence });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } finally { await client.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Reconciliation failed. Check timestamp arguments, metadata format, read access and UTC database timezone. No credentials or database error details are printed.'); process.exitCode = 1; });
}
