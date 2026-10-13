// Only loaded by the isolated integration test process. Never sends email.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url ?? input);
  if (url.hostname === 'api.resend.com') return Promise.resolve(new Response(JSON.stringify({id:'integration-test-mail'}), {status:200,headers:{'content-type':'application/json'}}));
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return originalFetch(input, init);
  throw new Error('External network disabled in integration tests');
};
