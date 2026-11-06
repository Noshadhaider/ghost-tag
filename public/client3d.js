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
function noise(d,v){const c=ctx();if(!c||muted)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.5);const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=v;s.connect(g);g.connect(master);s.start()}
const SFX={hit:()=>{noise(.55,.8);tone(55,20,1,'sawtooth',.75);tone(1700,140,.8,'sawtooth',.42);tone(2900,380,.5,'square',.2,.02);tone(950,80,.6,'square',.28,.1);tone(120,40,.7,'square',.3,.25)},whistle:()=>{tone(1700,2600,.35,'sine',.25);tone(2400,1900,.5,'sine',.25,.35)},boom:()=>{tone(140,28,.6,'sawtooth',.4);tone(900,60,.3,'square',.15)},caught:()=>tone(320,70,.45,'square',.15),throw:()=>tone(300,700,.25,'triangle',.15),beat:()=>{tone(75,40,.16,'sine',.5);tone(70,38,.18,'sine',.4,.17)},scare:()=>{tone(1300,180,.55,'sawtooth',.32);tone(1370,160,.55,'square',.16);tone(95,35,.9,'sawtooth',.4);tone(2400,600,.3,'square',.1,.05)}};
/* ---- proximity horror: dissonant drone + breath + shriek that grow as a ghost closes in; panned toward the ghost ---- */
let hz=null;
function horrorInit(){const c=ctx();if(!c||hz)return;const out=c.createGain();out.gain.value=0;const pan=c.createStereoPanner?c.createStereoPanner():null;
 if(pan){out.connect(pan);pan.connect(master)}else out.connect(master);
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=300;lp.connect(out);
 [[46,'sawtooth',.3],[49.3,'sawtooth',.3],[92.5,'square',.12],[138.4,'sawtooth',.08]].forEach(([f,t,v])=>{const o=c.createOscillator();o.type=t;o.frequency.value=f;const g=c.createGain();g.gain.value=v;o.connect(g);g.connect(lp);o.start()});
 // breath / whisper: looping noise through a moving band-pass
 const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const ns=c.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=5;const ng=c.createGain();ng.gain.value=0;
 const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=.35;lg.gain.value=700;lf.connect(lg);lg.connect(bp.frequency);lf.start();ns.connect(bp);bp.connect(ng);ng.connect(out);ns.start();
 // shriek: wobbling high saw, silent until the ghost is very close
 const so=c.createOscillator();so.type='sawtooth';so.frequency.value=900;const sg=c.createGain();sg.gain.value=0;const sb=c.createBiquadFilter();sb.type='bandpass';sb.frequency.value=1800;sb.Q.value=3;
 const vb=c.createOscillator(),vg=c.createGain();vb.frequency.value=6.5;vg.gain.value=90;vb.connect(vg);vg.connect(so.frequency);vb.start();so.connect(sb);sb.connect(sg);sg.connect(out);so.start();
 hz={out,pan,lp,ng,sg,so,bp,last:0}}
function horror(h,ng,me){if(!ac||muted)return;if(!hz)horrorInit();if(!hz)return;const t=ac.currentTime,k=h*h;
 hz.out.gain.setTargetAtTime(k*.95,t,.15);hz.lp.frequency.setTargetAtTime(220+h*1100,t,.2);hz.ng.gain.setTargetAtTime(h*.55,t,.2);
 hz.sg.gain.setTargetAtTime(Math.pow(Math.max(0,h-.55)/.45,2)*.22,t,.1);hz.so.frequency.setTargetAtTime(700+h*900,t,.2);
 if(hz.pan&&ng&&me){const dx=ng.x-me.x,dy=ng.y-me.y,l=Math.hypot(dx,dy)||1,c=Math.cos(look.yaw),s=Math.sin(look.yaw);hz.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,(dx*-s+dy*c)/l*.9)),t,.1)}
 if(h>.72&&performance.now()>hz.last){hz.last=performance.now()+11000;SFX.scare();navigator.vibrate&&navigator.vibrate([60,40,120])}}
