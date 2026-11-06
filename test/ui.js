const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:800,height:380},hasTouch:true});let errs=0;
p.on('pageerror',e=>{errs++;console.log('PAGEERR',e.message)});
await p.route('**/*',r=>{const u=r.request().url();
 if(u.includes('phaser'))return r.fulfill({contentType:'text/javascript',body:'window.Phaser={Scene:class{},AUTO:0,Scale:{RESIZE:1},Game:class{constructor(c){window.__game=c}}};'});
 if(u.includes('socket.io.js'))return r.fulfill({contentType:'text/javascript',body:'window.__h={};window.io=()=>({id:"me",on:(e,f)=>__h[e]=f,emit:(e,d,cb)=>{(window.__em=window.__em||[]).push(e)}});'});
 r.continue()});
await p.goto('file:///home/claude/ghost-tag/public/index.html');
// file:// paths for /socket.io are absolute; route handles it
await p.waitForTimeout(300);
await p.screenshot({path:'/home/claude/ui_menu.png'});
await p.evaluate(()=>__h.lobby({code:'ABCD',host:'me',map:'forest',maps:[{id:'house',name:'Haunted House'},{id:'forest',name:'Dark Woods'}],pl:[{i:'me',n:'Noshad',c:0},{i:'b1',n:'Boo (bot)',c:1,b:1}]}));
await p.waitForTimeout(200);await p.screenshot({path:'/home/claude/ui_lobby.png'});
console.log('errors:',errs);await b.close()})();
