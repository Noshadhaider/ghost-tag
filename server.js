// GHOST TAG - authoritative multiplayer server (Express + Socket.IO)
const express=require('express'),http=require('http'),path=require('path'),{Server}=require('socket.io');
const GM=require('./public/map.js'),{MAPS,hit,move,inHide,inLow,inZone,clamp,R}=GM;
const app=express();app.use(express.static(path.join(__dirname,'public')));
const srv=http.createServer(app),io=new Server(srv,{pingInterval:8000,pingTimeout:12000});
const rooms={};let botSeq=0;
const rnd=n=>Math.floor(Math.random()*n),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const BOTN=['Boo','Casper','Mina','Zed','Pixel','Luna','Nova','Ziggy'];
const TASK_T=4,TASK_R=55,EXIT_R=70,TASKS_PER=3; // each human needs TASKS_PER tasks: stand inside TASK_R for TASK_T seconds each; then the exit unlocks
const cur=(M,p)=>(!p.g&&!p.td&&p.tks.length)?M.tasks[p.tks[p.tdone]]:null; // the task a human is working on now
const SPEED={ghost:155,dash:380,run:175,walk:125,crouch:70},TAG_R=34,NADE_R=150,CROUCH_VIS=280,LIVES=3,INV_TIME=2.6,KNOCK=95; // humans have LIVES hits; after a hit: INV_TIME s of safety + knockback // crouched humans are only visible to ghosts within CROUCH_VIS px
const mkCode=()=>{let c;do c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[rnd(24)]).join('');while(rooms[c]);return c};
const room=s=>rooms[s.data.room];
const reals=r=>r.players.filter(p=>!p.bot);

/* ---------- lobby / rooms ---------- */
function lobby(r){io.to(r.code).emit('lobby',{code:r.code,host:r.host,map:r.map,maps:GM.list(),pl:r.players.map(p=>({i:p.id,n:p.name,c:p.c,b:p.bot?1:0}))})}
function mkPlayer(id,name,r,bot){let c=0;while(r.players.some(p=>p.c===c))c++;
 return{id,name,c,bot:!!bot,x:0,y:0,g:false,dx:0,dy:0,run:0,st:100,stun:0,frz:0,dashT:0,dashCd:0,nade:true,fx:1,fy:0,fl:1,yaw:0,hy:false,hid:false,cr:false,lg:false,mv:0,tags:0,hp:3,inv:0,ai:0,spot:null,hint:null,lx:0,ly:0,stuck:0,esc:false,tks:[],tdone:0,tp:0,td:false}}
function join(s,name,r){leave(s);name=String(name||'Player').replace(/[<>]/g,'').slice(0,12)||'Player';
 r.players.push(mkPlayer(s.id,name,r,false));s.join(r.code);s.data.room=r.code;if(!r.host)r.host=s.id;lobby(r)}
function addBot(r){if(r.players.length>=8)return false;const nm=BOTN[botSeq%BOTN.length]+' (bot)';
 r.players.push(mkPlayer('bot'+(++botSeq),nm,r,true));return true}
function leave(s){const r=room(s);if(!r)return;s.leave(r.code);s.data.room=null;
 r.players=r.players.filter(p=>p.id!==s.id);
 if(!reals(r).length){delete rooms[r.code];return}
 if(r.host===s.id)r.host=reals(r)[0].id;
 if(r.phase==='lobby'){lobby(r);return}
 if(r.phase==='end')return;
 if(r.players.length<2){r.phase='lobby';io.to(r.code).emit('abort');lobby(r);return}
 if(!r.players.some(p=>p.g))r.players[rnd(r.players.length)].g=true}
function newRoom(pub,map){const r={code:mkCode(),pub,map:MAPS[map]?map:'house',players:[],phase:'lobby',host:null,t:0,nades:[],tk:0,nw:0,last:''};rooms[r.code]=r;return r}
function startMatch(r){const M=MAPS[r.map];if(r.phase!=='lobby'||r.players.length<2)return;
 const gi=rnd(r.players.length),sp=M.spawns.slice(1).sort(()=>Math.random()-.5),ti=M.tasks.map((_,i)=>i).sort(()=>Math.random()-.5);let k=0,tc=0;
 r.players.forEach((p,i)=>{p.g=i===gi;const q=p.g?M.spawns[0]:sp[k++%sp.length];
  Object.assign(p,{x:q[0],y:q[1],dx:0,dy:0,run:0,st:100,stun:0,frz:0,dashT:0,dashCd:0,nade:true,hid:false,cr:false,mv:0,tags:0,hp:3,inv:0,spot:null,hint:null,last:null,ai:0,stuck:0,esc:false,tp:0,td:false,tdone:0,tks:p.g?[]:Array.from({length:TASKS_PER},()=>ti[tc++%ti.length])})});
 r.phase='count';r.t=M.HIDE;r.nw=M.MATCH-60;r.nades=[];r.last='';
 io.to(r.code).emit('go',{g:r.players[gi].id,map:r.map,pl:r.players.map(p=>({i:p.id,n:p.name,c:p.c}))})}