let ambOn=false;function ambient(){if(ambOn)return;const c=ctx();if(!c)return;ambOn=true;
 [55,55.7,82.4].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type=i<2?'sawtooth':'sine';o.frequency.value=f;g.gain.value=.018;l.frequency.value=.08+i*.05;lg.gain.value=.01;l.connect(lg);lg.connect(g.gain);const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=260;o.connect(fl);fl.connect(g);g.connect(master);o.start();l.start()})}
function setMute(m){muted=m;localStorage.gtm=m?'1':'0';if(master)master.gain.value=m?0:1;$('#snd').innerHTML=m?'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2"/></svg>':'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="#fff" stroke-width="2" fill="none"/></svg>'}
setMute(muted);$('#snd').onclick=()=>{ctx();setMute(!muted);ambient()};
addEventListener('pointerdown',()=>{const c=ctx();c&&c.resume();ambient()},{once:true});

/* ---------- menu / lobby ---------- */
const nm=$('#nm');nm.value=localStorage.gtn||'';
const nameV=()=>{const v=nm.value.trim().slice(0,12)||'Player'+(10+Math.random()*89|0);localStorage.gtn=v;return v};
const go=(ev,x)=>{fullscreen();S.emit(ev,{name:nameV(),...x},r=>{if(r&&r.err)toast(r.err)})};
$('#bq').onclick=()=>go('quick');$('#bc').onclick=()=>go('create',{map:pm.value});$('#bp').onclick=()=>go('practice',{map:pm.value});
$('#bj').onclick=()=>$('#jr').classList.toggle('on');$('#bh').onclick=()=>{const h=$('#how');h.style.display=h.style.display==='none'?'block':'none'};
$('#jg').onclick=()=>go('join',{code:$('#jc').value.trim().toUpperCase()});
$('#bs').onclick=()=>S.emit('start');$('#bb1').onclick=()=>S.emit('bot',true);$('#bb0').onclick=()=>S.emit('bot',false);
$('#bl').onclick=$('#bm').onclick=()=>{S.emit('leave');ST=null;show('menu')};
$('#ba').onclick=()=>S.emit('again');
$('#rc').onclick=()=>{try{navigator.clipboard.writeText($('#rc').textContent);toast('Code copied')}catch(e){}};
S.on('connect_error',()=>toast('Cannot reach server'));
let mapThumbs={};function thumb(id){if(mapThumbs[id])return mapThumbs[id];const c=ART.mkc(240,162);GT.drawThumb(c.getContext('2d'),GT.MAPS[id],240,162);return mapThumbs[id]=c.toDataURL('image/jpeg',.8)}
const pm=$('#pm');pm.innerHTML=GT.list().map(m=>`<option value="${m.id}">Map: ${esc(m.name)}</option>`).join('');pm.value=GT.MAPS[localStorage.gtmap]?localStorage.gtmap:'house';pm.onchange=()=>localStorage.gtmap=pm.value;
S.on('lobby',d=>{host=d.host;RO={};d.pl.forEach(p=>RO[p.i]=p);ST=null;if(sc&&sc.ready)sc.reset();show('lobby');
 $('#rc').textContent=d.code;const h=host===S.id;
 $('#pl').innerHTML=d.pl.map(p=>`<div class="pr"><i style="background:${COL[p.c][0]}"></i><b>${esc(p.n)}</b>${p.i===d.host?'<em>HOST</em>':''}${p.b?'<u>BOT</u>':''}${p.i===S.id?'<small>you</small>':''}</div>`).join('');
 const mp=$('#mp');mp.className=h?'':'ro';mp.innerHTML=d.maps.map(m=>`<div class="mc${m.id===d.map?' on':''}" data-m="${m.id}"><img style="width:100%;height:54px;border-radius:8px;object-fit:cover;display:block;margin-bottom:5px" src="${thumb(m.id)}">${esc(m.name)}<small>${esc(m.d||'')}</small></div>`).join('');
 mp.querySelectorAll('.mc').forEach(e=>e.onclick=()=>{localStorage.gtmap=e.dataset.m;S.emit('setmap',e.dataset.m)});
 $('#hb').style.display=h?'flex':'none';$('#bs').style.display=h?'':'none';$('#bs').disabled=d.pl.length<2;
 $('#wt').textContent=h?(d.pl.length<2?'Add a bot or wait for players (2-8)...':'Ready when you are!'):'Waiting for the host to start...'});
