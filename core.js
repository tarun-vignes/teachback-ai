export function validateInput(data) {
  if (!data || typeof data !== 'object') throw new Error('Provide notes, a topic, and your explanation.');
  for (const [key, min, max] of [['notes',80,24000],['topic',2,160],['explanation',20,4000]]) {
    if (typeof data[key] !== 'string' || data[key].trim().length < min || data[key].length > max) throw new Error(`${key}: enter ${min}–${max} characters.`);
  }
  if (data.practice !== undefined && (typeof data.practice !== 'string' || data.practice.length > 4000)) throw new Error('Practice answer is too long.');
  if (data.question !== undefined && (typeof data.question !== 'string' || data.question.length > 1500)) throw new Error('Invalid practice question.');
  return {notes:data.notes,topic:data.topic,explanation:data.explanation,...(data.practice!==undefined?{practice:data.practice}:{}),...(data.question!==undefined?{question:data.question}:{})};
}
export const schema = {
  type:'object', required:['summary','findings','question','practiceFeedback'],
  properties:{summary:{type:'string'},findings:{type:'array',minItems:1,maxItems:4,items:{type:'object',required:['kind','claim','feedback','quote','studentQuote'],properties:{kind:{type:'string',enum:['supported','revisit','uncertain']},claim:{type:'string'},feedback:{type:'string'},quote:{type:'string'},studentQuote:{type:'string'}}}},question:{type:'string'},practiceFeedback:{type:'string'}}
};
export function validateFeedback(value, notes, explanation) {
  if (!value || typeof value.summary !== 'string' || !value.summary.trim() || value.summary.length > 2000 || typeof value.question !== 'string' || !value.question.trim() || value.question.length > 1500 || typeof value.practiceFeedback !== 'string' || value.practiceFeedback.length > 2000 || !Array.isArray(value.findings) || value.findings.length < 1 || value.findings.length > 4) throw new Error('The AI returned incomplete feedback. Please retry.');
  const normalized = text => text.replace(/\s+/g,' ').trim();
  const findings = value.findings.map(f => {
    if (!f || !['supported','revisit','uncertain'].includes(f.kind) || ['claim','feedback','quote','studentQuote'].some(k => typeof f[k] !== 'string' || f[k].length > 2000) || !f.claim.trim() || !f.feedback.trim()) throw new Error('The AI returned invalid feedback. Please retry.');
    const verified = f.quote.trim().length >= 15 && normalized(notes).includes(normalized(f.quote));
    const studentVerified=typeof explanation==='string'&&f.studentQuote.trim().length>=12&&normalized(explanation).includes(normalized(f.studentQuote));
    return {kind: verified&&studentVerified ? f.kind : 'uncertain',claim:f.claim,feedback:!studentVerified?'The model did not provide a matching passage from your explanation for this point. Treat it as uncertain.':verified ? f.feedback : 'The model did not provide a verifiable passage for this point. Check your notes or ask your teacher.',quote:verified ? f.quote : '',verified,studentQuote:studentVerified?f.studentQuote:'',studentVerified};
  });
  return {summary:value.summary,findings,question:value.question,practiceFeedback:value.practiceFeedback};
}
