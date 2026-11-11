import {PDFDocument} from 'pdf-lib';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
await mkdir(new URL('../artifacts/real-pdfs/',import.meta.url),{recursive:true});
for(const [name,url]of [['tracemonkey.pdf','https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'],['password.pdf','https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/issue3371.pdf']]){const target=new URL('../artifacts/real-pdfs/'+name,import.meta.url);try{await access(target);}catch{const response=await fetch(url);if(!response.ok)throw Error(`Fixture download failed: ${response.status}`);await writeFile(target,Buffer.from(await response.arrayBuffer()));}}
const source=new URL('../artifacts/real-pdfs/tracemonkey.pdf',import.meta.url);
const pdf=await PDFDocument.load(await readFile(source));
const excerpt=await PDFDocument.create();for(const page of await excerpt.copyPages(pdf,[0,1]))excerpt.addPage(page);
await writeFile(new URL('../artifacts/real-pdfs/tracemonkey-excerpt.pdf',import.meta.url),await excerpt.save());
console.log('Prepared two original pages, including the original text, columns and fonts. Source: https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
