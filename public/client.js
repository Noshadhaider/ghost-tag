// GHOST TAG client: UI, networking, input, audio and the Phaser scene.
const $=s=>document.querySelector(s),GT=window.GTMAP,S=io();
let M=GT.MAPS.house,RO={},ST=null,sc=null,gm=null,host=null,ac=null,snapN=0,muted=localStorage.gtm==='1',master=null;
const COL=[['#ff5d73','#c2304a'],['#4fb3ff','#2a6fcf'],['#ffd24d','#d49a12'],['#6be585','#2c9a52'],['#c07bff','#7a3fd0'],['#ff9a4d','#d0601a'],['#4de2d0','#1c9a8c'],['#ff7bd0','#cc3f9a']];
const HAIR=['#3a2417','#222','#b5651d','#f2d06b','#6b3fa0','#c0392b','#1f3a5f','#eee'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),fmt=t=>{t=Math.ceil(t);return(t/60|0)+':'+String(t%60).padStart(2,'0')};
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('#hud').style.display=id==='hud'?'block':'none'}
function toast(t,ms=2400){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),ms)}
function fullscreen(){try{const d=document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen).call(d).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{})}catch(e){}}

/* ---------- audio (synth: no files to download) ---------- */
function ctx(){try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=muted?0:1;master.connect(ac.destination)}return ac}catch(e){return null}}
function tone(a,b,d,ty='sine',v=.2,dl=0){const c=ctx();if(!c||muted)return;const t=c.currentTime+dl,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,b),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d)}
const SFX={whistle:()=>{tone(1700,2600,.35,'sine',.25);tone(2400,1900,.5,'sine',.25,.35)},boom:()=>{tone(140,28,.6,'sawtooth',.4);tone(900,60,.3,'square',.15)},caught:()=>tone(320,70,.45,'square',.15),throw:()=>tone(300,700,.25,'triangle',.15),beat:()=>{tone(75,40,.16,'sine',.5);tone(70,38,.18,'sine',.4,.17)}};
let ambOn=false;function ambient(){if(ambOn)return;const c=ctx();if(!c)return;ambOn=true;
 [55,55.7,82.4].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type=i<2?'sawtooth':'sine';o.frequency.value=f;g.gain.value=.018;l.frequency.value=.08+i*.05;lg.gain.value=.01;l.connect(lg);lg.connect(g.gain);const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=260;o.connect(fl);fl.connect(g);g.connect(master);o.start();l.start()})}
function setMute(m){muted=m;localStorage.gtm=m?'1':'0';if(master)master.gain.value=m?0:1;$('#snd').innerHTML=m?'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2"/></svg>':'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="#fff" stroke-width="2" fill="none"/></svg>'}
setMute(muted);$('#snd').onclick=()=>{ctx();setMute(!muted);ambient()};
addEventListener('pointerdown',()=>{const c=ctx();c&&c.resume();ambient()},{once:true});

/* ---------- menu / lobby ---------- */
const nm=$('#nm');nm.value=localStorage.gtn||'';
const nameV=()=>{const v=nm.value.trim().slice(0,12)||'Player'+(10+Math.random()*89|0);localStorage.gtn=v;return v};
const go=(ev,x)=>{fullscreen();S.emit(ev,{name:nameV(),...x},r=>{if(r&&r.err)toast(r.err)})};
$('#bq').onclick=()=>go('quick');$('#bc').onclick=()=>go('create');$('#bp').onclick=()=>go('practice',{map:localStorage.gtmap||'house'});
$('#bj').onclick=()=>$('#jr').classList.toggle('on');$('#bh').onclick=()=>{const h=$('#how');h.style.display=h.style.display==='none'?'block':'none'};
$('#jg').onclick=()=>go('join',{code:$('#jc').value.trim().toUpperCase()});
$('#bs').onclick=()=>S.emit('start');$('#bb1').onclick=()=>S.emit('bot',true);$('#bb0').onclick=()=>S.emit('bot',false);
$('#bl').onclick=$('#bm').onclick=()=>{S.emit('leave');ST=null;show('menu')};
$('#ba').onclick=()=>S.emit('again');
$('#rc').onclick=()=>{try{navigator.clipboard.writeText($('#rc').textContent);toast('Code copied')}catch(e){}};
S.on('connect_error',()=>toast('Cannot reach server'));
let mapThumbs={};function thumb(id){if(mapThumbs[id])return mapThumbs[id];const c=ART.mkc(240,162);GT.drawThumb(c.getContext('2d'),GT.MAPS[id],240,162);return mapThumbs[id]=c.toDataURL('image/jpeg',.8)}
S.on('lobby',d=>{host=d.host;RO={};d.pl.forEach(p=>RO[p.i]=p);ST=null;if(sc&&sc.ready)sc.reset();show('lobby');
 $('#rc').textContent=d.code;const h=host===S.id;
 $('#pl').innerHTML=d.pl.map(p=>`<div class="pr"><i style="background:${COL[p.c][0]}"></i><b>${esc(p.n)}</b>${p.i===d.host?'<em>HOST</em>':''}${p.b?'<u>BOT</u>':''}${p.i===S.id?'<small>you</small>':''}</div>`).join('');
 const mp=$('#mp');mp.className=h?'':'ro';mp.innerHTML=d.maps.map(m=>`<div class="mc${m.id===d.map?' on':''}" data-m="${m.id}"><img style="width:100%;height:54px;border-radius:8px;object-fit:cover;display:block;margin-bottom:5px" src="${thumb(m.id)}">${esc(m.name)}</div>`).join('');
 mp.querySelectorAll('.mc').forEach(e=>e.onclick=()=>{localStorage.gtmap=e.dataset.m;S.emit('setmap',e.dataset.m)});
 $('#hb').style.display=h?'flex':'none';$('#bs').style.display=h?'':'none';$('#bs').disabled=d.pl.length<2;
 $('#wt').textContent=h?(d.pl.length<2?'Add a bot or wait for players (2-8)...':'Ready when you are!'):'Waiting for the host to start...'});