io.on('connection',s=>{
 const me=()=>{const r=room(s);return r&&r.players.find(x=>x.id===s.id)};
 s.on('create',(d,cb)=>{join(s,d&&d.name,newRoom(false,d&&d.map));cb&&cb({})});
 s.on('quick',(d,cb)=>{const r=Object.values(rooms).find(r=>r.pub&&r.phase==='lobby'&&r.players.length<8)||newRoom(true);join(s,d&&d.name,r);cb&&cb({})});
 s.on('practice',(d,cb)=>{const r=newRoom(false,d&&d.map);join(s,d&&d.name,r);for(let i=0;i<3;i++)addBot(r);startMatch(r);cb&&cb({})});
 s.on('join',(d,cb)=>{const r=rooms[String(d&&d.code||'').toUpperCase()];cb=cb||(()=>{});
  if(!r)return cb({err:'Room not found'});if(r.phase!=='lobby')return cb({err:'Match already started'});
  if(r.players.length>=8)return cb({err:'Room is full'});join(s,d.name,r);cb({})});
 s.on('setmap',id=>{const r=room(s);if(r&&r.phase==='lobby'&&r.host===s.id&&MAPS[id]){r.map=id;lobby(r)}});
 s.on('bot',add=>{const r=room(s);if(!r||r.phase!=='lobby'||r.host!==s.id)return;
  if(add)addBot(r);else{const i=r.players.map(p=>p.bot).lastIndexOf(true);if(i>=0)r.players.splice(i,1)}lobby(r)});
 s.on('start',()=>{const r=room(s);if(r&&r.host===s.id)startMatch(r)});
 s.on('i',d=>{const p=me();if(!p||!d)return;p.dx=clamp(+d.x||0,-1,1);p.dy=clamp(+d.y||0,-1,1);p.run=d.r?1:0;p.lg=d.c===undefined;p.cr=!p.g&&!p.lg&&!!d.c;if(isFinite(d.a)){p.yaw=+d.a;p.hy=true}});
 s.on('n',()=>{const r=room(s),p=me();if(r&&p&&!p.stun&&!p.frz)throwNade(r,p)});
 s.on('again',()=>{const r=room(s);if(r&&(r.phase==='end'||r.phase==='lobby')){r.phase='lobby';lobby(r)}});
 s.on('leave',()=>leave(s));
 s.on('disconnect',()=>leave(s));
});

/* ---------- gameplay ---------- */
function throwNade(r,p){if(r.phase!=='play'||p.g||!p.nade)return;const M=MAPS[r.map];p.nade=false;let x=p.x,y=p.y;const ax=p.hy?Math.cos(p.yaw):p.fx,ay=p.hy?Math.sin(p.yaw):p.fy;
 for(let i=0;i<10;i++){const nx=x+ax*15,ny=y+ay*15;if(hit(M,{x:nx,y:ny},5))break;x=nx;y=ny}
 r.nades.push({x,y,t:.9});io.to(r.code).emit('nade',{a:Math.round(p.x),b:Math.round(p.y),x:Math.round(x),y:Math.round(y)})}
function whistle(r){const H=r.players.filter(p=>!p.g&&!p.esc),hh=H.filter(p=>p.hid),pool=hh.length?hh:H;
 for(const g of r.players){let a;if(g.g&&pool.length){const t=pool[rnd(pool.length)];
  a=Math.atan2(t.y-g.y,t.x-g.x)+(Math.random()-.5)*1.3; // +-37deg noise: never exact
  if(g.bot){g.hint={x:t.x+(Math.random()-.5)*280,y:t.y+(Math.random()-.5)*280,t:9};g.last={x:g.hint.x,y:g.hint.y,t:35}}}
 if(!g.bot)io.to(g.id).emit('w',{a})}}
