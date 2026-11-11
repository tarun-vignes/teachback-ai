import {chromium,firefox,webkit} from 'playwright-core';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const engine=process.env.TEST_BROWSER||'chromium',report={engine,startedAt:new Date().toISOString(),checks:[]};let server,browser;
try{
  server=spawn(process.execPath,['server.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',GEMINI_API_KEY:'',APP_ORIGIN:'',RENDER_EXTERNAL_URL:''},stdio:['ignore','pipe','pipe']});
  const [ready]=await once(server.stdout,'data');const origin='http://127.0.0.1:'+ready.toString().match(/:(\d+)/)[1];
  browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chromium'?{executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
  const page=await browser.newPage();await page.goto(origin);page.setDefaultTimeout(30000);
  const upload=async file=>{await page.locator('#file').setInputFiles(fileURLToPath(new URL('../artifacts/real-pdfs/'+file,import.meta.url)));await page.waitForFunction(()=>!document.getElementById('review').disabled,{},{timeout:30000});};
  await upload('tracemonkey-excerpt.pdf');const text=await page.locator('#notes').inputValue();assert.match(await page.locator('#error').innerText(),/imported locally/);assert.match(text,/Trace-based Just-in-Time/);assert.match(text,/Introduction/);assert.ok(text.length>=80&&text.length<=24000);report.checks.push({name:'actual two-column academic paper excerpt',pass:true,characters:text.length});
  await upload('password.pdf');assert.match(await page.locator('#error').innerText(),/Password-protected/);assert.equal(await page.locator('#notes').inputValue(),text);report.checks.push({name:'actual encrypted regression PDF',pass:true});
  await upload('tracemonkey.pdf');assert.match(await page.locator('#error').innerText(),/too long/);assert.equal(await page.locator('#notes').inputValue(),text);report.checks.push({name:'full-length academic paper rejected at text limit without losing notes',pass:true});
  console.log(JSON.stringify(report));
}catch(e){report.error=e.message;process.exitCode=1;console.error(e);}finally{await browser?.close();server?.kill();await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL(`../artifacts/real-pdfs-${engine}.json`,import.meta.url),JSON.stringify(report,null,2));}