S.on('abort',()=>toast('Not enough players - back to lobby'));
S.on('go',d=>{RO={};d.pl.forEach(p=>RO[p.i]=p);ST=null;M=GT.MAPS[d.map]||GT.MAPS.house;show('hud');
 if(gm){if(sc&&sc.ready){sc.setMap(M);sc.reset()}}else gm=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#0a0610',scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},render:{antialias:true,powerPreference:'high-performance'},input:{mouse:false,touch:false,keyboard:false},scene:G});
 toast(d.g===S.id?'You are the GHOST! Hunt them all':'You are HUMAN - hide!',3200);
 if(innerHeight>innerWidth)setTimeout(()=>toast('Phone ko landscape mein ghumao - behtar view',3000),3400)});
S.on('s',d=>{d.n=++snapN;ST=d;const m=d.ps.find(p=>p.i===S.id);if(!m)return;const gh=!!m.g;
 $('#tm').textContent=d.ph==='play'?fmt(d.t):'--:--';$('#al').textContent=d.a;
 const wc=$('#wc');if(d.ph==='play'&&d.w>0){wc.style.display='inline';wc.textContent='WHISTLE '+fmt(d.w)}else wc.style.display='none';
 $('#rl').textContent=gh?'GHOST':'HUMAN';$('#rl').className=gh?'gh':'hm';$('#hd').style.display=m.h?'block':'none';
 $('#bN').style.display=gh?'none':'flex';$('#bN').classList.toggle('off',!m.nd);$('#bR b').textContent=gh?'DASH':'RUN';
 $('#sb i').style.width=(gh?100-m.cd*25:m.st)+'%';
 const cm=$('#cm');let t='';if(d.ph==='count')t=gh?`You are the GHOST - waking in ${Math.ceil(d.t)}`:`HIDE! Ghost wakes in ${Math.ceil(d.t)}`;if(m.s)t='STUNNED!';
 cm.textContent=t;cm.style.opacity=t?1:0;$('#fl').style.opacity=m.s?.92:0});
S.on('w',d=>{SFX.whistle();if(d.a!==undefined&&sc){sc.at=2;sc.aa=d.a;toast('WHISTLE! The arrow points toward a human...',2200)}else toast('A whistle echoes... the ghosts got a hint!',2200)});
S.on('caught',d=>{SFX.caught();navigator.vibrate&&navigator.vibrate(120);toast(d.i===S.id?'You were caught - you are a GHOST now!':esc(d.by||'Ghost')+' caught '+esc(d.n)+'!')});
S.on('boom',d=>{SFX.boom();sc&&sc.boom(d.x,d.y)});S.on('nade',d=>{SFX.throw();sc&&sc.nade(d)});
S.on('end',d=>{const m=ST&&ST.ps.find(p=>p.i===S.id),win=(d.w==='h')===!(m&&m.g);$('#vg').style.opacity=0;
 setTimeout(()=>{$('#et').textContent=win?'YOU WIN!':'YOU LOSE';$('#et').className=win?'w':'l';
  $('#es').textContent=d.w==='h'?'The humans survived the night!':'The ghosts caught everyone!';
  $('#ev').innerHTML=d.s.length?'Survivors: '+d.s.map(esc).join(', '):(d.last?'Last human caught: '+esc(d.last):'No survivors');
  $('#em').innerHTML=d.mvp&&d.mvp.t?'Top ghost: '+esc(d.mvp.n)+' ('+d.mvp.t+' caught)':'';show('end')},1200)});

