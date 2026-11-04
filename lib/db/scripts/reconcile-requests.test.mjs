import { test } from 'node:test';
import assert from 'node:assert/strict';
import { windowBounds, validateEvidence, compareEvidence } from './reconcile-requests.mjs';
const from = '2026-10-01T00:00:00.000Z', to = '2026-10-16T00:00:00.000Z';
test('explicit half-open window rejects ambiguous local times', () => {
  assert.deepEqual(windowBounds('2026-10-01T02:00:00+02:00', to), [from, to]);
  assert.throws(() => windowBounds('2026-10-01', to));
  assert.throws(() => windowBounds(to, from));
});
test('mail comparison deduplicates events, excludes tests and preserves unknowns', () => {
  const bookings = [{id:1,isTest:false},{id:2,isTest:false},{id:3,isTest:true}];
  const evidence = [
    {kind:'booking',bookingId:1,messageId:'m1',timestamp:from,event:'accepted'},
    {kind:'booking',bookingId:1,messageId:'m1',timestamp:from,event:'delivered'},
    {kind:'booking',bookingId:1,messageId:'m1',timestamp:from,event:'delivered'},
    {kind:'contact',messageId:'c1',timestamp:from,event:'received'},
    {kind:'booking',bookingId:99,messageId:'m99',timestamp:to,event:'accepted'},
  ];
  const result=compareEvidence(bookings,evidence,from,to);
  assert.equal(result.records.length,2);
  assert.equal(result.bookingsWithoutSuppliedMailEvidence,1);
  assert.deepEqual(result.suppliedEvidenceInWindow.booking,{messages:1,accepted:1,delivered:1,received:0});
  assert.equal(result.records[0].suppliedMailMessages,1);
  assert.deepEqual(result.bookingEvidenceWithoutRecordInWindow,[]);
  assert.equal(result.records[1].deliveredMessages,0); // no evidence, not proof of failure
});
test('rejects personal fields and conflicting message identities', () => {
  const row={kind:'booking',bookingId:1,messageId:'m1',timestamp:from,event:'accepted'};
  assert.throws(()=>validateEvidence([{...row,email:'private@example.test'}]));
  assert.throws(()=>validateEvidence([row,{...row,bookingId:2}]));
});
