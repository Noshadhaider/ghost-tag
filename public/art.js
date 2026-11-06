// All artwork is original and drawn in code (canvas) -> zero downloads, instant load, crisp on any phone.
(function(g){
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
const lg=(c,y,h,a,b)=>{const q=c.createLinearGradient(0,y,0,y+h);q.addColorStop(0,a);q.addColorStop(1,b);return q};
const rg=(c,x,y,r0,r1,a,b)=>{const q=c.createRadialGradient(x,y,r0,x,y,r1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
const rad=(sz,stops)=>{const c=mkc(sz,sz),x=c.getContext('2d'),q=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);stops.forEach(s=>q.addColorStop(...s));x.fillStyle=q;x.fillRect(0,0,sz,sz);return c};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ============ HOUSE ============ */
const FP={shelf:['#6b4423','#3d2410'],table:['#7a5230','#4a2f18'],sofa:['#8a2f4a','#5a1a2e'],bed:['#6d4a2c','#3f2a16'],piano:['#26222e','#0b0a10'],tub:['#eef5f8','#9fb7c4'],counter:['#8a8f98','#555a63'],crate:['#a0703d','#5f3d1c']};
function furn(c,[t,x,y,w,h],j){c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=14;c.shadowOffsetY=6;c.fillStyle=lg(c,y,h,...FP[t]);rr(c,x,y,w,h,8);c.fill();c.restore();
 c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;rr(c,x,y,w,h,8);c.stroke();c.fillStyle='rgba(255,255,255,.13)';rr(c,x+3,y+3,w-6,7,4);c.fill();
 if(t==='shelf')for(let i=0,xx=x+8;xx<x+w-12;i++,xx+=11){c.fillStyle=['#b3412e','#2e6fb3','#d8b13a','#3a9a5c','#8b4fc0'][(i+j)%5];c.fillRect(xx,y+14,8,h-24)}
 if(t==='bed'){c.fillStyle='#f4efe6';rr(c,x+8,y+10,38,h-20,9);c.fill();c.fillStyle='#5a3d9a';rr(c,x+52,y+6,w-58,h-12,10);c.fill();c.strokeStyle='#8a6ad6';c.stroke()}
 if(t==='piano'){c.fillStyle='#f3f3f3';c.fillRect(x+6,y+h-22,w-12,16);c.fillStyle='#111';for(let xx=x+14;xx<x+w-14;xx+=14)c.fillRect(xx,y+h-22,7,10)}
 if(t==='table'){c.fillStyle='#7b2a3d';rr(c,x+7,y+7,w-14,h-14,6);c.fill();c.fillStyle='#fff6c8';c.beginPath();c.arc(x+w/2,y+h/2,6,0,7);c.fill();c.fillStyle='#ffb347';c.beginPath();c.arc(x+w/2,y+h/2-9,4,0,7);c.fill()}
 if(t==='sofa'){c.fillStyle='rgba(0,0,0,.28)';rr(c,x+5,y+5,w-10,h*.34,6);c.fill();c.fillStyle='rgba(255,255,255,.12)';rr(c,x+8,y+h*.45,w/2-10,h*.45,8);c.fill();rr(c,x+w/2+2,y+h*.45,w/2-10,h*.45,8);c.fill()}
 if(t==='tub'){c.fillStyle='#7ec8e3';rr(c,x+10,y+10,w-20,h-20,18);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,x+20,y+16,w-60,8,4);c.fill()}
 if(t==='counter'){c.fillStyle='#2c3036';rr(c,x+w/2-26,y+10,52,Math.min(h-20,34),7);c.fill()}
 if(t==='crate'){c.strokeStyle='#3d2410';c.lineWidth=4;c.beginPath();c.moveTo(x+6,y+6);c.lineTo(x+w-6,y+h-6);c.moveTo(x+w-6,y+6);c.lineTo(x+6,y+h-6);c.stroke()}}

/* ---- hiding objects (drawn on the TOP layer: they cover whoever stands inside) ---- */
function hideObj(c,[t,x,y,w,h],j){const R=rng(x*7+y*13+j);c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=16;c.shadowOffsetY=5;
 if(t==='wardrobe'){c.fillStyle=lg(c,y,h,'#7a4b28','#3f2412');rr(c,x,y,w,h,6);c.fill();c.restore();c.save();c.strokeStyle='#1c0e06';c.lineWidth=3;rr(c,x,y,w,h,6);c.stroke();
  c.lineWidth=2;rr(c,x+7,y+14,w/2-9,h-28,4);c.stroke();rr(c,x+w/2+2,y+14,w/2-9,h-28,4);c.stroke();c.fillStyle='#e8c35a';c.beginPath();c.arc(x+w/2-6,y+h/2,3,0,7);c.arc(x+w/2+6,y+h/2,3,0,7);c.fill();c.fillStyle='#4e2f17';c.fillRect(x-3,y-5,w+6,9)}
 else if(t==='curtain'){c.restore();c.save();const n=Math.max(4,w/13|0);for(let i=0;i<n;i++){c.fillStyle=lg(c,y,h,i%2?'#b3233f':'#8a1530',i%2?'#6b0f24':'#4d0a19');c.fillRect(x+i*w/n,y+6,w/n+1,h-6)}c.fillStyle='#c9a24a';c.fillRect(x-5,y,w+10,7)}
 else if(t==='plant'){c.restore();c.save();c.fillStyle='#8a4b2a';rr(c,x+w*.28,y+h*.66,w*.44,h*.34,5);c.fill();for(let i=0;i<12;i++){const a=i*2.4+j,r=w*.3;c.fillStyle=['#2f8a45','#3fae5a','#237a3a'][i%3];c.beginPath();c.ellipse(x+w/2+Math.cos(a)*r*.8,y+h*.3+Math.sin(a)*r*.8,w*.22,h*.26,a,0,7);c.fill()}}
 else if(t==='barrel'){const q=c.createLinearGradient(x,0,x+w,0);q.addColorStop(0,'#5a3418');q.addColorStop(.5,'#9a6a38');q.addColorStop(1,'#4a2a12');c.fillStyle=q;rr(c,x,y,w,h,w/4);c.fill();c.restore();c.save();c.strokeStyle='#26262c';c.lineWidth=4;c.beginPath();c.moveTo(x,y+h*.28);c.lineTo(x+w,y+h*.28);c.moveTo(x,y+h*.72);c.lineTo(x+w,y+h*.72);c.stroke()}
 /* ---- woods ---- */
 else if(t==='bush'){c.restore();c.save();const Y=y-26,H=h+26;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+w/2,y+h-4,w*.55,10,0,0,7);c.fill();
  for(let i=0;i<22;i++){const px=x+8+R()*(w-16),py=Y+16+R()*(H-30),r=14+R()*12;c.fillStyle=rg(c,px-4,py-5,2,r,['#3f8a4f','#2f7a45','#4a9a58'][i%3],'#16422a');c.beginPath();c.arc(px,py,r,0,7);c.fill()}
  c.fillStyle='#ff6b9a';for(let i=0;i<5;i++){c.beginPath();c.arc(x+10+R()*(w-20),Y+14+R()*(H-24),2.4,0,7);c.fill()}}
 else if(t==='grass'){c.restore();c.save();const Y=y-30;for(let i=0;i<70;i++){const px=x+R()*w,by=y+h-R()*8,hh=40+R()*(h+8),lean=(R()-.5)*18;c.strokeStyle=['#2d7a3d','#3d9a50','#1f5f30','#5ab36a'][i%4];c.lineWidth=2.4;c.beginPath();c.moveTo(px,by);c.quadraticCurveTo(px+lean*.4,by-hh*.55,px+lean,by-hh);c.stroke()}}
 else if(t==='log'){c.restore();c.save();const Y=y-14,H=h+14;c.fillStyle=lg(c,Y,H,'#7a5230','#3d2410');rr(c,x,Y+6,w,H-6,H/2.4);c.fill();c.strokeStyle='#22120a';c.lineWidth=2.5;c.stroke();
  for(let i=0;i<5;i++){c.strokeStyle='rgba(0,0,0,.25)';c.beginPath();c.moveTo(x+14+i*(w-28)/4,Y+10);c.lineTo(x+16+i*(w-28)/4,Y+H-4);c.stroke()}
  c.fillStyle='#caa06a';c.beginPath();c.ellipse(x+w-9,Y+H/2+3,9,H/2-3,0,0,7);c.fill();c.strokeStyle='#8a5a2c';c.lineWidth=2;c.beginPath();c.ellipse(x+w-9,Y+H/2+3,5,H/2-9,0,0,7);c.stroke();
  c.fillStyle='#4aa05a';c.beginPath();c.ellipse(x+30,Y+8,18,6,0,0,7);c.fill()}
 else if(t==='locker'){const q=c.createLinearGradient(x,0,x+w,0);q.addColorStop(0,'#4f7488');q.addColorStop(.5,'#6f97ab');q.addColorStop(1,'#3f6275');c.fillStyle=q;rr(c,x,y,w,h,4);c.fill();c.restore();c.save();c.strokeStyle='#1c2c36';c.lineWidth=2.5;rr(c,x,y,w,h,4);c.stroke();c.beginPath();c.moveTo(x+w/2,y+3);c.lineTo(x+w/2,y+h-3);c.stroke();c.fillStyle='#1c2c36';for(let i=0;i<3;i++){c.fillRect(x+5,y+8+i*5,w/2-10,2);c.fillRect(x+w/2+5,y+8+i*5,w/2-10,2)}c.fillStyle='#e0e5ea';c.fillRect(x+w/2-6,y+h*.5,3,9);c.fillRect(x+w/2+3,y+h*.5,3,9)}
 else if(t==='clock'){c.fillStyle=lg(c,y,h,'#6a4020','#33200f');rr(c,x,y,w,h,6);c.fill();c.restore();c.save();c.strokeStyle='#1a0e06';c.lineWidth=3;rr(c,x,y,w,h,6);c.stroke();c.fillStyle='#f2e6c0';c.beginPath();c.arc(x+w/2,y+h*.38,Math.min(w,h)*.26,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(x+w/2,y+h*.38);c.lineTo(x+w/2,y+h*.2);c.moveTo(x+w/2,y+h*.38);c.lineTo(x+w/2+6,y+h*.42);c.stroke();c.fillStyle='#c9a24a';c.beginPath();c.arc(x+w/2,y+h*.78,5,0,7);c.fill()}
 else if(t==='sheet'){c.restore();c.save();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+w/2,y+h-4,w*.5,8,0,0,7);c.fill();c.fillStyle=rg(c,x+w*.4,y+h*.3,4,w*.7,'#f4f6fa','#aab0bd');c.beginPath();c.moveTo(x,y+h);c.quadraticCurveTo(x-4,y+h*.2,x+w*.3,y+h*.1);c.quadraticCurveTo(x+w*.5,y-10,x+w*.7,y+h*.1);c.quadraticCurveTo(x+w+4,y+h*.2,x+w,y+h);for(let i=0;i<5;i++)c.lineTo(x+w-(i+.5)*w/5,y+h-(i%2?0:9));c.closePath();c.fill();c.strokeStyle='rgba(60,70,90,.45)';c.lineWidth=2;c.stroke()}
 else if(t==='boxes'){c.restore();c.save();[[0,.25,.55,.7],[.45,.2,.5,.75],[.2,0,.5,.55]].forEach(([a,b,s,u],i)=>{c.fillStyle=lg(c,y,h,['#c79a5e','#b98a52','#d3a76a'][i],'#7a5628');rr(c,x+a*w,y+b*h,w*s,h*u,3);c.fill();c.strokeStyle='#4a3216';c.lineWidth=2;c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x+a*w+w*s*.4,y+b*h,w*s*.2,h*u)})}
 else if(t==='haystack'){c.restore();c.save();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+w/2,y+h-2,w*.55,10,0,0,7);c.fill();c.fillStyle=rg(c,x+w*.4,y+h*.3,4,w*.7,'#e8cf7a','#9a7a28');c.beginPath();c.moveTo(x,y+h);c.quadraticCurveTo(x+2,y-8,x+w/2,y-12);c.quadraticCurveTo(x+w-2,y-8,x+w,y+h);c.closePath();c.fill();c.strokeStyle='rgba(90,64,16,.6)';c.lineWidth=2;for(let i=0;i<14;i++){const px=x+8+R()*(w-16),py=y+4+R()*(h-8);c.beginPath();c.moveTo(px,py);c.lineTo(px+(R()-.5)*18,py+8+R()*8);c.stroke()}}
 else if(t==='tent'){c.restore();c.save();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+w/2,y+h-2,w*.58,10,0,0,7);c.fill();c.fillStyle=lg(c,y-20,h+20,'#b5593a','#6a2f1c');c.beginPath();c.moveTo(x-4,y+h);c.lineTo(x+w/2,y-24);c.lineTo(x+w+4,y+h);c.closePath();c.fill();c.strokeStyle='#2a120a';c.lineWidth=3;c.stroke();c.fillStyle='#120a06';c.beginPath();c.moveTo(x+w*.36,y+h);c.lineTo(x+w/2,y+h*.25);c.lineTo(x+w*.64,y+h);c.closePath();c.fill()}
 else if(t==='tomb'){c.fillStyle=lg(c,y,h,'#8d95a0','#4c525c');c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+30);c.quadraticCurveTo(x,y,x+w/2,y);c.quadraticCurveTo(x+w,y,x+w,y+30);c.lineTo(x+w,y+h);c.closePath();c.fill();c.restore();c.save();
  c.strokeStyle='#23262c';c.lineWidth=3;c.stroke();c.fillStyle='#14161b';c.beginPath();c.moveTo(x+w*.3,y+h);c.lineTo(x+w*.3,y+h*.5);c.quadraticCurveTo(x+w/2,y+h*.3,x+w*.7,y+h*.5);c.lineTo(x+w*.7,y+h);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(x+4,y+h*i/4);c.lineTo(x+w-4,y+h*i/4);c.stroke()}
  c.fillStyle='#c9d0d9';c.fillRect(x+w/2-2,y+6,4,18);c.fillRect(x+w/2-8,y+11,16,4);c.fillStyle='#3f8a4f';c.beginPath();c.ellipse(x+14,y+h-4,14,6,0,0,7);c.fill()}
 c.restore()}