/* ---------- controls ---------- */
const inp={x:0,y:0,r:0},keys={},lz=$('#lz'),jb=$('#jb'),jk=$('#jk');let jid=null,jo=null;
function jv(e){let dx=e.clientX-jo.x,dy=e.clientY-jo.y;const l=Math.hypot(dx,dy),R=58;if(l>R){dx*=R/l;dy*=R/l}
 jk.style.transform=`translate(${dx}px,${dy}px)`;const m=Math.hypot(dx,dy)/R;inp.x=m<.15?0:dx/R;inp.y=m<.15?0:dy/R}
lz.addEventListener('pointerdown',e=>{jid=e.pointerId;lz.setPointerCapture(jid);jo={x:e.clientX,y:e.clientY};jb.style.cssText=`left:${jo.x-58}px;top:${jo.y-58}px;bottom:auto`;jv(e)});
lz.addEventListener('pointermove',e=>{if(e.pointerId===jid)jv(e)});
const jr=e=>{if(e.pointerId!==jid)return;jid=null;inp.x=inp.y=0;jb.style.cssText='';jk.style.transform=''};
lz.addEventListener('pointerup',jr);lz.addEventListener('pointercancel',jr);
const bR=$('#bR');bR.onpointerdown=()=>inp.r=1;bR.onpointerup=bR.onpointerleave=bR.onpointercancel=()=>inp.r=0;
$('#bN').onpointerdown=()=>S.emit('n');
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=1;if(e.code==='KeyG'||e.code==='KeyE')S.emit('n')});
addEventListener('keyup',e=>keys[e.code]=0);
function readInput(){let x=inp.x,y=inp.y;const kx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),ky=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
 if(kx||ky){x=kx;y=ky}return{x,y,r:inp.r||keys.ShiftLeft||keys.Space?1:0}}
setInterval(()=>{if(ST)S.emit('i',readInput())},40);
// heartbeat + red vignette when a ghost is near (humans only)
let beatAt=0,heat=0;setInterval(()=>{const me=ST&&ST.ps.find(p=>p.i===S.id);let h=0;
 if(me&&!me.g&&ST.ph==='play'){let d=1e9;for(const p of ST.ps)if(p.g&&!p.s)d=Math.min(d,Math.hypot(p.x-me.x,p.y-me.y));h=Math.max(0,Math.min(1,1-(d-70)/330))}
 heat+=(h-heat)*.35;$('#vg').style.opacity=heat>.05?Math.min(1,heat*(.7+.3*Math.sin(performance.now()/(330-160*heat)))):0;
 if(h>.2&&performance.now()>beatAt){SFX.beat();beatAt=performance.now()+900-520*h;if(h>.6&&navigator.vibrate)navigator.vibrate(30)}},80);

