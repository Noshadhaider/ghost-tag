const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:900,height:900}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file:///home/claude/ghost-tag/test/art.html');await p.waitForTimeout(500);
for(const id of ['m_house','m_forest','sprites'])await(await p.$('#'+id)).screenshot({path:'/home/claude/'+id+'.png'});
await b.close()})();