function house(M,flat){const cv=mkc(M.W,M.H),c=cv.getContext('2d'),RUG=['rgba(130,30,55,.55)','rgba(40,60,130,.5)','rgba(40,110,80,.5)'];
 c.fillStyle='#1b1322';c.fillRect(0,0,M.W,M.H);
 M.rooms.forEach(([x,y,w,h,col,k],i)=>{c.fillStyle=col;c.fillRect(x,y,w,h);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;c.beginPath();
  if(k==='p'){for(let yy=y,r=0;yy<y+h;yy+=38,r++){c.moveTo(x,yy);c.lineTo(x+w,yy);for(let xx=x+(r%2)*70;xx<x+w;xx+=140){c.moveTo(xx,yy);c.lineTo(xx,yy+38)}}}
  else{for(let xx=x;xx<=x+w;xx+=50){c.moveTo(xx,y);c.lineTo(xx,y+h)}for(let yy=y;yy<=y+h;yy+=50){c.moveTo(x,yy);c.lineTo(x+w,yy)}}
  c.stroke();if(k==='t'){c.fillStyle='rgba(255,255,255,.05)';for(let a=0;a<w;a+=50)for(let b=0;b<h;b+=50)if((a+b)/50%2==0)c.fillRect(x+a,y+b,50,50)}
  const rw=w*.5,rh=h*.34;rr(c,x+(w-rw)/2,y+(h-rh)/2,rw,rh,18);c.fillStyle=RUG[i%3];c.fill();c.strokeStyle='rgba(255,215,120,.5)';c.lineWidth=4;c.stroke();
  const q=c.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*.25,x+w/2,y+h/2,Math.max(w,h)*.7);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=q;c.fillRect(x,y,w,h);
  // moonlight window shaft
  c.save();c.globalAlpha=.1;c.fillStyle='#bcd6ff';c.beginPath();c.moveTo(x+30,y+10);c.lineTo(x+90,y+10);c.lineTo(x+190,y+150);c.lineTo(x+110,y+150);c.closePath();c.fill();c.restore()});
 if(flat)return[cv];
 c.save();c.shadowColor='rgba(0,0,0,.75)';c.shadowBlur=22;c.fillStyle='#3a2a46';M.walls.forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));c.restore();
 M.walls.forEach(([x,y,w,h])=>{c.strokeStyle='#120818';c.lineWidth=3;c.strokeRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.1)';c.fillRect(x,y,w,3)});
 M.solid.forEach((s,j)=>furn(c,s,j));
 // cobwebs in room corners
 c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=1;M.rooms.forEach(([x,y],i)=>{const sx=i%2?-1:1,X=i%2?x+M.rooms[i][2]:x,Y=y+(i>2?M.rooms[i][3]:0),sy=i>2?-1:1;for(let k=1;k<=4;k++){c.beginPath();c.moveTo(X+sx*k*14,Y);c.quadraticCurveTo(X+sx*k*7,Y+sy*k*7,X,Y+sy*k*14);c.stroke()}c.beginPath();c.moveTo(X,Y);c.lineTo(X+sx*58,Y+sy*58);c.stroke()});
 M.torches.forEach(([x,y])=>{c.fillStyle='#2a1c14';c.beginPath();c.arc(x,y+4,8,0,7);c.fill();c.fillStyle='#ffb347';c.beginPath();c.moveTo(x,y-14);c.quadraticCurveTo(x+9,y-2,x,y+3);c.quadraticCurveTo(x-9,y-2,x,y-14);c.fill()});
 const tp=mkc(M.W,M.H),t=tp.getContext('2d');M.hide.forEach((h,j)=>hideObj(t,h,j));return[cv,tp]}