/* ---------- Phaser scene ---------- */
class G extends Phaser.Scene{
 create(){ART.mkFx(this);for(let i=0;i<8;i++)ART.mkHuman(this,'h'+i,COL[i],HAIR[i],i);ART.mkGhost(this);
  this.tl=[];this.rt=this.add.renderTexture(0,0,64,64).setOrigin(0).setDepth(9000);this.li=this.make.image({key:'light',x:0,y:0},false);
  this.ar=this.add.image(0,0,'arrow').setDepth(9500).setVisible(false);
  this.pm=this.add.particles(0,0,'dot',{lifespan:800,speedY:{min:-30,max:-8},speedX:{min:-12,max:12},scale:{start:.8,end:0},alpha:{start:.5,end:0},tint:0x9fe8ff,blendMode:'ADD',emitting:false}).setDepth(8200);
  this.lf=this.add.particles(0,0,'leaf',{lifespan:700,speed:{min:40,max:110},angle:{min:0,max:360},rotate:{min:0,max:360},scale:{start:1,end:0},alpha:{start:1,end:0},tint:[0x3fae5a,0x2f8a45,0x6be585],emitting:false}).setDepth(8300);
  this.ents={};this.cx=M.W/2;this.cy=M.H/2;this.at=0;this.aa=0;this.first=true;this.pr=null;this.trail=0;this.buildMap(M);
  this.fit();this.scale.on('resize',()=>this.fit());this.ready=true;sc=this}
 buildMap(m){M=m;if(this.bg){this.bg.destroy();this.tp.destroy();this.textures.remove('map');this.textures.remove('top');if(this.amb)this.amb.destroy()}
  this.tl.forEach(g=>{this.tweens.killTweensOf(g);g.destroy()});this.tl=[];
  const[a,b]=ART.maps(m);this.textures.addCanvas('map',a);this.textures.addCanvas('top',b);
  this.bg=this.add.image(0,0,'map').setOrigin(0);this.tp=this.add.image(0,0,'top').setOrigin(0).setDepth(6000);
  m.torches.forEach(([x,y])=>{const g=this.add.image(x,y,'light').setBlendMode('ADD').setTint(m.tint).setAlpha(.28).setScale(.55).setDepth(9050);this.tweens.add({targets:g,alpha:.16,duration:260+Math.random()*300,yoyo:true,repeat:-1});this.tl.push(g)});
  const fo=m.theme==='forest';this.amb=this.add.particles(0,0,'dot',{lifespan:4500,speed:{min:3,max:14},angle:{min:0,max:360},scale:{start:fo?.32:.22,end:0},alpha:{start:fo?.8:.35,end:0},tint:fo?0xc8ff7a:0xffe9c0,blendMode:'ADD',emitting:false}).setDepth(9040)}
 setMap(m){if(m!==M)this.buildMap(m);this.fit()}
 fit(){const w=this.scale.width,h=this.scale.height;this.z=Phaser.Math.Clamp(Math.min(w/700,h/380),.6,1.4);this.cameras.main.setZoom(this.z);this.rt.resize(Math.ceil(w/this.z)+4,Math.ceil(h/this.z)+4)}
 reset(){for(const k in this.ents)this.kill(k);this.first=true;this.pr=null;this.at=0;this.ar.setVisible(false)}
 kill(k){const e=this.ents[k];['sp','sh','nm','gl','st'].forEach(n=>e[n].destroy());delete this.ents[k]}
 mk(p){const e={x:p.x,y:p.y,key:'',ph:Math.random()*6,tr:0};e.sh=this.add.image(0,0,'dot').setTint(0).setAlpha(.5).setScale(1.2,.45).setDepth(2);
  e.sp=this.add.sprite(p.x,p.y,'gh').setOrigin(.5,.92);e.nm=this.add.text(0,0,(RO[p.i]||{}).n||'',{font:'bold 13px Trebuchet MS,sans-serif',color:'#fff',stroke:'#000',strokeThickness:4}).setOrigin(.5,1).setDepth(8000);
  e.gl=this.add.image(0,0,'light').setBlendMode('ADD').setTint(0x66e0ff).setScale(.36).setDepth(9050).setVisible(false);e.st=this.add.image(0,0,'stars').setDepth(8100).setVisible(false);return this.ents[p.i]=e}
 burst(x,y){this.pm.emitParticleAt(x,y-20,22)}
 boom(x,y){const r=this.add.image(x,y,'ring').setBlendMode('ADD').setDepth(9060).setScale(.2);this.tweens.add({targets:r,scale:2.4,alpha:0,duration:520,onComplete:()=>r.destroy()});
  const f=this.add.image(x,y,'light').setBlendMode('ADD').setDepth(9060).setScale(.7);this.tweens.add({targets:f,alpha:0,scale:1.3,duration:650,onComplete:()=>f.destroy()});this.cameras.main.shake(260,.012);this.pm.emitParticleAt(x,y,26)}
 nade(d){const s=this.add.image(d.a,d.b-20,'nade').setDepth(9060);this.tweens.add({targets:s,x:d.x,y:d.y,angle:540,duration:900,onComplete:()=>s.destroy()});this.tweens.add({targets:s,scale:1.9,duration:450,yoyo:true})}
 predict(p,dt){const q=this.pr;if(ST.n!==this.lastN){this.lastN=ST.n;const ex=p.x-q.x,ey=p.y-q.y,d=Math.hypot(ex,ey);if(d>100){q.x=p.x;q.y=p.y}else if(d>5){q.x+=ex*.12;q.y+=ey*.12}}
  const v=readInput(),len=Math.hypot(v.x,v.y);if(len>.05&&p.ms>0){let sp=p.ms;if(!p.g&&sp<170&&v.r&&p.st>3)sp=175;const m=Math.min(1,len)*sp*dt;GT.move(M,q,v.x/len*m,v.y/len*m)}}
 update(t,dl){if(!ST||!this.ready)return;const dt=Math.min(.1,dl/1000),k=1-Math.pow(.0004,dt),seen={};let me=null;
  for(const p of ST.ps){seen[p.i]=1;const e=this.ents[p.i]||this.mk(p),gh=!!p.g,key=gh?'gh':'h'+((RO[p.i]||{}).c||0),mine=p.i===S.id;
   if(mine){if(this.first||!this.pr)this.pr={x:p.x,y:p.y};else this.predict(p,dt);e.x=this.pr.x;e.y=this.pr.y}
   else if(this.first||Math.hypot(p.x-e.x,p.y-e.y)>140){e.x=p.x;e.y=p.y}else{e.x+=(p.x-e.x)*k;e.y+=(p.y-e.y)*k}
   if(e.key!==key){if(e.key&&gh)this.burst(e.x,e.y);e.key=key;e.sp.setTexture(key)}
   const fr=p.m?(t/85+e.ph|0)%ART.NF:0;e.sp.setFrame(gh&&!p.m?(t/150+e.ph|0)%ART.NF:fr);e.sp.flipX=p.f<0;
   const bob=gh?-12+Math.sin(t/260+e.ph)*5:0;e.sp.setPosition(e.x,e.y+bob).setDepth(e.y);e.sp.setTint(p.s?0x777799:0xffffff);
   e.sp.setAlpha(mine&&p.h?.5:gh?.88:1);e.sh.setPosition(e.x,e.y+2);e.sh.setScale(gh?.9:1.2,.4);
   e.nm.setPosition(e.x,e.y+bob-(gh?66:70)).setText(((RO[p.i]||{}).n||'')+(mine?' (you)':'')).setColor(mine?'#ffe14d':gh?'#8fe9ff':'#ffffff');
   e.gl.setVisible(gh).setPosition(e.x,e.y-26+bob);e.st.setVisible(!!p.s).setPosition(e.x,e.y-(gh?72:60)+bob).setScale(Math.cos(t/140),1);
   if(gh&&p.m&&Math.random()<.35)this.pm.emitParticleAt(e.x+(Math.random()-.5)*20,e.y-20+bob,1);
   if(gh&&p.d&&t>e.tr){e.tr=t+45;const gi=this.add.image(e.x,e.y+bob,'gh').setOrigin(.5,.92).setDepth(e.y-1).setTint(0x8fe9ff).setAlpha(.5).setFlipX(p.f<0);this.tweens.add({targets:gi,alpha:0,duration:320,onComplete:()=>gi.destroy()})}
   if(mine){me=p;if(p.h&&!e.wasH)this.lf.emitParticleAt(e.x,e.y-14,9);e.wasH=p.h}}
  for(const id in this.ents)if(!seen[id])this.kill(id);
  const w=this.scale.width,h=this.scale.height,z=this.z,hw=w/2/z,hh=h/2/z;
  if(me){const e=this.ents[me.i];if(this.first){this.cx=e.x;this.cy=e.y;this.first=false}else{const c=1-Math.pow(.002,dt);this.cx+=(e.x-this.cx)*c;this.cy+=(e.y-this.cy)*c}}
  const cxx=hw*2>=M.W?M.W/2:Phaser.Math.Clamp(this.cx,hw,M.W-hw),cyy=hh*2>=M.H?M.H/2:Phaser.Math.Clamp(this.cy,hh,M.H-hh);
  this.cameras.main.centerOn(cxx,cyy);const ox=Math.floor(cxx-hw),oy=Math.floor(cyy-hh);
  if(Math.random()<.5)this.amb.emitParticleAt(ox+Math.random()*hw*2,oy+Math.random()*hh*2,1);
  this.rt.setPosition(ox,oy).clear();this.rt.fill(0x080410,.94);
  M.torches.forEach(([x,y])=>{this.li.setScale(.5).setAlpha(.8);this.rt.erase(this.li,x-ox,y-oy)});
  if(me){const e=this.ents[me.i],blind=me.s||(me.g&&ST.ph==='count'),R=blind?45:(me.g?300:215)*(1+.02*Math.sin(t/180));this.li.setScale(R*2/512).setAlpha(1);this.rt.erase(this.li,e.x-ox,e.y-20-oy)}
  if(this.at>0&&me){this.at-=dt;const e=this.ents[me.i],d=64+Math.sin(t/90)*6;this.ar.setVisible(this.at>0).setPosition(e.x+Math.cos(this.aa)*d,e.y-20+Math.sin(this.aa)*d).setRotation(this.aa).setAlpha(.6+.4*Math.sin(t/80))}else this.ar.setVisible(false)}}