S.on('abort',()=>toast('Not enough players - back to lobby'));
S.on('go',d=>{lastHp=-1;document.body.classList.remove('shk','shk2');$('#js').className='';setCrouch(0);RO={};d.pl.forEach(p=>RO[p.i]=p);ST=null;M=GT.MAPS[d.map]||GT.MAPS.house;show('hud');
 try{if(!sc)sc=new View3D(M);else{sc.setMap(M);sc.reset()}}catch(err){showErr(err)}
 toast(d.g===S.id?'You are the GHOST! Hunt them all':'You are HUMAN - hide!',3200);
 if(innerHeight>innerWidth)setTimeout(()=>toast('Phone ko landscape mein ghumao - behtar view',3000),3400)});
S.on('s',d=>{d.n=++snapN;ST=d;const m=d.ps.find(p=>p.i===S.id);if(!m)return;const gh=!!m.g;
 $('#tm').textContent=d.ph==='play'?fmt(d.t):'--:--';$('#al').textContent=d.a;
 const wc=$('#wc');if(d.ph==='play'&&d.w>0){wc.style.display='inline';wc.textContent='WHISTLE '+fmt(d.w)}else wc.style.display='none';
 $('#rl').textContent=gh?'GHOST':'HUMAN';const hpe=$('#hp');hpe.style.display=gh?'none':'flex';if(!gh)setHearts(m.hp===undefined?3:m.hp);$('#lw').classList.toggle('on',!gh&&d.ph==='play'&&m.hp===1);$('#rl').className=gh?'gh':'hm';$('#hd').style.display=m.h?'block':'none';
 $('#bN').style.display=gh?'none':'flex';$('#bC').classList.toggle('off',gh);if(gh&&inp.c)setCrouch(0);$('#bN').classList.toggle('off',!m.nd);$('#bR b').textContent=gh?'DASH':'RUN';
 $('#sb i').style.width=(gh?100-m.cd*25:m.st)+'%';
 const cm=$('#cm');let t='';if(d.ph==='count')t=gh?`You are the GHOST - waking in ${Math.ceil(d.t)}`:`HIDE! Ghost wakes in ${Math.ceil(d.t)}`;if(m.s)t='STUNNED!';else if(m.lw&&d.ph==='play')t='Crouch to hide here';else if(m.h&&m.cr)t='';
 cm.textContent=t;cm.style.opacity=t?1:0;$('#fl').style.opacity=m.s?.92:0;
 const tkOn=!gh&&(m.es||m.tt);$('#tsk').classList.toggle('on',!!tkOn);
 if(tkOn){$('#tskt').textContent=m.es?'ESCAPED! Tum bach gaye':m.td?'Sab tasks complete! Green EXIT pe jao':'TASK '+(m.tn+1)+'/'+m.tt+': cyan light par 4 sec khade raho';$('#tskp').style.width=(m.td?100:Math.round((m.tp||0)*100))+'%'}});

/* ---------- lives (3 hits = you become a ghost) + horror hit effect ---------- */
let lastHp=-1;
function setHearts(hp,pop){if(hp===lastHp&&!pop)return;lastHp=hp;$('#hp').innerHTML=[0,1,2].map(i=>`<svg viewBox="0 0 24 24" class="${i>=hp?'lost':''}${pop&&i===hp?' pop':''}"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-2.9A4.6 4.6 0 0120 10c0 5.8-8 11-8 11z" fill="${i<hp?'#ff3355':'#3a2a44'}" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/></svg>`).join('')}
function scare(fin){const b=document.body,j=$('#js'),r=$('#rd');b.classList.remove('shk','shk2');j.className='';void b.offsetWidth;b.classList.add(fin?'shk2':'shk');j.className='on'+(fin?' fin':'');
 r.classList.add('on');setTimeout(()=>r.classList.remove('on'),90);clearTimeout(scare.h);scare.h=setTimeout(()=>{b.classList.remove('shk','shk2');j.className=''},fin?1700:1050)}