/* ============ DARK WOODS ============ */
function drawTreeTrunk(c,x,y,s){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x,y+14,26*s,10*s,0,0,7);c.fill();
 const q=c.createLinearGradient(x-14*s,0,x+14*s,0);q.addColorStop(0,'#2a1a10');q.addColorStop(.5,'#5a3a22');q.addColorStop(1,'#24150c');c.fillStyle=q;
 c.beginPath();c.moveTo(x-9*s,y-30*s);c.lineTo(x-15*s,y+14);c.quadraticCurveTo(x,y+20,x+15*s,y+14);c.lineTo(x+9*s,y-30*s);c.closePath();c.fill();
 c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.5;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x+i*5,y-26*s);c.lineTo(x+i*7,y+12);c.stroke()}}
function drawCanopy(c,x,y,s,v){const cols=[['#1f5a45','#0d2e28'],['#285f3c','#0f3320'],['#2a4f5e','#0f2a38'],['#3a5a2c','#162e12']][v%4],R=rng(x*3+y);
 const cx=x,cy=y-52*s;c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=18;c.shadowOffsetY=10;
 for(let i=0;i<9;i++){const a=i/9*6.283,px=cx+Math.cos(a)*34*s,py=cy+Math.sin(a)*26*s,r=(30+R()*10)*s;c.fillStyle=rg(c,px-8,py-10,3,r,cols[0],cols[1]);c.beginPath();c.arc(px,py,r,0,7);c.fill()}
 c.restore();c.fillStyle=rg(c,cx-10*s,cy-14*s,4,52*s,cols[0],cols[1]);c.beginPath();c.arc(cx,cy,44*s,0,7);c.fill();
 c.fillStyle='rgba(180,255,220,.10)';for(let i=0;i<6;i++){c.beginPath();c.arc(cx-20*s+R()*40*s,cy-20*s+R()*30*s,(6+R()*8)*s,0,7);c.fill()}}
