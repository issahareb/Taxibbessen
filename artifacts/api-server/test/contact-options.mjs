import assert from 'node:assert/strict';
import { BookingRequestSchema } from '../../../lib/api-zod/src/request-schemas.ts';

// Exercise the actual notification builder without making external mail requests.
process.env.RESEND_API_KEY = 're_contact_options_test';
const sent=[];
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  assert.equal(url.hostname, 'api.resend.com');
  sent.push(JSON.parse(init.body));
  return new Response(JSON.stringify({id:'local-contact-test'}), {status:200,headers:{'content-type':'application/json'}});
};
const { sendBookingNotification } = await import('../src/lib/email.ts');
const base={pickupLocation:'Nicht angegeben',destination:'Nicht angegeben',notes:'Isolierter Funktionstest'};
for(const contact of [{customerPhone:'0201 707060'},{customerEmail:'test+kontakt@example.com'}]){
  const parsed=BookingRequestSchema.parse({...base,...contact});
  await sendBookingNotification({...parsed,id:1,customerName:'Test',customerLastName:'',customerPhone:parsed.customerPhone??'Nicht angegeben'});
}
assert.match(sent[0].html,/href="tel:0201 707060"/);
assert.match(sent[0].html,/Jetzt zurückrufen/);
assert.match(sent[1].html,/test\+kontakt@example.com/);
assert.match(sent[1].html,/href="mailto:test%2Bkontakt%40example.com"/);
assert.match(sent[1].html,/Per E-Mail antworten/);
assert.ok(!sent[1].html.includes('href="tel:'));
for(const invalid of [{customerPhone:'abc'},{customerEmail:'test@'},{customerEmail:'x\ny@example.com'}]){
  assert.equal(BookingRequestSchema.safeParse({...base,...invalid}).success,false);
}
console.log('Contact options passed: phone and email schema validation, correct notification field and reply action; no mail sent.');