function curSpeed(p,play){if(p.stun>0||p.frz>0||(p.g&&!play))return 0;
 if(p.g)return p.dashT>0?SPEED.dash:SPEED.ghost;return p.cr?SPEED.crouch:p.run&&p.st>3?SPEED.run:SPEED.walk}

/* ---------- bot AI (grid BFS navigation) ---------- */
const CELL=20,grids={};
function grid(M){let g=grids[M.id];if(g)return g;const cols=Math.ceil(M.W/CELL),rows=Math.ceil(M.H/CELL),b=new Uint8Array(cols*rows);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)b[j*cols+i]=hit(M,{x:i*CELL+CELL/2,y:j*CELL+CELL/2},R+5)?1:0;
 return grids[M.id]={cols,rows,b,prev:new Int32Array(cols*rows),q:new Int32Array(cols*rows),seen:new Uint32Array(cols*rows),stamp:0}}
function nav(M,sx,sy,tx,ty){const G=grid(M),{cols,rows,b,prev,q,seen}=G,cl=(v,m)=>Math.max(0,Math.min(m-1,v));
 const si=cl(sx/CELL|0,cols),sj=cl(sy/CELL|0,rows),ti=cl(tx/CELL|0,cols),tj=cl(ty/CELL|0,rows),s0=sj*cols+si,t0=tj*cols+ti;
 if(s0===t0)return{x:tx,y:ty};const st=++G.stamp;let h=0,t=0,best=s0,bd=1e9;q[t++]=s0;seen[s0]=st;prev[s0]=-1;
 while(h<t){const c=q[h++],ci=c%cols,cj=c/cols|0,d=Math.abs(ci-ti)+Math.abs(cj-tj);if(d<bd){bd=d;best=c}if(c===t0){best=c;break}
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=cols||nj>=rows)continue;
   const n=nj*cols+ni;if(seen[n]===st||b[n])continue;if(di&&dj&&(b[cj*cols+ni]||b[nj*cols+ci]))continue;seen[n]=st;prev[n]=c;q[t++]=n}}
 let c=best,path=[];while(c!==-1&&c!==s0){path.push(c);c=prev[c]}path.reverse();
 const w=path[Math.min(2,path.length-1)];if(w===undefined)return{x:tx,y:ty};
 return{x:(w%cols)*CELL+CELL/2,y:(w/cols|0)*CELL+CELL/2}}
function goto(M,b,tx,ty){const w=nav(M,b.x,b.y,tx,ty),d=Math.hypot(w.x-b.x,w.y-b.y)||1;b.dx=(w.x-b.x)/d;b.dy=(w.y-b.y)/d}
function pickSpot(M,b,away){const H=M.hide;let best=null,bs=-1e9;
 for(let k=0;k<5;k++){const h=H[rnd(H.length)],x=h[1]+h[3]*(.3+Math.random()*.4),y=h[2]+h[4]*(.3+Math.random()*.4);
  const sc=away?dist({x,y},away)-.4*dist({x,y},b):-dist({x,y},b)*Math.random();if(sc>bs){bs=sc;best={x,y}}}
 return best}
