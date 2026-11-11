import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
const url=process.env.TEST_ORIGIN || 'https://teachback-ai-a8n3.onrender.com';
const executablePath=process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath});
const report={startedAt:new Date().toISOString(),url};
try{
  const context=await browser.newContext();const page=await context.newPage();const started=performance.now();
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  report.initialStatus=response.status();report.initialTitle=await page.title();report.loadingScreenObserved=(await page.locator('#notes').count())===0;
  console.log(JSON.stringify({phase:'first-response',...report}));
  await page.locator('#notes').waitFor({state:'visible',timeout:120000});
  await page.waitForFunction(()=>document.getElementById('connection').textContent.includes('AI'),{},{timeout:30000});
  report.readyAfterMs=Math.round(performance.now()-started);report.finalTitle=await page.title();
  report.health=await page.evaluate(async()=>(await fetch('/healthz')).status);
  report.finalStatus=await page.evaluate(async()=>await (await fetch('/api/status')).json());report.pass=report.health===200&&report.finalStatus.configured;
  console.log(JSON.stringify(report));if(!report.pass)process.exitCode=1;
}catch(e){report.error=e.message;process.exitCode=1;console.error(e.message);}finally{await browser.close();await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/cold-start.json',import.meta.url),JSON.stringify(report,null,2));}
