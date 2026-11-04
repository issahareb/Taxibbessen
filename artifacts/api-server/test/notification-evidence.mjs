import assert from 'node:assert/strict';
process.env.RESEND_API_KEY='re_notification_evidence_fixture';
let response={id:'fixture-provider-id'}, status=200;
globalThis.fetch=async()=>new Response(JSON.stringify(response),{status,headers:{'content-type':'application/json'}});
const {sendBookingNotification,sendContactNotification}=await import('../src/lib/email.ts');
const logs=[];
const originalLog=console.log;
console.log=(...args)=>logs.push(args.join(' '));
try {
  const booking={id:17,pickupLocation:'Private pickup',destination:'Private destination',customerName:'Private name',customerLastName:'Private surname',customerPhone:'0201000000'};
  await sendBookingNotification(booking);
  assert.deepEqual(JSON.parse(logs[0]),{event:'booking_notification',bookingId:17,status:'accepted',providerMessageId:'fixture-provider-id'});
  assert.ok(!logs.join('').includes('Private'));
  response={};
  await assert.rejects(sendBookingNotification(booking),/acceptance not confirmed/);
  await assert.rejects(sendContactNotification({firstName:'Private name',lastName:'Private surname',phone:'0201000000',email:null,message:null}),/acceptance not confirmed/);
  response={name:'validation_error',message:'Private provider details'};status=422;
  await assert.rejects(sendBookingNotification(booking),e=>e.message==='Booking notification rejected by provider');
  assert.equal(logs.length,1); // no acceptance on provider error or missing ID
} finally { console.log=originalLog; }
console.log('Notification evidence passed: correlated acceptance, missing IDs, safe provider errors; no real mail sent.');