function forest(M,flat){const cv=mkc(M.W,M.H),c=cv.getContext('2d'),R=rng(77);
 const KS=M.W*M.H/1.76e6,GR=M.ground||['#17302a','#10231f'];c.fillStyle=lg(c,0,M.H,GR[0],GR[1]);c.fillRect(0,0,M.W,M.H);
 for(let i=0;i<70*KS|0;i++){const x=R()*M.W,y=R()*M.H,r=40+R()*90;c.fillStyle=rg(c,x,y,0,r,'rgba(60,110,80,.22)','rgba(60,110,80,0)');c.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<5200*KS|0;i++){const x=R()*M.W,y=R()*M.H;c.strokeStyle=['#1f4a35','#2a5e40','#143a2a','#33704a'][i%4];c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+(R()-.5)*5,y-4-R()*7);c.stroke()}
 // dirt paths
 M.paths.forEach(p=>{[[46,'#2c2118'],[36,'#4a3626'],[24,'#58412d']].forEach(([w,col])=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();p.forEach(([x,y],i)=>i?c.quadraticCurveTo(p[i-1][0]+(x-p[i-1][0])*.5,p[i-1][1]+(R()-.5)*30,x,y):c.moveTo(x,y));c.stroke()})});
 for(let i=0;i<260*KS|0;i++){const p=M.paths[i%M.paths.length],k=R()*(p.length-1)|0,t=R(),x=p[k][0]+(p[k+1][0]-p[k][0])*t+(R()-.5)*30,y=p[k][1]+(p[k+1][1]-p[k][1])*t+(R()-.5)*26;c.fillStyle='rgba(30,20,12,.45)';c.beginPath();c.ellipse(x,y,2+R()*3,1.5+R()*2,0,0,7);c.fill()}
 // graveyard dirt
 (M.dirt||[]).forEach(([dx,dy,dw,dh])=>{c.fillStyle='rgba(40,30,24,.55)';rr(c,dx,dy,dw,dh,24);c.fill();c.strokeStyle='rgba(120,100,80,.5)';c.lineWidth=4;c.setLineDash([10,8]);c.stroke();c.setLineDash([])});
 M.solid.forEach((s,j)=>{if(flat&&s[0]!=='pond')return;const[t,x,y,w,h]=s;
  if(t==='pond'){c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=18;c.fillStyle='#2c3a2a';c.beginPath();c.ellipse(x+w/2,y+h/2,w/2+10,h/2+9,0,0,7);c.fill();c.restore();
   c.fillStyle=rg(c,x+w*.4,y+h*.4,6,w*.6,'#3d7f8e','#0f2f3f');c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,7);c.fill();
   c.strokeStyle='rgba(200,240,255,.35)';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.ellipse(x+w*.38,y+h*.4,18+i*22,8+i*9,0,.3,2.4);c.stroke()}
   for(let i=0;i<7;i++){const px=x+20+R()*(w-40),py=y+16+R()*(h-32);c.fillStyle='#3f9a55';c.beginPath();c.arc(px,py,8,.4,6.0);c.lineTo(px,py);c.fill()}
   c.fillStyle='#ff8fb8';c.beginPath();c.arc(x+w*.7,y+h*.6,4,0,7);c.fill()}
  else if(t==='well'){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x+w/2,y+h-2,w*.62,12,0,0,7);c.fill();c.fillStyle=lg(c,y,h,'#8d939c','#4a4f58');c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,7);c.fill();c.fillStyle='#05080c';c.beginPath();c.ellipse(x+w/2,y+h/2,w/2-14,h/2-14,0,0,7);c.fill();
   c.strokeStyle='#23262c';c.lineWidth=3;c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,7);c.stroke();for(let i=0;i<8;i++){const a=i*.785;c.beginPath();c.moveTo(x+w/2+Math.cos(a)*(w/2-14),y+h/2+Math.sin(a)*(h/2-14));c.lineTo(x+w/2+Math.cos(a)*w/2,y+h/2+Math.sin(a)*h/2);c.stroke()}}
  else if(t==='rock'){c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=14;c.shadowOffsetY=6;c.fillStyle=lg(c,y,h,'#8a929c','#454a54');c.beginPath();c.moveTo(x,y+h);c.lineTo(x+6,y+h*.4);c.lineTo(x+w*.3,y+4);c.lineTo(x+w*.7,y);c.lineTo(x+w-4,y+h*.45);c.lineTo(x+w,y+h);c.closePath();c.fill();c.restore();c.strokeStyle='#1f2228';c.lineWidth=2.5;c.stroke();
   c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(x+w*.3,y+6);c.lineTo(x+w*.62,y+3);c.lineTo(x+w*.5,y+h*.35);c.closePath();c.fill();c.fillStyle='#3f8a4f';c.beginPath();c.ellipse(x+w*.25,y+h-4,w*.2,6,0,0,7);c.fill()}
  else if(t==='grave'){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x+w/2,y+h,w*.7,7,0,0,7);c.fill();c.fillStyle=lg(c,y,h,'#aab1bb','#5b616b');c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.arc(x+w/2,y+w/2,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();c.fill();c.strokeStyle='#23262c';c.lineWidth=2;c.stroke();
   c.strokeStyle='rgba(30,34,40,.7)';c.lineWidth=2.5;c.beginPath();c.moveTo(x+w/2,y+9);c.lineTo(x+w/2,y+26);c.moveTo(x+w/2-6,y+15);c.lineTo(x+w/2+6,y+15);c.stroke()}
  else if(t==='cart'){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x+w/2,y+h,w*.55,9,0,0,7);c.fill();c.fillStyle=lg(c,y,h,'#7a5230','#3d2410');rr(c,x,y+4,w,h-14,8);c.fill();c.strokeStyle='#22120a';c.lineWidth=2.5;c.stroke();
   for(let i=1;i<5;i++){c.beginPath();c.moveTo(x+i*w/5,y+6);c.lineTo(x+i*w/5,y+h-12);c.stroke()}[x+22,x+w-22].forEach(wx=>{c.fillStyle='#2e1c0e';c.beginPath();c.arc(wx,y+h-8,14,0,7);c.fill();c.strokeStyle='#8a5a2c';c.lineWidth=2;c.stroke()})}
  else if(t==='cabin'){c.save();c.shadowColor='rgba(0,0,0,.65)';c.shadowBlur=20;c.shadowOffsetY=8;c.fillStyle=lg(c,y,h,'#6a4526','#33200f');rr(c,x,y,w,h,6);c.fill();c.restore();c.strokeStyle='#1c0e06';c.lineWidth=3;rr(c,x,y,w,h,6);c.stroke();
   for(let i=1;i<6;i++){c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=2;c.beginPath();c.moveTo(x,y+i*h/6);c.lineTo(x+w,y+i*h/6);c.stroke()}
   c.fillStyle='#14100c';rr(c,x+w/2-18,y+h-62,36,62,4);c.fill();c.fillStyle='#ffc857';c.globalAlpha=.55;rr(c,x+18,y+30,34,28,3);c.fill();rr(c,x+w-52,y+30,34,28,3);c.fill();c.globalAlpha=1;
   c.fillStyle='#2b1a0e';c.beginPath();c.moveTo(x-12,y+10);c.lineTo(x+w/2,y-34);c.lineTo(x+w+12,y+10);c.closePath();c.fill();c.strokeStyle='#120a05';c.lineWidth=3;c.stroke()}
  else if(t==='tree')drawTreeTrunk(c,x+16,y+14,1)});
 if(flat)return[cv];
 // wooden fences (walls inside the map)
 M.walls.slice(4).forEach(([x,y,w,h])=>{c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=8;c.shadowOffsetY=4;const hz=w>h;
  for(let i=0;i<(hz?w:h);i+=22){c.fillStyle=lg(c,y,40,'#7a5a38','#3d2a16');if(hz)rr(c,x+i,y-14,12,36,3);else rr(c,x-4,y+i,24,12,3);c.fill();c.strokeStyle='#1c1008';c.lineWidth=1.5;c.stroke()}
  c.fillStyle='#5a3f24';if(hz)c.fillRect(x,y+2,w,6);else c.fillRect(x+6,y,6,h);c.restore()});
 // lanterns
 M.torches.forEach(([x,y])=>{c.fillStyle='#2a1c14';c.fillRect(x-3,y-2,6,38);c.fillStyle='#1a1208';rr(c,x-9,y-22,18,22,4);c.fill();c.fillStyle='#bfffe0';c.shadowColor='#7affc8';c.shadowBlur=16;rr(c,x-6,y-19,12,16,3);c.fill();c.shadowBlur=0});
 // dark edge trees (decorative)
 for(let x=10;x<M.W;x+=54){drawTreeTrunk(c,x+R()*10,8+R()*14,1.1);drawTreeTrunk(c,x+R()*10,M.H-6-R()*10,1.1)}
 for(let y=60;y<M.H;y+=54){drawTreeTrunk(c,6+R()*8,y,1.1);drawTreeTrunk(c,M.W-8-R()*8,y,1.1)}
 const tp=mkc(M.W,M.H),t=tp.getContext('2d');
 t.globalAlpha=.78;M.trees.forEach(([x,y,s,v])=>drawCanopy(t,x,y,s,v));t.globalAlpha=1;
 for(let x=10;x<M.W;x+=54){drawCanopy(t,x+R()*10,24+R()*10,1.25,x/54|0);drawCanopy(t,x+R()*10,M.H+10-R()*10,1.25,x/54|0)}
 for(let y=60;y<M.H;y+=54){drawCanopy(t,12,y+10,1.25,y/54|0);drawCanopy(t,M.W-12,y+10,1.25,y/54|0)}
 M.hide.forEach((h,j)=>hideObj(t,h,j));return[cv,tp]}