function botThink(r,b,dt){const M=MAPS[r.map],P=r.players,play=r.phase==='play';
 b.ai-=dt;if(b.ai>0)return;b.ai=.22;
 if(Math.hypot(b.x-b.lx,b.y-b.ly)<3&&(b.dx||b.dy)){if(++b.stuck>=3){b.spot=null;b.hint=null;b.stuck=0;const a=Math.random()*6.28;b.dx=Math.cos(a);b.dy=Math.sin(a);b.ai=.5;return}}else b.stuck=0;
 b.lx=b.x;b.ly=b.y;
 if(b.stun>0||b.frz>0){b.dx=b.dy=0;return}
 if(b.hint){b.hint.t-=.22;if(b.hint.t<=0)b.hint=null}
 if(b.last){b.last.t-=.22;if(b.last.t<=0)b.last=null}
 if(!b.g){ // ----- human bot
  b.cr=false;
  let near=null,nd=1e9;for(const g of P)if(g.g&&!g.stun&&!g.frz){const d=dist(g,b);if(d<nd){nd=d;near=g}}
  if(near&&nd<(b.hid?100:250)){
   if(b.nade&&nd<165&&play)throwNade(r,b);
   if(!b.spot||dist(b.spot,near)<220||Math.random()<.3)b.spot=pickSpot(M,b,near);b.run=1;goto(M,b,b.spot.x,b.spot.y);return}
  const c=cur(M,b);if(c){b.run=0;if(dist(b,{x:c[0],y:c[1]})<TASK_R-12){b.dx=b.dy=0;return}goto(M,b,c[0],c[1]);return}
  if(b.td){let ex=M.exits[0],ed=1e9;for(const e of M.exits){const d=dist(b,{x:e[0],y:e[1]});if(d<ed){ed=d;ex=e}}b.run=1;goto(M,b,ex[0],ex[1]);return}
  b.run=0;if(!b.spot)b.spot=pickSpot(M,b);
  if(inZone(M,b)&&dist(b,b.spot)<22){b.cr=true;b.dx=b.dy=0;return}
  if(dist(b,b.spot)<14){b.dx=b.dy=0;return}
  b.run=r.phase==='count'?1:0;goto(M,b,b.spot.x,b.spot.y)
 }else{ // ----- ghost bot
  b.run=0;if(!play){b.dx=b.dy=0;return}
  let tg=null,td=330;for(const h of P)if(!h.g&&!h.hid&&!h.esc){const d=dist(h,b);if(d<td&&!(h.cr&&d>CROUCH_VIS)){td=d;tg=h}}
  if(tg){b.run=td<170?1:0;goto(M,b,tg.x,tg.y);b.dx*=.9;b.dy*=.9;return}
  if(b.hint){if(dist(b,b.hint)<40)b.hint=null;else{goto(M,b,b.hint.x,b.hint.y);b.dx*=.9;b.dy*=.9;return}}
  if(!b.spot||dist(b,b.spot)<30){ // after a whistle: sweep the hiding spots around the hinted area, otherwise roam
   const near=b.last?M.hide.filter(h=>dist({x:h[1]+h[3]/2,y:h[2]+h[4]/2},b.last)<450):[],pool=near.length?near:M.hide,h=pool[rnd(pool.length)];b.spot={x:h[1]+h[3]/2,y:h[2]+h[4]/2}}
  goto(M,b,b.spot.x,b.spot.y);b.dx*=.9;b.dy*=.9}}

