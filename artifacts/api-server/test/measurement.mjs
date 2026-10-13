import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(join(tmpdir(), 'taxi-measurement-'));
try {
  for (const [name, input] of [['source','../taxi-app/src/lib/traffic-source.ts'], ['booking','./src/lib/booking-measurement.ts'], ['schema','../../lib/api-zod/src/request-schemas.ts'], ['admin','./src/admin-console.ts']]) {
    await build({entryPoints:[input],outfile:join(dir,name+'.mjs'),bundle:true,platform:'node',format:'esm',logLevel:'silent'});
  }
  const {classifySource,safeEntryPath} = await import(pathToFileURL(join(dir,'source.mjs')));
  assert.equal(classifySource(null,'chatgpt.com'),'ai');
  assert.equal(classifySource('gemini.google.com',null),'ai');
  assert.equal(classifySource('chatgpt.com.evil.example',null),'referral');
  assert.equal(classifySource('google.de',null),'search');
  assert.equal(classifySource('x.com',null),'social');
  assert.equal(classifySource(null,'gbp'),'business_profile');
  assert.equal(safeEntryPath('/fahrtstatus/private-token'),'/');
  assert.equal(safeEntryPath('/?email=private@example.com'),'/');
  const {fingerprintBooking} = await import(pathToFileURL(join(dir,'booking.mjs')));
  assert.equal(fingerprintBooking({destination:'A',requestKey:'one',attribution:{}}),fingerprintBooking({attribution:null,destination:'A',requestKey:'two'}));
  assert.notEqual(fingerprintBooking({destination:'A'}),fingerprintBooking({destination:'B'}));
  const {BookingStatusRequestSchema,BookingRequestSchema} = await import(pathToFileURL(join(dir,'schema.mjs')));
  assert.equal(BookingStatusRequestSchema.safeParse({status:'completed',revenueCents:-1}).success,false);
  assert.equal(BookingStatusRequestSchema.safeParse({status:'completed',revenueCents:3001}).success,true);
  assert.equal(BookingRequestSchema.safeParse({pickupLocation:'Essen',destination:'DUS',isTest:true}).success,false);
  assert.equal(BookingRequestSchema.safeParse({pickupLocation:'Essen',destination:'DUS',attribution:{sessionId:'a'.repeat(32),sourceCategory:'ai',entryPath:'/?secret=x'}}).success,false);
  let html='';
  const {serveAdminConsole} = await import(pathToFileURL(join(dir,'admin.mjs')));
  serveAdminConsole({}, {setHeader(){},send(value){html=value;}});
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new Function(script);
  console.log('Measurement checks passed: attribution, privacy paths, retries, validation, admin script.');
} finally { await rm(dir,{recursive:true,force:true}); }
