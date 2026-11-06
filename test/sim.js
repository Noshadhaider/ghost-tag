// Headless server test: stubs express/socket.io, drives fake sockets + bot-only matches.
const Module=require('module'),orig=Module._load;let conn=null;const log=[];
const fakeIO=function(){return{on:(e,cb)=>{if(e==='connection')conn=cb},to:r=>({emit:(ev,d)=>log.push([r,ev,d])})}};
Module._load=function(req,...a){
 if(req==='express'){const f=()=>({use(){}});f.static=()=>0;return f}
 if(req==='socket.io')return{Server:fakeIO};
 return orig.call(this,req,...a)};
const http=require('http');http.createServer=()=>({listen(){}});
const S=require('../server.js');Module._load=orig;
const GM=require('../public/map.js');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};

// ---- fake socket helper
function sock(id){const h={},emitted=[];return{id,data:{},rooms:new Set(),join(c){this.rooms.add(c)},leave(c){this.rooms.delete(c)},
 on(e,cb){h[e]=cb},fire(e,d,cb){h[e]&&h[e](d,cb)},emit(){} ,h}}
const A=sock('A'),B=sock('B');conn(A);conn(B);
let res;A.fire('create',{name:'Alice',map:'forest'},r=>res=r);
const code=Object.keys(S.rooms)[0],room=S.rooms[code];
ok(room&&room.map==='forest','create room with forest map');
B.fire('join',{name:'Bob',code},r=>res=r);ok(room.players.length===2,'join room by code');
B.fire('join',{name:'X',code:'ZZZZ'},r=>res=r);ok(res&&res.err==='Room not found','bad code rejected');
B.fire('start');ok(room.phase==='lobby','non-host cannot start');
A.fire('setmap','house');ok(room.map==='house','host can change map');
A.fire('bot',true);A.fire('bot',true);ok(room.players.length===4,'host adds bots');
A.fire('bot',false);ok(room.players.length===3,'host removes bot');
A.fire('start');ok(room.phase==='count','host starts match');
ok(room.players.filter(p=>p.g).length===1,'exactly one ghost at start');
const M=GM.MAPS.house;
ok(room.players.every(p=>!GM.hit(M,p)),'spawns are not inside walls');
ok(Object.keys(GM.MAPS).length>=4,'4+ maps registered');
// movement validation: speed cap
const hum=room.players.find(p=>!p.g&&!p.bot);const sk=hum.id==='A'?A:B;
for(let i=0;i<30*17;i++)S.tick(room,1/30); // finish countdown (HIDE=15s)
ok(room.phase==='play','countdown -> play');
sk.fire('i',{x:9999,y:-9999,r:1});
const p0={x:hum.x,y:hum.y};for(let i=0;i<30;i++)S.tick(room,1/30);
ok(Math.hypot(hum.x-p0.x,hum.y-p0.y)<=181,'server clamps input; max human run ~175px/s (moved '+Math.hypot(hum.x-p0.x,hum.y-p0.y).toFixed(0)+')');
ok(room.players.every(p=>!GM.hit(M,p)),'nobody inside walls after moving');
// ---- crouch: slower, hides in low cover, stealth vs ghost
{const lowH=M.hide.find(h=>GM.LOW[h[0]]);const hm=room.players.find(p=>!p.g&&!p.bot);const hsk=hm.id==='A'?A:B;
 hm.x=lowH[1]+lowH[3]/2;hm.y=lowH[2]+lowH[4]/2;hsk.fire('i',{x:0,y:0,r:0,c:0});S.tick(room,1/30);ok(!hm.hid,'standing in a bush/low cover does NOT hide');
 hsk.fire('i',{x:0,y:0,r:0,c:1});S.tick(room,1/30);ok(hm.hid&&hm.cr,'crouching in low cover hides');
 const q={x:hm.x,y:hm.y};hsk.fire('i',{x:1,y:0,r:1,c:1});for(let i=0;i<15;i++)S.tick(room,1/30);ok(Math.hypot(hm.x-q.x,hm.y-q.y)<=36,'crouch caps speed (~70px/s), run ignored; moved '+Math.hypot(hm.x-q.x,hm.y-q.y).toFixed(0));
 hsk.fire('i',{x:0,y:0,r:0,c:0});}