/* ============ CHARACTERS ============ */
const NF=6; // animation frames
function mkHuman(sc,key,[a,b],hair,acc){const cv=mkc(48*NF,64),c=cv.getContext('2d');
 for(let f=0;f<NF;f++){const ph=f/NF*Math.PI*2,s=Math.sin(ph)*6,bo=f===0?0:-Math.abs(Math.sin(ph))*2.4;c.save();c.translate(f*48+24,0);c.lineWidth=2;c.strokeStyle='#2a1c3a';c.lineJoin='round';
  c.fillStyle='#3b2f5a';rr(c,-10+s*.4,44+bo+(s>0?-3:0),8,15,3);c.fill();c.stroke();rr(c,2-s*.4,44+bo+(s<0?-3:0),8,15,3);c.fill();c.stroke();
  c.fillStyle='#fff';c.fillRect(-10+s*.4,56+bo+(s>0?-3:0),8,3);c.fillRect(2-s*.4,56+bo+(s<0?-3:0),8,3);
  c.fillStyle=b;c.beginPath();c.arc(-15,35+bo+s*.3,4.5,0,7);c.arc(15,35+bo-s*.3,4.5,0,7);c.fill();c.stroke();
  c.fillStyle=lg(c,26,24,a,b);rr(c,-13,26+bo,26,24,9);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-12,40+bo,24,3);
  if(acc===1||acc===4){c.fillStyle='rgba(255,255,255,.25)';rr(c,-6,32+bo,12,9,3);c.fill()}
  if(acc===3||acc===7){c.fillStyle='#ffe14d';c.fillRect(-2,27+bo,4,22)}
  if(acc===6){c.fillStyle='#fff';c.fillRect(-13,30+bo,26,4);c.fillRect(-13,37+bo,26,4)}
  c.fillStyle='#ffd7b5';c.beginPath();c.arc(0,17+bo,14,0,7);c.fill();c.stroke();
  if(acc===7){c.fillStyle=hair;c.beginPath();c.arc(-16,22+bo,5,0,7);c.arc(16,22+bo,5,0,7);c.fill();c.stroke()}
  c.fillStyle=hair;c.beginPath();c.arc(0,15+bo,14.5,Math.PI*1.02,Math.PI*1.98);c.lineTo(11,11+bo);c.lineTo(5,15+bo);c.lineTo(0,10+bo);c.lineTo(-5,15+bo);c.lineTo(-11,11+bo);c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff';[-5,5].forEach(e=>{c.beginPath();c.ellipse(e,19+bo,3.6,4.6,0,0,7);c.fill()});c.fillStyle='#2a1c3a';[-5,5].forEach(e=>{c.beginPath();c.arc(e,20+bo,2.3,0,7);c.fill()});
  c.fillStyle='#fff';[-5,5].forEach(e=>{c.beginPath();c.arc(e+.8,18.4+bo,.9,0,7);c.fill()});
  c.fillStyle='rgba(255,110,140,.5)';[-9,9].forEach(e=>{c.beginPath();c.ellipse(e,24+bo,3,2,0,0,7);c.fill()});c.fillStyle='#7a2a3a';c.beginPath();c.arc(0,26+bo,1.8,0,7);c.fill();
  c.lineWidth=2;c.strokeStyle='#2a1c3a';
  if(acc===0){c.fillStyle=b;c.beginPath();c.arc(0,10+bo,15,Math.PI,0);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-15,8+bo,30,6,3);c.fill();c.stroke();c.beginPath();c.arc(0,-6+bo,4,0,7);c.fill();c.stroke()}
  if(acc===1){c.fillStyle=a;c.beginPath();c.arc(0,9+bo,14.5,Math.PI,0);c.fill();c.stroke();rr(c,-4,8+bo,22,5,2.5);c.fill();c.stroke()}
  if(acc===2){c.fillStyle='#ff5d9a';c.beginPath();c.moveTo(8,5+bo);c.lineTo(20,-1+bo);c.lineTo(20,11+bo);c.closePath();c.moveTo(8,5+bo);c.lineTo(-4,-1+bo);c.lineTo(-4,11+bo);c.closePath();c.fill();c.stroke()}
  if(acc===3){c.strokeStyle='#333';c.lineWidth=3.5;c.beginPath();c.arc(0,16+bo,16,Math.PI*1.05,Math.PI*1.95);c.stroke();c.fillStyle='#ff4d6d';c.lineWidth=2;c.strokeStyle='#2a1c3a';rr(c,-19,14+bo,7,11,3);c.fill();c.stroke();rr(c,12,14+bo,7,11,3);c.fill();c.stroke()}
  if(acc===4){c.fillStyle=a;c.beginPath();c.moveTo(-14,10+bo);c.lineTo(-10,-5+bo);c.lineTo(-2,6+bo);c.closePath();c.moveTo(14,10+bo);c.lineTo(10,-5+bo);c.lineTo(2,6+bo);c.closePath();c.fill();c.stroke()}
  if(acc===5){c.strokeStyle='#222';c.lineWidth=2;c.fillStyle='rgba(180,230,255,.35)';[-5,5].forEach(e=>{c.beginPath();c.arc(e,19+bo,6,0,7);c.fill();c.stroke()});c.beginPath();c.moveTo(-1,19+bo);c.lineTo(1,19+bo);c.stroke()}
  if(acc===6){c.fillStyle=a;rr(c,-15,7+bo,30,5,2.5);c.fill();c.stroke()}
  c.restore()}
 sc.textures.addCanvas(key,cv);const t=sc.textures.get(key);for(let i=0;i<NF;i++)t.add(i,0,i*48,0,48,64)}