S.on('hit',d=>{const fin=d.hp<=0;SFX.hit();navigator.vibrate&&navigator.vibrate(fin?[300,60,300,60,600]:[220,50,260]);sc&&sc.hit&&sc.hit(fin?1.4:1.1);scare(fin);setHearts(Math.max(0,d.hp),true);
 toast(fin?'Teesri hit! Ab tum GHOST ho...':'Ghost ne maara! '+d.hp+(d.hp===1?' jaan bachi - bhaago!':' jaanein bachi'),2800)});
S.on('hitg',d=>{SFX.caught();navigator.vibrate&&navigator.vibrate(70);sc&&sc.hit&&sc.hit(.3);toast('HIT! '+esc(d.n)+' ki '+d.hp+(d.hp===1?' jaan bachi':' jaanein bachi'),1800)});
S.on('w',d=>{SFX.whistle();if(d.a!==undefined&&sc){sc.at=2;sc.aa=d.a;toast('WHISTLE! The arrow points toward a human...',2200)}else toast('A whistle echoes... the ghosts got a hint!',2200)});
S.on('caught',d=>{SFX.caught();d.i!==S.id&&navigator.vibrate&&navigator.vibrate(120);toast(d.i===S.id?'Tum ab GHOST ho! Baaki insaano ko pakdo':esc(d.by||'Ghost')+' caught '+esc(d.n)+'!')});
S.on('task',d=>toast(d.n<d.t?'Task '+d.n+'/'+d.t+' complete! Agla task dhoondo':'Sab tasks complete! Green EXIT pe jao',2600));
S.on('escaped',d=>toast(d.i===S.id?'ESCAPED! Tum bach gaye!':esc(d.n)+' escape kar gaya!',2600));
S.on('boom',d=>{SFX.boom();sc&&sc.boom(d.x,d.y)});S.on('nade',d=>{SFX.throw();sc&&sc.nade(d)});
S.on('end',d=>{const m=ST&&ST.ps.find(p=>p.i===S.id),win=(d.w==='h')===!(m&&m.g);$('#vg').style.opacity=0;
 setTimeout(()=>{$('#et').textContent=win?'YOU WIN!':'YOU LOSE';$('#et').className=win?'w':'l';
  $('#es').textContent=d.w==='h'?'Some humans escaped!':'The ghosts caught everyone!';
  $('#ev').innerHTML=d.s.length?'Survivors: '+d.s.map(esc).join(', '):(d.last?'Last human caught: '+esc(d.last):'No survivors');
  $('#em').innerHTML=d.mvp&&d.mvp.t?'Top ghost: '+esc(d.mvp.n)+' ('+d.mvp.t+' caught)':'';show('end')},1200)});

/* ---------- controls: left stick = move, right side drag = look ---------- */
const look={yaw:0,pitch:0},inp={x:0,y:0,r:0,c:0},keys={},lz=$('#lz'),rz=$('#rz'),jb=$('#jb'),jk=$('#jk');let jid=null,jo=null,lid=null,lp=null;
function jv(e){let dx=e.clientX-jo.x,dy=e.clientY-jo.y;const l=Math.hypot(dx,dy),R=58;if(l>R){dx*=R/l;dy*=R/l}
 jk.style.transform=`translate(${dx}px,${dy}px)`;const m=Math.hypot(dx,dy)/R;inp.x=m<.15?0:dx/R;inp.y=m<.15?0:dy/R}
