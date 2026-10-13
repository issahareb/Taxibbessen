import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
const dbUrl = new URL(process.env.DATABASE_URL);
assert.ok(['127.0.0.1','localhost'].includes(dbUrl.hostname), 'Only an isolated local test database may be used');
assert.equal(dbUrl.pathname,'/taxi_measurement_test');
const port = 32000 + Math.floor(Math.random()*5000);
const base = `http://127.0.0.1:${port}/api`;
const key = randomUUID();
let output = '';
const child = spawn(process.execPath,['--import','./test/mail-stub.mjs','./dist/index.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,NODE_ENV:'test',PORT:String(port),ADMIN_API_KEY:key,RESEND_API_KEY:'re_integration_test',SKIP_DB_MIGRATIONS:'false'},stdio:['ignore','pipe','pipe']});
child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c);
async function request(path, method='GET', body, headers={}) {
  const r = await fetch(base+path,{method,headers:{'content-type':'application/json',...headers},...(body === undefined ? {} : {body:JSON.stringify(body)})});
  return {status:r.status,data:r.status===204?null:await r.json(),headers:r.headers};
}
const admin = {'x-admin-key':key};
try {
  let ready=false;
  for(let i=0;i<200;i++) {
    if(child.exitCode!==null) throw new Error('Server failed: '+output);
    try { if((await fetch(base+'/healthz')).ok){ready=true;break;} }catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  assert.ok(ready,'Server readiness, including migration: '+output);
  const sessionId='a'.repeat(32);
  const event={sessionId,eventType:'pageview',path:'/',sourceCategory:'ai'};
  assert.equal((await request('/track','POST',{events:[event,{...event,eventType:'form_start'}]})).status,204);
  const body={pickupLocation:'Essen Hbf',destination:'Düsseldorf Flughafen',customerName:'Integrationstest',customerPhone:'0201000000',requestKey:randomUUID(),attribution:{sessionId,sourceCategory:'ai',entryPath:'/'}};
  const submitted=await Promise.all([request('/bookings','POST',body),request('/bookings','POST',body)]);
  assert.deepEqual(submitted.map(x=>x.status).sort(),[200,201]);
  const id=submitted[0].data.requestId;
  assert.equal(submitted[1].data.requestId,id);
  assert.deepEqual(Object.keys(submitted[0].data).sort(),['message','ok','requestId']);
  assert.equal((await request('/bookings','POST',{...body,destination:'Anderes Ziel'})).status,409);
  const untracked=await request('/bookings','POST',{...body,requestKey:randomUUID(),attribution:null});
  assert.equal(untracked.status,201);
  assert.equal((await request(`/bookings/${id}/status`,'PATCH',{status:'accepted',revenueCents:5000},admin)).status,400);
  assert.equal((await request(`/bookings/${id}/status`,'PATCH',{status:'completed',revenueCents:5000},admin)).status,200);
  let overview=await request('/analytics/overview?days=7','GET',undefined,admin);
  assert.equal(overview.status,200,JSON.stringify(overview.data));
  assert.equal(overview.data.outcomes.bookings,2);
  assert.equal(overview.data.outcomes.completed,1);
  assert.equal(overview.data.outcomes.revenueCents,5000);
  assert.equal(overview.data.funnel.visitors,1);
  assert.equal(overview.data.funnel.linkedBookingSessions,1);
  const testId=untracked.data.requestId;
  assert.equal((await request(`/bookings/${testId}/status`,'PATCH',{status:'new',isTest:true},admin)).status,200);
  overview=await request('/analytics/overview?days=7','GET',undefined,admin);
  assert.equal(overview.data.outcomes.bookings,1);
  const setup=await request('/admin/setup','POST',{setupKey:key,password:'integration-password-only-123'});
  assert.equal(setup.status,201);
  const cookie=setup.headers.get('set-cookie').split(';')[0];
  assert.equal((await request(`/bookings/${id}/status`,'PATCH',{status:'accepted'},{cookie})).status,403);
  assert.equal((await request(`/bookings/${id}/status`,'PATCH',{status:'accepted'},{cookie,'x-csrf-token':setup.data.csrfToken})).status,200);
  overview=await request('/analytics/overview?days=7','GET',undefined,admin);
  assert.equal(overview.data.outcomes.revenueCents,0);
  console.log('Database integration passed: migrations, concurrent retry, payload conflict, private receipt, consent cohort, test exclusion, revenue and CSRF.');
} finally { child.kill('SIGTERM'); }