function mkGhost(sc){const cv=mkc(64*NF,76),c=cv.getContext('2d');
 for(let f=0;f<NF;f++){c.save();c.translate(f*64+32,0);c.shadowColor='#8fe9ff';c.shadowBlur=14;const ph=f/NF*Math.PI*2;
  c.fillStyle=lg(c,6,56,'rgba(245,253,255,.95)','rgba(140,195,255,.45)');c.beginPath();c.moveTo(-20,46);c.bezierCurveTo(-27,8,-14,4,0,4);c.bezierCurveTo(14,4,27,8,20,46);
  for(let i=0;i<4;i++)c.quadraticCurveTo(15-i*10,60+Math.sin(ph+i*1.7)*5,10-i*10,50+Math.cos(ph+i*1.7)*3);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=2;c.stroke();c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.ellipse(-8,16,5,9,.4,0,7);c.fill();
  c.fillStyle='rgba(200,235,255,.78)';c.beginPath();c.ellipse(-24,34+Math.sin(ph)*3,6,10,.5,0,7);c.ellipse(24,34-Math.sin(ph)*3,6,10,-.5,0,7);c.fill();
  c.shadowColor='#b6ff5a';c.shadowBlur=12;c.fillStyle='#d6ff7a';[-8,8].forEach(e=>{c.beginPath();c.ellipse(e,26,4.2,6.5,0,0,7);c.fill()});c.shadowBlur=0;
  c.fillStyle='#10200a';[-8,8].forEach(e=>{c.beginPath();c.ellipse(e,27,1.8,3.4,0,0,7);c.fill()});
  c.strokeStyle='rgba(30,20,60,.6)';c.lineWidth=1.6;c.beginPath();c.moveTo(-9,19);c.lineTo(-3,22);c.moveTo(9,19);c.lineTo(3,22);c.stroke();
  c.fillStyle='rgba(30,20,60,.7)';c.beginPath();c.ellipse(0,40,4.2,5.8,0,0,7);c.fill();c.restore()}
 sc.textures.addCanvas('gh',cv);const t=sc.textures.get('gh');for(let i=0;i<NF;i++)t.add(i,0,i*64,0,64,76)}