/* ---------- main loop ---------- */
function tick(r,dt){r.tk++;const M=MAPS[r.map],P=r.players;r.t-=dt;
 if(r.phase==='count'&&r.t<=0){r.phase='play';r.t=M.MATCH}
 const play=r.phase==='play';
 for(const p of P){
  if(p.esc){p.dx=p.dy=0;p.mv=0;continue} // escaped: out of the game
  if(p.bot)botThink(r,p,dt);
  if(p.g)p.cr=false;p.stun=Math.max(0,p.stun-dt);p.frz=Math.max(0,p.frz-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.dashT=Math.max(0,p.dashT-dt);p.inv=Math.max(0,p.inv-dt);
  const len=Math.hypot(p.dx,p.dy);let sp=0;
  if(len>.05){p.fx=p.dx/len;p.fy=p.dy/len;if(Math.abs(p.fx)>.2)p.fl=p.fx>0?1:-1;if(!p.hy)p.yaw=Math.atan2(p.fy,p.fx);
   if(!p.stun&&!p.frz&&!(p.g&&!play)){
    if(p.g){if(p.run&&play&&!p.dashT&&!p.dashCd){p.dashT=.3;p.dashCd=4}sp=p.dashT>0?SPEED.dash:SPEED.ghost}
    else if(p.cr)sp=SPEED.crouch;else if(p.run&&p.st>3){sp=SPEED.run;p.st-=38*dt}else sp=SPEED.walk}}
  if(!p.g&&sp<170)p.st=Math.min(100,p.st+16*dt);
  if(sp){const m=Math.min(1,len)*sp*dt;move(M,p,p.fx*m,p.fy*m)}
  p.mv=sp?1:0;p.hid=!p.g&&inHide(M,p)}
 if(play){
  // tasks: stand inside the spot for TASK_T seconds; then the exit unlocks
  for(const p of P){if(p.g||p.esc||p.td||!p.tks.length)continue;const t=cur(M,p);
   if(dist(p,{x:t[0],y:t[1]})<TASK_R){p.tp=Math.min(1,p.tp+dt/TASK_T);if(p.tp>=1){p.tp=0;p.tdone++;if(p.tdone>=p.tks.length)p.td=true;if(!p.bot)io.to(p.id).emit('task',{n:p.tdone,t:p.tks.length})}}}
  // escape: finished humans who reach an exit leave the game (safe)
  for(const p of P){if(p.g||p.esc||!p.td)continue;
   for(const e of M.exits)if(dist(p,{x:e[0],y:e[1]})<EXIT_R){p.esc=true;io.to(r.code).emit('escaped',{i:p.id,n:p.name});break}}
  const gs=P.filter(p=>p.g&&!p.stun&&!p.frz);
  for(const h of P)if(!h.g&&!h.esc&&h.inv<=0)for(const g of gs)if(dist(g,h)<TAG_R){
   h.hp--;g.tags++;r.last=h.name;h.hid=false;h.tp=0;
   const ang=Math.atan2(g.y-h.y,g.x-h.x);
   if(h.hp>0){ // survived this hit: knockback, short invulnerability, ghost recoils for a moment
    h.inv=INV_TIME;g.frz=Math.max(g.frz,.9);
    for(let k=0;k<KNOCK/5;k++)move(M,h,-Math.cos(ang)*5,-Math.sin(ang)*5);
    if(!h.bot)io.to(h.id).emit('hit',{hp:h.hp,a:+ang.toFixed(2),by:g.name});
    if(!g.bot)io.to(g.id).emit('hitg',{n:h.name,hp:h.hp});
    break}
   // third hit: you are a ghost now
   h.hp=0;h.g=true;h.frz=1.5;
   if(!h.bot)io.to(h.id).emit('hit',{hp:0,a:+ang.toFixed(2),by:g.name});
   io.to(r.code).emit('caught',{i:h.id,n:h.name,by:g.name});break}
  r.nades=r.nades.filter(n=>{n.t-=dt;if(n.t>0)return true;
   io.to(r.code).emit('boom',{x:Math.round(n.x),y:Math.round(n.y)});
   for(const p of P)if(p.g&&dist(p,n)<NADE_R)p.stun=3;return false});
  if(r.nw>0&&r.t<=r.nw){r.nw-=60;whistle(r)}}
 const al=P.filter(p=>!p.g&&!p.esc).length,es=P.filter(p=>p.esc).length;
 if(play&&(al===0||r.t<=0)){r.phase='end';
  const mv=P.reduce((a,p)=>p.tags>(a?a.tags:0)?p:a,null);
  io.to(r.code).emit('end',{w:es?'h':'g',s:P.filter(p=>!p.g).map(p=>p.name),mvp:mv?{n:mv.name,t:mv.tags}:null,last:r.last});return}
 const wl=play&&r.nw>0?Math.max(0,r.t-r.nw):0;
 for(const rc of P){if(rc.bot)continue; // server-side fog: ghosts never receive hidden humans
  const ps=P.filter(p=>p.id===rc.id||(!p.esc&&!(rc.g&&(p.hid||(p.cr&&dist(rc,p)>CROUCH_VIS))))).map(p=>{
   const o={i:p.id,x:Math.round(p.x),y:Math.round(p.y),g:p.g?1:0,s:p.stun>0?1:0,f:p.fl,m:p.mv,d:p.dashT>0?1:0,a:+p.yaw.toFixed(2),hd:p.hid?1:0,cr:p.cr?1:0};
   if(p.id===rc.id)Object.assign(o,{hp:p.hp,iv:p.inv>0?1:0,st:Math.round(p.st),cd:+p.dashCd.toFixed(1),nd:p.nade?1:0,h:p.hid?1:0,ms:curSpeed(p,play),fz:p.frz>0?1:0,lw:(!p.g&&!p.hid&&!p.cr&&!p.lg&&inLow(M,p))?1:0,es:p.esc?1:0,tx:cur(M,p)?cur(M,p)[0]:0,ty:cur(M,p)?cur(M,p)[1]:0,tn:p.tdone,tt:p.tks.length,tp:+p.tp.toFixed(2),td:p.td?1:0});return o});
  io.to(rc.id).emit('s',{ph:r.phase,t:Math.max(0,r.t),a:al,w:Math.round(wl),ps})}}
let last=Date.now();
setInterval(()=>{const now=Date.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 for(const r of Object.values(rooms))if(r.phase==='count'||r.phase==='play')tick(r,dt)},33);
if(require.main===module)srv.listen(process.env.PORT||3000,()=>console.log('GHOST TAG on :'+(process.env.PORT||3000)));
module.exports={rooms,tick,startMatch,addBot,newRoom,nav};