lz.addEventListener('pointerdown',e=>{jid=e.pointerId;lz.setPointerCapture(jid);jo={x:e.clientX,y:e.clientY};jb.style.cssText=`left:${jo.x-58}px;top:${jo.y-58}px;bottom:auto`;jv(e)});
lz.addEventListener('pointermove',e=>{if(e.pointerId===jid)jv(e)});
const jr=e=>{if(e.pointerId!==jid)return;jid=null;inp.x=inp.y=0;jb.style.cssText='';jk.style.transform=''};
lz.addEventListener('pointerup',jr);lz.addEventListener('pointercancel',jr);
rz.addEventListener('pointerdown',e=>{lid=e.pointerId;rz.setPointerCapture(lid);lp={x:e.clientX,y:e.clientY}});
rz.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;look.yaw+=(e.clientX-lp.x)*.0055;look.pitch=Math.max(-.6,Math.min(.6,look.pitch-(e.clientY-lp.y)*.004));lp={x:e.clientX,y:e.clientY}});
const lr=e=>{if(e.pointerId===lid)lid=null};rz.addEventListener('pointerup',lr);rz.addEventListener('pointercancel',lr);
const bC=$('#bC');function setCrouch(v){inp.c=v?1:0;bC.classList.toggle('on',!!inp.c)}bC.onpointerdown=e=>{e.preventDefault();setCrouch(!inp.c)};
const bR=$('#bR');bR.onpointerdown=()=>{inp.r=1;setCrouch(0)};bR.onpointerup=bR.onpointerleave=bR.onpointercancel=()=>inp.r=0;
$('#bN').onpointerdown=()=>S.emit('n');
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=1;if(e.code==='KeyG'||e.code==='KeyE')S.emit('n');if(e.code==='KeyC'&&!e.repeat)setCrouch(!inp.c);if(e.code==='ShiftLeft'||e.code==='Space')setCrouch(0)});
addEventListener('keyup',e=>keys[e.code]=0);
setInterval(()=>{if(keys.ArrowLeft)look.yaw-=.05;if(keys.ArrowRight)look.yaw+=.05},16);
// stick is relative to where you look; server always gets a world-space direction + your yaw
function readInput(){let jx=inp.x,jy=inp.y;const kx=(keys.KeyD?1:0)-(keys.KeyA?1:0),ky=(keys.KeyS?1:0)-(keys.KeyW?1:0);if(kx||ky){jx=kx;jy=ky}
 const c=Math.cos(look.yaw),s=Math.sin(look.yaw);return{x:-c*jy-s*jx,y:-s*jy+c*jx,r:inp.r||keys.ShiftLeft||keys.Space?1:0}}
setInterval(()=>{if(ST){const v=readInput();S.emit('i',{x:v.x,y:v.y,r:inp.c?0:v.r,c:inp.c,a:look.yaw})}},40);
function showErr(e){const b=$('#err');b.style.display='block';b.innerHTML='3D could not start on this phone: '+esc(e&&e.message||e)+'<br><a href="2d.html">Play 2D mode instead</a>'}
addEventListener('error',e=>{if(/three|View3D|WebGL/i.test(String(e.message)+String(e.filename)))showErr(e.error||e.message)});
// heartbeat + red vignette when a ghost is near (humans only)
let beatAt=0,heat=0;setInterval(()=>{const me=ST&&ST.ps.find(p=>p.i===S.id);let h=0,d=1e9,ngh=null;
 if(me&&!me.g&&ST.ph==='play'){for(const p of ST.ps)if(p.g&&!p.s){const q=Math.hypot(p.x-me.x,p.y-me.y);if(q<d){d=q;ngh=p}}h=Math.max(0,Math.min(1,1-(d-70)/330))}
 horror(me&&!me.g&&ST.ph==='play'?Math.max(0,Math.min(1,1-(d-60)/560)):0,ngh,me);
 const cv=document.getElementById('c3');if(cv)cv.style.filter=heat>.12?`saturate(${(1-heat*.6).toFixed(2)}) contrast(${(1+heat*.18).toFixed(2)}) brightness(${(1-heat*.12).toFixed(2)})`:'';
 heat+=(h-heat)*.35;$('#vg').style.opacity=heat>.05?Math.min(1,heat*(.7+.3*Math.sin(performance.now()/(330-160*heat)))):0;
 if(h>.2&&performance.now()>beatAt){SFX.beat();beatAt=performance.now()+900-520*h;if(h>.6&&navigator.vibrate)navigator.vibrate(30)}},80);