/* ============ FX TEXTURES ============ */
function mkFx(sc){const T=sc.textures;
 T.addCanvas('light',rad(512,[[0,'rgba(255,255,255,1)'],[.5,'rgba(255,255,255,.85)'],[1,'rgba(255,255,255,0)']]));
 T.addCanvas('dot',rad(32,[[0,'#fff'],[1,'rgba(255,255,255,0)']]));
 T.addCanvas('vig',(()=>{const c=mkc(256,256),x=c.getContext('2d'),q=x.createRadialGradient(128,128,70,128,128,150);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.9)');x.fillStyle=q;x.fillRect(0,0,256,256);return c})());
 const r=mkc(128,128),x=r.getContext('2d');x.strokeStyle='#fff';x.lineWidth=7;x.shadowColor='#fff';x.shadowBlur=10;x.beginPath();x.arc(64,64,52,0,7);x.stroke();T.addCanvas('ring',r);
 const a=mkc(64,64),y=a.getContext('2d');y.shadowColor='#ffd24d';y.shadowBlur=12;y.fillStyle='#fff3b0';y.strokeStyle='#e8a317';y.lineWidth=3;y.beginPath();y.moveTo(8,24);y.lineTo(36,24);y.lineTo(36,10);y.lineTo(58,32);y.lineTo(36,54);y.lineTo(36,40);y.lineTo(8,40);y.closePath();y.fill();y.stroke();T.addCanvas('arrow',a);
 const n=mkc(24,24),z=n.getContext('2d');z.fillStyle=lg(z,3,18,'#4a4f5c','#14161c');z.beginPath();z.arc(12,14,8,0,7);z.fill();z.fillStyle='#ff4d4d';z.fillRect(9,2,6,5);z.fillStyle='rgba(255,255,255,.5)';z.beginPath();z.arc(9,11,2.5,0,7);z.fill();T.addCanvas('nade',n);
 const s=mkc(64,20),q=s.getContext('2d');q.fillStyle='#ffe14d';q.strokeStyle='#a87b00';[12,32,52].forEach(cx=>{q.beginPath();for(let i=0;i<10;i++){const rd=i%2?3.5:8,an=i*Math.PI/5-Math.PI/2;q.lineTo(cx+Math.cos(an)*rd,10+Math.sin(an)*rd)}q.closePath();q.fill();q.stroke()});T.addCanvas('stars',s);
 const l=mkc(16,16),w=l.getContext('2d');w.fillStyle='#fff';w.beginPath();w.ellipse(8,8,7,3.5,.6,0,7);w.fill();T.addCanvas('leaf',l)}

g.ART={mkc,rr,rad,maps:(M,flat)=>M.theme==='forest'?forest(M,flat):house(M,flat),mkHuman,mkGhost,mkFx,NF,ACC:8};
})(window);
