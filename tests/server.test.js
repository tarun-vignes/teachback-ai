import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import http from 'node:http';

async function launch(t,extra={}) {
  const child=spawn(process.execPath,[...(extra.TEST_PROVIDER_MODE?['--import','./scripts/provider-fixture.mjs']:[]),'server.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',GEMINI_API_KEY:'',APP_ORIGIN:'https://teachback.example',...extra},stdio:['ignore','pipe','pipe']});
  t.after(()=>{child.kill();});
  const ready=await Promise.race([once(child.stdout,'data').then(([s])=>s.toString()),once(child,'exit').then(()=>{throw Error('Server exited early');})]);
  const port=ready.match(/:(\d+)/)?.[1];assert.ok(port);
  return `http://127.0.0.1:${port}`;
}
test('hosted health, source protection, and origin validation',async t=>{
  const url=await launch(t);
  assert.equal((await fetch(url+'/healthz')).status,200);
  assert.equal((await fetch(url+'/.env')).status,404);
  assert.equal((await fetch(url+'/server.js')).status,404);
  const status=await (await fetch(url+'/api/status')).json();assert.equal(status.configured,false);
  for(const origin of ['https://attacker.example','null','not-a-url']){
    const r=await fetch(url+'/api/review',{method:'POST',headers:{origin,'x-teachback-intent':'review'},body:'{}'});assert.equal(r.status,403);
  }
  const r=await fetch(url+'/api/review',{method:'POST',headers:{origin:'https://teachback.example','x-teachback-intent':'review'},body:'{}'});assert.equal(r.status,503);
});
test('daily limit stops inference before any outbound request',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',MAX_DAILY_REVIEWS:'0'});
  const r=await fetch(url+'/api/review',{method:'POST',headers:{origin:'https://teachback.example','x-teachback-intent':'review','Content-Type':'application/json'},body:JSON.stringify({notes:'Original study material. '.repeat(6),topic:'Test concept',explanation:'This is my own explanation of the test concept.'})});
  assert.equal(r.status,429);assert.match((await r.json()).error,/daily/);
});
const input={notes:'Study notes say that const prevents reassignment of a variable. Objects can still be changed.',topic:'const in JavaScript',explanation:'Const prevents variable reassignment but objects can still change.'};
const headers={origin:'https://teachback.example','x-teachback-intent':'review','Content-Type':'application/json'};
const post=(url,body=input)=>fetch(url+'/api/review',{method:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)});
test('malformed JSON, oversized body and missing intent are rejected',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:'ok'});
  assert.equal((await post(url,'not json')).status,400);
  assert.equal((await post(url,{...input,notes:'x'.repeat(70000)})).status,413);
  assert.equal((await post(url,{...input,notes:'x'.repeat(24001)})).status,400);
  assert.equal((await fetch(url+'/api/review',{method:'POST',body:JSON.stringify(input)})).status,403);
});
for(const mode of ['status-401','status-429','status-503','empty','invalid-json','network','timeout'])test(`provider ${mode} fails visibly without exposing private errors or keys`,async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:mode});
  const response=await post(url);assert.equal(response.status,502);const text=await response.text();assert.doesNotMatch(text,/fake-test-key|PRIVATE_PROVIDER_ERROR/);assert.match(text,/error/);
});
test('fabricated provider quotes are downgraded through the real HTTP endpoint',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:'invented'});const result=await (await post(url)).json();assert.equal(result.mode,'live');assert.equal(result.findings[0].kind,'uncertain');assert.equal(result.findings[0].quote,'');
});
test('only two concurrent requests reach inference and slots are released',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:'slow'});
  const responses=await Promise.all([post(url),post(url),post(url)]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,200,429]);assert.equal((await post(url)).status,200);
});
test('ninth request is rate limited without provider calls',async t=>{
  const url=await launch(t);for(let i=0;i<8;i++)assert.equal((await post(url)).status,503);assert.equal((await post(url)).status,429);
});
test('UTF-8 characters survive an HTTP chunk boundary',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:'echo'});
  const payload={...input,notes:input.notes+' Résumé 中文 🚀 notes.'};const buffer=Buffer.from(JSON.stringify(payload));const split=buffer.indexOf(Buffer.from('🚀'))+1;
  const result=await new Promise((resolve,reject)=>{const req=http.request(url+'/api/review',{method:'POST',headers},res=>{let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>{try{resolve(JSON.parse(text));}catch(e){reject(e);}});});req.on('error',reject);req.write(buffer.subarray(0,split));setTimeout(()=>req.end(buffer.subarray(split)),30);});assert.equal(result.summary,payload.notes);
});
test('static routes do not expose source, Git metadata or traversal targets',async t=>{
  const url=await launch(t,{GEMINI_API_KEY:'fake-test-key',TEST_PROVIDER_MODE:'ok'});
  for(const path of ['/.git/config','/package.json','/core.js','/scripts/provider-fixture.mjs','/%2e%2e/.env','/public/../server.js'])assert.equal((await fetch(url+path)).status,404,path);
  const home=await fetch(url);assert.match(home.headers.get('content-security-policy'),/object-src 'none'/);assert.equal(home.headers.get('x-content-type-options'),'nosniff');assert.equal(home.headers.get('referrer-policy'),'no-referrer');assert.equal(home.headers.get('access-control-allow-origin'),null);
  const status=await (await fetch(url+'/api/status')).text();assert.doesNotMatch(status,/fake-test-key/);
});
