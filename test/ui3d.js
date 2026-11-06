// Logic smoke test for the 3D client: real art/map/UI code, FAKE three.js (can't download it here).
// Catches typos/undefined vars/crashes in my code; it cannot validate three.js API usage itself.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const FAKE=`(function(){const mk=()=>{const f=function(){};return new Proxy(f,{get(t,p){if(p===Symbol.toPrimitive)return()=>0;if(p==='length')return 0;if(p==='then')return undefined;if(p==='traverse'||p==='forEach')return()=>{};if(p==='clone')return()=>mk();if(!(p in t))t[p]=mk();return t[p]},set(t,p,v){t[p]=v;return true},apply(){return mk()},construct(){return mk()}})};
window.THREE=new Proxy({},{get:(t,p)=>t[p]||(t[p]=mk())});window.__fake=1})();`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:800,height:380},hasTouch:true});let errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message)});
await p.route('**/*',r=>{const u=r.request().url();
 if(u.includes('three.min.js'))return r.fulfill({contentType:'text/javascript',body:FAKE});
 if(u.includes('socket.io.js'))return r.fulfill({contentType:'text/javascript',body:'window.__h={};window.__em=[];window.io=()=>({id:"me",on:(e,f)=>__h[e]=f,emit:(e,d,cb)=>{__em.push([e,d])}});'});
 r.continue()});
await p.goto('file:///home/claude/ghost-tag/public/index.html');await p.waitForTimeout(300);
for(const map of ['house','forest','graveyard','school']){
 await p.evaluate(m=>{__h.go({g:'g1',map:m,pl:[{i:'me',n:'Me',c:0},{i:'g1',n:'Ghosty',c:1},{i:'h2',n:'Bob',c:5}]})},map);
 await p.waitForTimeout(400);
 await p.evaluate(()=>{const mk=(o)=>Object.assign({x:800,y:600,g:0,s:0,f:1,m:0,d:0,a:0,hd:0},o);
  for(let i=0;i<30;i++)__h.s({ph:'play',t:200,a:2,w:40,ps:[mk({i:'me',st:80,cd:0,nd:1,h:0,ms:125,fz:0}),mk({i:'g1',g:1,x:900+i*3,y:620,m:1,a:1.2,d:i>20?1:0}),mk({i:'h2',x:700,y:640,hd:i>10?1:0,m:1,a:2})]});
  __h.nade({a:800,b:600,x:880,y:620});__h.boom({x:880,y:620});__h.w({a:1.0});__h.caught({i:'h2',n:'Bob',by:'Ghosty'})});
 await p.waitForTimeout(700);
 await p.evaluate(()=>{const mk=(o)=>Object.assign({x:800,y:600,g:0,s:0,f:1,m:0,d:0,a:0,hd:0},o);__h.s({ph:'play',t:100,a:1,w:0,ps:[mk({i:'me',g:1,st:80,cd:2,nd:0,h:0,ms:155,fz:0}),mk({i:'g1',g:1}),mk({i:'h2',g:1,x:700})]})});
 await p.waitForTimeout(300);
 const em=await p.evaluate(()=>__em.filter(e=>e[0]==='i').slice(-1)[0]);console.log(map,'last input sent:',JSON.stringify(em[1]));
}
console.log('err banner:',await p.evaluate(()=>getComputedStyle(document.querySelector('#err')).display+' '+document.querySelector('#err').textContent));console.log(errs.length?'ERRORS: '+errs.length:'NO PAGE ERRORS');await b.close();process.exit(errs.length?1:0)})();
