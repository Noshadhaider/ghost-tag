// Shared by server + client: map data and collision/movement helpers.
// To add a map: build an object (see HOUSE / SCHOOL / wood()) and register it in MAPS. Everything is deterministic (no Math.random)
// so server and client generate identical maps.
(function(g){
const R=14,T=24; // player collision radius, wall thickness
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---- hiding rules ----
   TALL spots (wardrobe, locker, tomb, tent...) hide you while you stand inside.
   LOW spots (bush, grass, log, sheet, boxes, plant) only hide you while you are CROUCHING. */
const LOW={plant:1,bush:1,grass:1,log:1,sheet:1,boxes:1};
const inside=(h,p,m)=>p.x>h[1]+m&&p.x<h[1]+h[3]-m&&p.y>h[2]+m&&p.y<h[2]+h[4]-m;
function inHide(M,p){const c=p.cr||p.lg;return M.hide.some(h=>(c||!LOW[h[0]])&&inside(h,p,6))}
function inLow(M,p){return M.hide.some(h=>LOW[h[0]]&&inside(h,p,6))}
function inZone(M,p){return M.hide.some(h=>inside(h,p,6))}

/* ---- builders ---- */
// wall line with door gaps: horiz? y=fixed, x a..b : x=fixed, y a..b.  doors=[[center,width],...]
function wl(horiz,fixed,a,b,doors,th){th=th||T;const segs=[];let cur=a;
 (doors||[]).slice().sort((p,q)=>p[0]-q[0]).forEach(([c,w])=>{w=w||140;if(c-w/2>cur)segs.push([cur,c-w/2]);cur=c+w/2});
 if(cur<b)segs.push([cur,b]);
 return segs.map(([s,e])=>horiz?[s,fixed,e-s,th]:[fixed,s,th,e-s])}
const frame=(W,H)=>[[0,0,W,T],[0,H-T,W,T],[0,0,T,H],[W-T,0,T,H]];
// furniture template -> map.  k: 'S' solid / 'H' hide ; [k,type,dx,dy,w,h,facing]
function put(M,rx,ry,rw,rh,tpl,fx,fy){tpl.forEach(([k,t,dx,dy,w,h,f])=>{const x=rx+(fx?rw-dx-w:dx),y=ry+(fy?rh-dy-h:dy);
 if(k==='S')M.solid.push([t,x,y,w,h]);else M.hide.push([t,x,y,w,h,(f?1:0)^(fy?1:0)])})}

function hit(M,p,r){r=r||R;const S=M.sol;for(let i=0;i<S.length;i++){const s=S[i],dx=p.x-clamp(p.x,s[0],s[0]+s[2]),dy=p.y-clamp(p.y,s[1],s[1]+s[3]);if(dx*dx+dy*dy<r*r)return true}return false}
function freeNear(M,x,y,clear,nohide){for(let r=0;r<600;r+=20)for(let a=0;a<(r?12:1);a++){const q={x:x+Math.cos(a*.5236)*r,y:y+Math.sin(a*.5236)*r};
 if(q.x<60||q.y<60||q.x>M.W-60||q.y>M.H-60||hit(M,q,clear))continue;
 if(nohide&&M.hide.some(h=>q.x>h[1]-30&&q.x<h[1]+h[3]+30&&q.y>h[2]-30&&q.y<h[2]+h[4]+30))continue;return[Math.round(q.x),Math.round(q.y)]}return[Math.round(x),Math.round(y)]}
function fin(M,sp,to){M.sol=M.walls.concat(M.solid.map(s=>s.slice(1)));M.torches=to.map(([x,y])=>freeNear(M,x,y,26));M.spawns=sp.map(([x,y])=>freeNear(M,x,y,R+26,true));return M}

/* ---------------- HAUNTED HOUSE (indoor, 9 rooms, 2700x1800) ---------------- */
const BED=[['S','bed',60,40,150,120],['S','shelf',300,34,200,56],['S','table',560,230,150,80],['S','sofa',60,430,170,64],
 ['H','wardrobe',740,40,80,120],['H','curtain',40,220,90,100],['H','plant',760,440,64,64],['H','sheet',420,420,110,80],['H','clock',640,40,64,50]];
const LIB=[['S','shelf',60,34,200,56],['S','shelf',330,34,200,56],['S','shelf',600,34,200,56],['S','table',330,230,170,90],['S','sofa',60,430,160,64],
 ['H','wardrobe',770,160,80,120],['H','plant',40,260,64,64],['H','curtain',560,440,90,100],['H','sheet',200,270,110,80],['H','boxes',700,450,90,70],['H','clock',860-64-60,330,64,50]];
const KIT=[['S','counter',50,34,420,56],['S','counter',50,120,56,200],['S','table',360,230,170,90],['S','crate',650,380,120,90],
 ['H','barrel',700,60,64,64],['H','barrel',640,200,64,64],['H','wardrobe',760,240,80,120],['H','boxes',400,450,100,70],['H','plant',40,460,64,64],['H','locker',560,40,56,90]];
const LIV=[['S','sofa',80,60,190,64],['S','table',330,240,180,90],['S','piano',560,50,170,80],
 ['H','curtain',30,280,64,110],['H','wardrobe',760,380,80,120],['H','plant',60,440,64,64],['H','clock',470,450,64,50],['H','sheet',700,230,110,80],['H','boxes',300,440,90,70]];
const DIN=[['S','table',270,190,310,110],['S','shelf',60,34,190,56],['S','shelf',600,34,190,56],['S','sofa',60,440,170,64],
 ['H','curtain',40,200,64,110],['H','plant',760,440,64,64],['H','sheet',100,330,110,80],['H','barrel',760,60,64,64],['H','boxes',330,440,100,70],['H','clock',700,300,64,50],['H','wardrobe',420,40,80,110]];
const BATH=[['S','tub',50,50,190,90],['S','counter',360,40,150,70],['S','crate',640,250,100,90],
 ['H','curtain',640,50,90,100],['H','barrel',40,440,64,64],['H','locker',770,380,56,90],['H','plant',400,430,64,64],['H','boxes',560,440,90,70],['H','wardrobe',40,200,80,120]];
const STO=[['S','crate',60,60,120,90],['S','crate',220,60,100,90],['S','crate',500,50,120,90],['S','crate',700,300,110,90],['S','counter',60,250,56,180],
 ['H','barrel',330,200,64,64],['H','barrel',400,260,64,64],['H','barrel',740,60,64,64],['H','locker',780,420,56,90],['H','sheet',200,420,110,80],['H','boxes',460,440,90,70],['H','wardrobe',560,200,80,120]];
const HOUSE=(function(){const W=2700,H=1800,M={id:'house',name:'Haunted House',desc:'Indoor - 9 rooms',theme:'house',W,H,MATCH:300,HIDE:15,tint:0xff9a3c,walls:frame(W,H),rooms:[],solid:[],hide:[]};
 M.walls.push(...wl(false,900,T,H-T,[[330],[930],[1500]]),...wl(false,1800,T,H-T,[[420],[1040],[1560]]),...wl(true,600,T,W-T,[[470],[1350],[2260]]),...wl(true,1200,T,W-T,[[660],[1470],[2400]]));
 const cols=[[24,876],[924,876],[1824,852]],rows=[[24,576],[624,576],[1224,552]];
 const cfg=[[BED,'#5b3f33','p',0,0],[LIB,'#4a3a5c','p',0,0],[KIT,'#4d5a4a','t',0,0],[BATH,'#3f5560','t',0,0],[DIN,'#5a3b3b','p',0,0],[LIV,'#47424f','t',1,0],
  [STO,'#3f4a3a','t',1,1],[BED,'#4a3a3a','p',1,1],[LIB,'#3a4a5c','p',1,1]];
 const sp=[],to=[];cfg.forEach(([tp,col,k,fx,fy],i)=>{const [rx,rw]=cols[i%3],[ry,rh]=rows[i/3|0];M.rooms.push([rx,ry,rw,rh,col,k]);put(M,rx,ry,rw,rh,tp,fx,fy);
  const c=[rx+rw/2,ry+rh/2];(i===4?sp.unshift(c):sp.push(c));to.push(c)});
 return fin(M,sp,to)})();

/* ---------------- ABANDONED SCHOOL (indoor, long corridor + 10 classrooms, 2800x1700) ---------------- */
const CLS=[['S','counter',180,40,160,50],['S','shelf',360,34,140,56],
 ['S','table',60,200,90,56],['S','table',210,200,90,56],['S','table',360,200,90,56],['S','table',60,320,90,56],['S','table',210,320,90,56],['S','table',360,320,90,56],['S','table',60,440,90,56],['S','table',210,440,90,56],['S','table',360,440,90,56],
 ['H','curtain',30,110,64,110],['H','locker',440,130,56,90],['H','wardrobe',430,540,80,100],['H','sheet',40,540,110,80],['H','plant',40,40,64,64]];
const SCHOOL=(function(){const W=2800,H=1700,M={id:'school',name:'Abandoned School',desc:'Indoor - corridor & lockers',theme:'house',W,H,MATCH:300,HIDE:15,tint:0x8ad0ff,wp:['#4a5a60','#5e7078'],walls:frame(W,H),rooms:[],solid:[],hide:[]};
 const dc=[292,852,1412,1972,2520],xs=[24,584,1144,1704,2264],ws=[536,536,536,536,512];
 M.walls.push(...wl(true,700,T,W-T,dc.map(c=>[c])),...wl(true,1000,T,W-T,dc.map(c=>[c])));
 [560,1120,1680,2240].forEach((x,i)=>{M.walls.push(...wl(false,x,T,700,[[[360],[520],[300],[480]][i]]),...wl(false,x,1024,H-T,[[[1400],[1250],[1500],[1300]][i]]))});
 M.rooms.push([24,724,2752,276,'#3b4246','t']);
 const sp=[[1412,862]],to=[];
 xs.forEach((x,i)=>{const cols=['#4a5560','#4f5a4a','#5a5048','#44505e','#55504f'];
  M.rooms.push([x,24,ws[i],676,cols[i],'t'],[x,1024,ws[i],652,cols[(i+2)%5],'t']);
  put(M,x,24,ws[i],676,CLS,i%2,0);put(M,x,1024,ws[i],652,CLS,(i+1)%2,1);sp.push([x+ws[i]/2,360],[x+ws[i]/2,1350])});
 // corridor lockers: groups of up to 4 between the doors, hugging both walls
 const gaps=[[60,192],[392,752],[952,1312],[1512,1872],[2072,2420],[2620,2740]];
 gaps.forEach(([a,b])=>{const n=Math.min(4,Math.floor((b-a)/60)),x0=a+((b-a)-n*60)/2;for(let k=0;k<n;k++){M.hide.push(['locker',Math.round(x0+k*60),724,56,80,0]);M.hide.push(['locker',Math.round(x0+k*60),920,56,80,1])}});
 [572,1132,1692,2252].forEach(x=>to.push([x,862]));to.push([120,862],[2680,862]);
 return fin(M,sp,to)})();

/* ---------------- outdoor generator (Dark Woods / Graveyard) ---------------- */
function wood(o){const rnd=rng(o.seed),W=o.W,H=o.H,walls=frame(W,H).concat(o.walls||[]),solid=(o.solid||[]).slice(),hide=(o.hidePre||[]).slice(),sp=o.spawnHints,to=o.torchHints,hp=o.hpad||60;
 const R4=a=>[a[1],a[2],a[3],a[4]];
 const bad=(x,y,w,h,pad)=>solid.map(R4).concat(hide.map(R4),walls).some(([a,b,c,d])=>x<a+c+pad&&x+w>a-pad&&y<b+d+pad&&y+h>b-pad)||sp.some(([a,b])=>a>x-100&&a<x+w+100&&b>y-100&&b<y+h+100)||to.some(([a,b])=>a>x-40&&a<x+w+40&&b>y-40&&b<y+h+40);
 o.hides.forEach(([t,w,h,n])=>{for(let k=0,tr=0;k<n&&tr<900;tr++){const x=90+rnd()*(W-180-w),y=100+rnd()*(H-200-h);if(bad(x,y,w,h,hp))continue;hide.push([t,Math.round(x),Math.round(y),w,h]);k++}});
 const trees=[];for(let n=0,tr=0;n<o.trees&&tr<6000;tr++){const x=70+rnd()*(W-140),y=90+rnd()*(H-160);if(bad(x-16,y-14,32,28,56)||trees.some(t=>Math.hypot(t[0]-x,t[1]-y)<o.treeMin))continue;trees.push([Math.round(x),Math.round(y),.85+rnd()*.5,(rnd()*3)|0]);n++}
 trees.forEach(([x,y])=>solid.push(['tree',x-16,y-14,32,28]));
 return fin(Object.assign({theme:'forest',MATCH:300,HIDE:15,tint:0x7affc8,W,H,walls,solid,hide,trees},o.meta),sp,to)}

/* ---------------- DARK WOODS (outdoor, 2880x1980) ---------------- */
const FOREST=wood({seed:1337,W:2880,H:1980,trees:85,treeMin:140,
 walls:[[540,594,430,16],[540,594,16,216],[1908,1296,450,16],[2329,1152,16,165]],
 solid:[['pond',1818,684,400,260],['well',1386,936,80,80],['cart',648,1368,150,80],
  ['rock',288,324,96,70],['rock',2520,414,108,80],['rock',1008,1620,108,70],['rock',2250,1656,120,80],['rock',1260,270,96,66],
  ...[0,1,2].flatMap(j=>[0,1,2,3,4].map(i=>['grave',250+i*64,1390+j*86,34,44])),['cabin',2394,1404,280,190]],
 hides:[['bush',84,60,14],['grass',100,66,10],['log',120,44,8],['haystack',100,90,5],['tent',120,100,3],['tomb',90,110,5]],
 spawnHints:[[1440,1188],[1116,756],[1800,1152],[540,1044],[2484,1152],[900,360],[1620,594],[2484,288]],
 torchHints:[[756,774],[1440,1260],[2124,540],[360,1260],[2250,1116],[1152,1800],[1620,270],[2700,1620],[1000,500],[2000,1700],[600,300],[2600,900]],
 meta:{id:'forest',name:'Dark Woods',desc:'Outdoor - bushes, tents, haystacks',dirt:[[190,1330,380,310]],
  paths:[[[72,972],[756,1008],[1440,1152],[2160,1008],[2808,1080]],[[1440,72],[1422,576],[1440,1152],[1476,1620],[1440,1908]],[[1440,1152],[1980,1440],[2394,1548]]]}});

/* ---------------- GRAVEYARD (outdoor, 2600x1800, mausoleums + grave maze) ---------------- */
const GRAVEYARD=(function(){const pre=[['tomb',700,260,90,110],['tomb',1800,260,90,110],['tomb',700,1350,90,110],['tomb',1800,1350,90,110],['tomb',300,850,90,110],['tomb',2210,850,90,110]];
 const rnd=rng(31),solid=[['cabin',1160,120,280,190],['rock',420,1560,110,70],['rock',2060,540,100,70],['rock',560,420,100,66]];
 for(let gy=380;gy<=1560;gy+=150)for(let gx=260;gx<=2340;gx+=125){const x=gx+(rnd()*20-10|0),y=gy+(rnd()*20-10|0);
  if(Math.abs(gx-1300)<100||Math.abs(gy-900)<110||rnd()<.2||pre.some(p=>x>p[1]-50&&x<p[1]+p[3]+50&&y>p[2]-50&&y<p[2]+p[4]+50))continue;solid.push(['grave',x,y,34,44])}
 const fence=[...wl(true,130,130,2470,[[1300,300]],16),...wl(true,1670,130,2470,[[1300,200]],16),...wl(false,130,130,1670,[[900,200]],16),...wl(false,2470,130,1670,[[900,200]],16)];
 return wood({seed:909,W:2600,H:1800,trees:26,treeMin:210,hpad:24,walls:fence,solid,hidePre:pre,
  hides:[['bush',84,60,10],['grass',100,66,8],['log',120,44,4],['tomb',90,110,3]],
  spawnHints:[[1300,900],[500,500],[2100,500],[500,1300],[2100,1300],[1300,450],[1300,1450],[300,900],[2300,900]],
  torchHints:[[1300,500],[1300,1300],[700,900],[1900,900],[300,300],[2300,300],[300,1500],[2300,1500]],
  meta:{id:'graveyard',name:'Graveyard',desc:'Outdoor - grave maze & crypts',dirt:[[150,150,2300,1500]],ground:['#292636','#16141f'],bg:0x0a0812,fog:.05,
   paths:[[[40,900],[1300,900],[2560,900]],[[1300,330],[1300,900],[1300,1760]]]}})})();

/* ---- bigger maps: every map is scaled by SCALE (walls, rooms, furniture, spawns...), outdoor maps get more trees/bushes,
   then each map gets TASK_N task spots (one per human) and 2 exits ---- */
const SCALE=1.6,TASK_N=30; // task spots on each map (enough for 8 humans x 3 tasks)
function scaleMap(M,S){const k=v=>Math.round(v*S),rect=a=>a.map(k);
 M.W=k(M.W);M.H=k(M.H);
 M.walls=M.walls.map(rect);
 M.solid=M.solid.map(s=>[s[0],...rect(s.slice(1,5))]);
 M.hide=M.hide.map(h=>[h[0],...rect(h.slice(1,5)),...h.slice(5)]);
 if(M.rooms)M.rooms=M.rooms.map(r=>[...rect(r.slice(0,4)),...r.slice(4)]);
 if(M.trees)M.trees=M.trees.map(t=>[k(t[0]),k(t[1]),t[2],t[3]]);
 M.spawns=M.spawns.map(([x,y])=>[k(x),k(y)]);
 M.torches=M.torches.map(([x,y])=>[k(x),k(y)]);
 if(M.paths)M.paths=M.paths.map(p=>p.map(([x,y])=>[k(x),k(y)]));
 if(M.dirt)M.dirt=M.dirt.map(rect);
 M.sol=M.walls.concat(M.solid.map(s=>s.slice(1)));
 return M}
function densify(M,seed){ // outdoor: add trees and bushes so the bigger area is not empty
 const rnd=rng(seed),extra=SCALE*SCALE-1,nT=Math.round(M.trees.length*extra),nH=Math.round(M.hide.length*extra);
 const ok=(x,y,w,h)=>{if(x<90||y<90||x+w>M.W-90||y+h>M.H-90)return false;
  if(M.sol.some(([a,b,c,d])=>x<a+c+50&&x+w>a-50&&y<b+d+50&&y+h>b-50))return false;
  if(M.hide.some(q=>x<q[1]+q[3]+30&&x+w>q[1]-30&&y<q[2]+q[4]+30&&y+h>q[2]-30))return false;
  return !M.spawns.concat(M.torches).some(([a,b])=>Math.hypot(a-x,b-y)<120)};
 for(let n=0,tr=0;n<nT&&tr<8000;tr++){const x=70+rnd()*(M.W-140),y=90+rnd()*(M.H-160);if(!ok(x-16,y-14,32,28))continue;
  const t=[Math.round(x),Math.round(y),.85+rnd()*.5,(rnd()*3)|0];M.trees.push(t);const s=['tree',t[0]-16,t[1]-14,32,28];M.solid.push(s);M.sol.push(s.slice(1));n++}
 for(let n=0,tr=0;n<nH&&tr<8000;tr++){const tp=M.hide[(rnd()*M.hide.length)|0],x=90+rnd()*(M.W-180-tp[3]),y=100+rnd()*(M.H-200-tp[4]);
  if(!ok(x,y,tp[3],tp[4]))continue;M.hide.push([tp[0],Math.round(x),Math.round(y),tp[3],tp[4]]);n++}
 return M}
function placeExtras(M,seed){const rnd=rng(seed),cand=[];
 for(let y=120;y<M.H-120;y+=50)for(let x=120;x<M.W-120;x+=50){if(hit(M,{x,y},R+30))continue;
  if(M.hide.some(h=>x>h[1]-40&&x<h[1]+h[3]+40&&y>h[2]-40&&y<h[2]+h[4]+40))continue;cand.push([x,y])}
 for(let i=cand.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]]}
 const far=Math.min(M.W,M.H)/5,tasks=[];
 for(const c of cand){if(tasks.length>=TASK_N)break;if(tasks.every(t=>Math.hypot(t[0]-c[0],t[1]-c[1])>=far))tasks.push(c)}
 for(const c of cand){if(tasks.length>=TASK_N)break;if(!tasks.some(t=>t[0]===c[0]&&t[1]===c[1]))tasks.push(c)}
 M.tasks=tasks;
 M.exits=[freeNear(M,120,M.H/2,R+10),freeNear(M,M.W-120,M.H/2,R+10)];
 return M}
