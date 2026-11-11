// Explicit Node preload used only by integration tests; never loaded by the application.
const mode=process.env.TEST_PROVIDER_MODE;
globalThis.fetch=async(url,options)=>{
  if(!String(url).startsWith('https://generativelanguage.googleapis.com/'))throw Error('Unexpected test-provider destination');
  if(mode==='timeout')throw new DOMException('Simulated provider timeout','TimeoutError');
  if(mode==='network')throw new TypeError('Simulated network failure');
  if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,300));
  if(/^status-/.test(mode))return new Response(JSON.stringify({error:{message:'PRIVATE_PROVIDER_ERROR'}}),{status:Number(mode.slice(7))});
  if(mode==='empty')return Response.json({candidates:[]});
  if(mode==='invalid-json')return Response.json({candidates:[{content:{parts:[{text:'not json'}]}}]});
  const request=JSON.parse(options.body);
  const input=JSON.parse(request.contents[0].parts[0].text);
  const quote=mode==='invented'?'A completely fabricated source passage.':input.notes.slice(0,70);
  const feedback={summary:mode==='echo'?input.notes:'This is a mocked provider response.',findings:[{kind:'supported',claim:'A test claim',feedback:'A test observation',quote,studentQuote:input.explanation}],question:'What do your notes establish?',practiceFeedback:input.practice?'Test practice reflection':''};
  return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(feedback)}]}}]});
};