// grenade is once only
if(!hum.g){sk.fire('n');ok(hum.nade===false,'grenade consumed');const n=room.nades.length;sk.fire('n');ok(room.nades.length===n,'grenade cannot be reused')}
// ---- 3 lives: each ghost hit costs a life (with knockback + safety time); the 3rd hit makes you a ghost
{const r=S.newRoom(false,'house');S.addBot(r);S.addBot(r);S.startMatch(r);r.phase='play';r.t=200;
 const gh=r.players.find(p=>p.g),hm=r.players.find(p=>!p.g),oth=r.players.filter(p=>!p.g&&p!==hm);oth.forEach(o=>{o.x=60;o.y=60});
 const M3=GM.MAPS.house;let FX=1350,FY=900;outer:for(let y=200;y<M3.H-200;y+=20)for(let x=200;x<M3.W-200;x+=20){let ok2=true;for(let a=-130;a<=130&&ok2;a+=10)for(let b=-40;b<=40&&ok2;b+=10)if(GM.hit(M3,{x:x+a,y:y+b},20))ok2=false;if(ok2){FX=x;FY=y;break outer}}
 const put=()=>{hm.x=FX;hm.y=FY;gh.x=FX+10;gh.y=FY;gh.frz=0;gh.stun=0;hm.dx=hm.dy=gh.dx=gh.dy=0};
 gh.bot=false;hm.bot=false; // freeze AI so we control positions
 put();const t0=log.length;S.tick(r,1/30);ok(hm.hp===2&&!hm.g,'1st hit: human keeps 2 lives and stays human');
 ok(hm.inv>2,'hit gives safety time');const d1=Math.hypot(hm.x-FX,hm.y-FY);ok(d1>40&&!GM.hit(M3,hm),'hit knocks the human back (moved '+d1.toFixed(0)+'px) without entering walls');
 hm.x=gh.x+5;hm.y=gh.y;gh.frz=0;S.tick(r,1/30);ok(hm.hp===2,'no double damage while safety time is active');
 hm.inv=0;put();S.tick(r,1/30);ok(hm.hp===1&&!hm.g,'2nd hit: 1 life left');
 hm.inv=0;put();S.tick(r,1/30);ok(hm.hp===0&&hm.g,'3rd hit: human turns into a ghost');
 ok(log.slice(t0).filter(l=>l[1]==='caught').length===1,'only the 3rd hit sends "caught"');}
// ---- bot-only full matches on both maps
for(const mapId of Object.keys(GM.MAPS)){
 const r=S.newRoom(false,mapId);for(let i=0;i<5;i++)S.addBot(r);S.startMatch(r);
 let t=0,caught=0,endAt=null,bad=false;const before=log.length;
 while(r.phase!=='end'&&t<400*30){S.tick(r,1/30);t++;if(r.players.some(p=>GM.hit(GM.MAPS[mapId],p)))bad=true}
 const ev=log.slice(before).filter(l=>l[0]===r.code);caught=ev.filter(l=>l[1]==='caught').length;
 const end=ev.find(l=>l[1]==='end');
 console.log('  ['+mapId+'] bots-only match ended after '+(t/30).toFixed(0)+'s, caught '+caught+', whistles '+ev.filter(l=>l[1]==='boom').length+' booms, winner '+(end&&end[2].w));
 ok(r.phase==='end'&&end,mapId+': match terminates cleanly');
 ok(!bad,mapId+': bots never walk through walls');
 const dmg=r.players.reduce((a,p)=>a+(3-p.hp),0);ok(caught>0||dmg>0,mapId+': ghost bots actually hit humans ('+dmg+' lives lost, '+caught+' turned)');
 ok(ev.some(l=>l[1]==='boom'),mapId+': human bots use stun grenade');
}
// ---- leaving
A.fire('leave');B.fire('leave');ok(!S.rooms[code],'room deleted when last real player leaves');
console.log(fails?('\n'+fails+' FAILED'):'\nALL PASSED');process.exit(fails?1:0);