const big=(M,seed,outdoor)=>{scaleMap(M,SCALE);if(outdoor)densify(M,seed);return placeExtras(M,seed)};
const MAPS={house:big(HOUSE,11,false),forest:big(FOREST,12,true),graveyard:big(GRAVEYARD,13,true),school:big(SCHOOL,14,false)};

function move(M,p,dx,dy){p.x+=dx;if(hit(M,p))p.x-=dx;p.y+=dy;if(hit(M,p))p.y-=dy}
// schematic thumbnail (cheap: no big canvases) - used by the lobby map picker
function drawThumb(c,m,w,h){const k=Math.min(w/m.W,h/m.H),ox=(w-m.W*k)/2,oy=(h-m.H*k)/2,fo=m.theme==='forest',X=v=>ox+v*k,Y=v=>oy+v*k;
 c.fillStyle=fo?(m.ground?m.ground[1]:'#10231f'):'#1b1322';c.fillRect(0,0,w,h);
 const B=(x,y,ww,hh)=>c.fillRect(X(x),Y(y),Math.max(1.5,ww*k),Math.max(1.5,hh*k));
 (m.rooms||[]).forEach(r=>{c.fillStyle=r[4];B(r[0],r[1],r[2],r[3])});
 (m.paths||[]).forEach(p=>{c.strokeStyle='#5a432e';c.lineWidth=Math.max(2,34*k);c.lineJoin='round';c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y)));c.stroke()});
 c.fillStyle=fo?'#6b4f33':'#9a86b8';m.walls.forEach((s,i)=>{if(!fo||i>=4)B(s[0],s[1],s[2],s[3])});
 m.solid.forEach(s=>{c.fillStyle=s[0]==='tree'?'#2f7a4a':s[0]==='pond'?'#3d7f8e':'#8a8d96';if(s[0]==='tree'){c.beginPath();c.arc(X(s[1]+16),Y(s[2]+14),Math.max(2,14*k*1.6),0,7);c.fill()}else B(s[1],s[2],s[3],s[4])});
 c.fillStyle='#4dff9a';m.hide.forEach(s=>B(s[1],s[2],s[3],s[4]))}
const API={MAPS,R,hit,move,inHide,inLow,inZone,LOW,clamp,drawThumb,list:()=>Object.values(MAPS).map(m=>({id:m.id,name:m.name,d:m.desc||''}))};
if(typeof module!=='undefined')module.exports=API;else g.GTMAP=API;
})(this);
