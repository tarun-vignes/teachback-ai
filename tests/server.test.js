import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

async function launch(t,extra={}) {
  const child=spawn(process.execPath,['server.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',GEMINI_API_KEY:'',APP_ORIGIN:'https://teachback.example',...extra},stdio:['ignore','pipe','pipe']});
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
