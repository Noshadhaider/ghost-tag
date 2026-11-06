// GHOST TAG - 3D first-person renderer (three.js r128). Server stays 2D; 1 world metre = 50 server px.
// Reads client globals at runtime: ST (snapshot), RO (roster), S (socket), M (current map), look {yaw,pitch}, readInput().
(function(){
const TH=THREE,U=50,PI=Math.PI;
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const tex=(c,rx,ry)=>{const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;if(rx)t.repeat.set(rx,ry||1);t.anisotropy=4;return t};
const rnd=(s=>()=>{s=(s*16807)%2147483647;return(s-1)/2147483646})(4242);
const glowTex=(()=>{const c=cvs(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new TH.CanvasTexture(c)})();
const starTex=(()=>{const c=cvs(128,32),x=c.getContext('2d');x.fillStyle='#ffe14d';x.strokeStyle='#a87b00';x.lineWidth=2;[22,64,106].forEach(cx=>{x.beginPath();for(let i=0;i<10;i++){const r=i%2?5:12,a=i*PI/5-PI/2;x.lineTo(cx+Math.cos(a)*r,16+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()});return new TH.CanvasTexture(c)})();

/* ---------- canvas textures ---------- */
function wallpaper(col,stripe){const c=cvs(128,256),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,128,256);x.fillStyle=stripe;for(let i=0;i<128;i+=32)x.fillRect(i,0,12,190);
 x.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<60;i++)x.fillRect(rnd()*128,rnd()*190,2,8);
 x.fillStyle='#2a1c34';x.fillRect(0,190,128,66);x.fillStyle='#4a3358';x.fillRect(0,186,128,6);x.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<128;i+=42)x.fillRect(i,198,2,50);return c}
function booksTex(){const c=cvs(256,128),x=c.getContext('2d');x.fillStyle='#2a1808';x.fillRect(0,0,256,128);
 for(let r=0;r<4;r++){x.fillStyle='#4a2c14';x.fillRect(0,r*32+28,256,5);for(let i=0,px=4;px<250;i++){const w=7+rnd()*8,h=18+rnd()*9;x.fillStyle=['#b3412e','#2e6fb3','#d8b13a','#3a9a5c','#8b4fc0','#c9c9c9'][(rnd()*6)|0];x.fillRect(px,r*32+28-h,w,h);px+=w+1}}return c}
function drapeTex(a,b){const c=cvs(128,128),x=c.getContext('2d');for(let i=0;i<8;i++){const g=x.createLinearGradient(i*16,0,i*16+16,0);g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(1,a);x.fillStyle=g;x.fillRect(i*16,0,16,128)}return c}
function grassTex(){const c=cvs(128,256),x=c.getContext('2d');for(let i=0;i<46;i++){const px=4+rnd()*120,h=90+rnd()*160,l=(rnd()-.5)*36;x.strokeStyle=['#2d7a3d','#3d9a50','#1f5f30','#5ab36a'][i%4];x.lineWidth=3;x.beginPath();x.moveTo(px,256);x.quadraticCurveTo(px+l*.3,256-h*.6,px+l,256-h);x.stroke()}return c}
function plankTex(){const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#6a4a2a';x.fillRect(0,0,128,128);for(let i=0;i<8;i++){x.fillStyle=i%2?'#7a5a36':'#5a3e22';x.fillRect(i*16,0,14,128);}x.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<40;i++)x.fillRect(rnd()*128,rnd()*128,1,10);return c}
function foliageTex(){const c=cvs(256,256),x=c.getContext('2d');x.fillStyle='#0b1f17';x.fillRect(0,0,256,256);for(let i=0;i<160;i++){const px=rnd()*256,py=rnd()*256,r=10+rnd()*22;const g=x.createRadialGradient(px,py,1,px,py,r);g.addColorStop(0,['#1f5a45','#1a4a38','#2a5f3c','#16402e'][i%4]);g.addColorStop(1,'rgba(11,31,23,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}return c}
function nameTag(text,col){const c=cvs(256,64),x=c.getContext('2d');x.font='bold 34px Trebuchet MS,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#000';x.strokeText(text,128,34);x.fillStyle=col;x.fillText(text,128,34);return c}

/* ---------- characters ---------- */
const COLS=[['#ff5d73','#c2304a'],['#4fb3ff','#2a6fcf'],['#ffd24d','#d49a12'],['#6be585','#2c9a52'],['#c07bff','#7a3fd0'],['#ff9a4d','#d0601a'],['#4de2d0','#1c9a8c'],['#ff7bd0','#cc3f9a']];
const HAIR=['#3a2417','#222222','#b5651d','#f2d06b','#6b3fa0','#c0392b','#1f3a5f','#eeeeee'];
const L=(c,o)=>new TH.MeshPhongMaterial(Object.assign({color:c,shininess:25,specular:0x222222},o||{}));
const mesh=(g,m,x,y,z)=>{const o=new TH.Mesh(g,m);o.position.set(x||0,y||0,z||0);return o};
function buildHuman(ci){const [a,b]=COLS[ci%8],hair=HAIR[ci%8],acc=ci%8,g=new TH.Group(),P={};
 const skin=L(0xffd7b5),top=L(a),pants=L(b),hairM=L(hair),dark=L(0x2a1c3a),white=L(0xffffff);
 const mkLeg=sx=>{const p=new TH.Group();p.position.set(sx,.72,0);p.add(mesh(new TH.CylinderGeometry(.08,.065,.72,10),pants,0,-.36,0));p.add(mesh(new TH.BoxGeometry(.15,.08,.24),white,0,-.7,.04));g.add(p);return p};
 P.lL=mkLeg(-.1);P.lR=mkLeg(.1);
 P.body=new TH.Group();g.add(P.body);
 P.body.add(mesh(new TH.CylinderGeometry(.2,.23,.58,14),top,0,1.0,0));P.body.add(mesh(new TH.SphereGeometry(.205,14,8,0,PI*2,0,PI/2),top,0,1.29,0));
 P.body.add(mesh(new TH.CylinderGeometry(.235,.235,.05,14),white,0,.84,0));
 if(acc===1||acc===4)P.body.add(mesh(new TH.BoxGeometry(.22,.12,.04),L(0xffffff,{opacity:.3,transparent:true}),0,.95,.215));
 if(acc===3||acc===7)P.body.add(mesh(new TH.BoxGeometry(.04,.55,.01),L(0xffe14d),0,1.0,.235));
 const mkArm=sx=>{const p=new TH.Group();p.position.set(sx,1.25,0);p.add(mesh(new TH.CylinderGeometry(.058,.05,.5,10),top,0,-.25,0));p.add(mesh(new TH.SphereGeometry(.065,10,8),skin,0,-.53,0));P.body.add(p);return p};
 P.aL=mkArm(-.28);P.aR=mkArm(.28);
 P.head=new TH.Group();P.head.position.set(0,1.5,0);P.body.add(P.head);const H=P.head;
 H.add(mesh(new TH.SphereGeometry(.235,18,14),skin));
 H.add(mesh(new TH.SphereGeometry(.248,18,10,0,PI*2,0,PI*.44),hairM));H.add(mesh(new TH.SphereGeometry(.248,18,10,PI,PI,0,PI*.72),hairM));
 [-.085,.085].forEach(e=>{const w=mesh(new TH.SphereGeometry(.05,10,8),white,e,-.01,.2);w.scale.set(1,1.25,.6);H.add(w);H.add(mesh(new TH.SphereGeometry(.03,8,8),dark,e,-.015,.232));H.add(mesh(new TH.SphereGeometry(.01,6,6),white,e+.008,.0,.255))});
 [-.15,.15].forEach(e=>{const c=mesh(new TH.SphereGeometry(.035,8,6),L(0xff6e8c,{transparent:true,opacity:.6}),e,-.08,.19);c.scale.set(1,.6,.4);H.add(c)});
 const mo=mesh(new TH.SphereGeometry(.022,8,6),L(0x7a2a3a),0,-.1,.218);mo.scale.set(1.3,.8,.5);H.add(mo);
 const A=L(a),B=L(b);
 if(acc===0){H.add(mesh(new TH.SphereGeometry(.262,16,10,0,PI*2,0,PI*.4),B,0,.01,0));H.add(mesh(new TH.CylinderGeometry(.258,.258,.07,16),white,0,.17,0));H.add(mesh(new TH.SphereGeometry(.05,8,8),white,0,.3,0))}
 if(acc===1){H.add(mesh(new TH.SphereGeometry(.26,16,10,0,PI*2,0,PI*.42),A,0,.01,0));const br=mesh(new TH.BoxGeometry(.22,.025,.18),A,0,.1,.28);br.rotation.x=.15;H.add(br)}
 if(acc===2){const rb=L(0xff5d9a);[-1,1].forEach(s=>{const c=mesh(new TH.ConeGeometry(.07,.16,8),rb,s*.14,.25,0);c.rotation.z=-s*PI/2;H.add(c)});H.add(mesh(new TH.SphereGeometry(.04,8,8),rb,0,.25,0).translateX(.0))}
 if(acc===3){const t=mesh(new TH.TorusGeometry(.26,.02,8,20,PI),L(0x333333),0,0,0);H.add(t);[-1,1].forEach(s=>{const c=mesh(new TH.CylinderGeometry(.075,.075,.05,12),L(0xff4d6d),s*.26,0,0);c.rotation.z=PI/2;H.add(c)})}
 if(acc===4)[-1,1].forEach(s=>{const c=mesh(new TH.ConeGeometry(.08,.18,8),A,s*.14,.26,0);c.rotation.z=-s*.25;H.add(c)});
 if(acc===5){const gm=L(0x222222);[-.085,.085].forEach(e=>H.add(mesh(new TH.TorusGeometry(.062,.01,6,14),gm,e,-.01,.235)));H.add(mesh(new TH.BoxGeometry(.05,.01,.01),gm,0,-.01,.24))}
 if(acc===6){const r=mesh(new TH.TorusGeometry(.245,.02,6,24),A,0,.08,0);r.rotation.x=PI/2;H.add(r)}
 if(acc===7)[-1,1].forEach(s=>{H.add(mesh(new TH.SphereGeometry(.085,10,8),hairM,s*.26,-.08,0))});
 g.userData.P=P;return g}
/* ---------- optional real ghost model: public/models/ghost.glb (CC-BY-4.0, see README). Falls back to the built-in buildGhost() if it can't load ---------- */
const GHOST_HEIGHT=2.7; // model height in metres (procedural ghost is ~2.4 m tall). Increase to make it bigger
const GHOST_YAW=0; // rotate the model if it faces the wrong way (radians)
let GHOST_GLB=null; // null = loading, false = unavailable, Group = ready (normalised to GHOST_HEIGHT, feet on floor)
function loadGhostGLB(){
 if(!TH.GLTFLoader){GHOST_GLB=false;return}
 try{new TH.GLTFLoader().load('models/ghost.glb',gltf=>{
   const m=gltf.scene;m.updateMatrixWorld(true);
   const box=new TH.Box3().setFromObject(m),size=box.getSize(new TH.Vector3()),c=box.getCenter(new TH.Vector3());
   const s=GHOST_HEIGHT/Math.max(.001,size.y);
   m.scale.setScalar(s);m.position.set(-c.x*s,-box.min.y*s,-c.z*s);
   const wrap=new TH.Group();wrap.add(m);wrap.rotation.y=GHOST_YAW;GHOST_GLB=wrap;
  },undefined,()=>{GHOST_GLB=false})}catch(err){GHOST_GLB=false}
}
function attachGhostModel(e){ // hide the procedural ghost, show a clone of the real model
 e.g.children.forEach(c=>{c.visible=false});
 e.glb=GHOST_GLB.clone(true);e.g.add(e.glb);prepWalk(e);
}
/* The GLB has no separate legs (its long arms reach the floor), so the "walk" is done on those lower limbs:
   vertices on the sides below the shoulders swing front/back, left and right out of phase, like a creeping stride. */
function prepWalk(e){let mesh=null;e.glb.traverse(c=>{if(c.isMesh&&!mesh)mesh=c});if(!mesh)return;
 mesh.geometry=mesh.geometry.clone(); // own copy per ghost, because positions are animated
 const pos=mesh.geometry.attributes.position,base=Float32Array.from(pos.array),idx=[],w=[],sd=[];
 for(let i=0;i<pos.count;i++){const x=base[3*i],z=base[3*i+2];
  if(Math.abs(x)>.85&&z<2.2){idx.push(i);w.push(Math.min(1,(2.2-z)/1.2));sd.push(x>0?1:-1)}}
 e.walk={pos,base,idx,w,sd}}
function animWalk(e,amp){if(!e.walk)return;const W=e.walk,s=Math.sin(e.ph),A=.32*amp;
 for(let k=0;k<W.idx.length;k++){const i=W.idx[k];W.pos.array[3*i+1]=W.base[3*i+1]+A*W.sd[k]*W.w[k]*s}
 W.pos.needsUpdate=true}
loadGhostGLB();
function buildGhost(){const g=new TH.Group(),P={};
 // horror wraith: tall, ragged grey shroud, black hollow eyes with red pinpoints, gaping mouth, long clawed arms
 const bm=new TH.MeshPhongMaterial({color:0xb4bfb8,emissive:0x16231c,emissiveIntensity:.5,transparent:true,opacity:.78,shininess:10,depthWrite:false,side:TH.DoubleSide});P.bm=bm;
 const dk=new TH.MeshBasicMaterial({color:0x000000,fog:false}),red=new TH.MeshBasicMaterial({color:0xff2418,fog:false});
 const root=new TH.Group();g.add(root);P.root=root;
 const head=mesh(new TH.SphereGeometry(.34,18,14),bm,0,1.62,0);head.scale.set(.88,1.3,.9);root.add(head);
 root.add(mesh(new TH.CylinderGeometry(.26,.6,1.45,16,1,true),bm,0,.86,0));
 root.add(mesh(new TH.SphereGeometry(.3,12,8),bm,0,1.28,0).translateZ(-.04));
 P.bumps=[];for(let i=0;i<10;i++){const a=i/10*PI*2,s=mesh(new TH.ConeGeometry(.1,.75+(i%3)*.18,5),bm,Math.cos(a)*.5,.2,Math.sin(a)*.5);s.rotation.x=PI;s.userData.a=a;root.add(s);P.bumps.push(s)}
 const arm=sx=>{const a=new TH.Group();a.position.set(sx,1.38,.08);const c=mesh(new TH.CylinderGeometry(.05,.032,1.15,8),bm,0,-.12,.5);c.rotation.x=PI/2-.4;a.add(c);
  [-1,0,1].forEach(f=>{const fg=mesh(new TH.ConeGeometry(.018,.3,5),dk,f*.05,-.4,1.0);fg.rotation.x=PI/2+.25;fg.rotation.z=f*-.2;a.add(fg)});root.add(a);return a};
 P.aL=arm(-.34);P.aR=arm(.34);
 [-1,1].forEach(s=>{const sk=mesh(new TH.SphereGeometry(.085,10,8),dk,s*.115,1.7,.27);sk.scale.set(1,1.5,.6);root.add(sk);root.add(mesh(new TH.SphereGeometry(.026,8,8),red,s*.115,1.69,.315));
  const br=mesh(new TH.BoxGeometry(.18,.03,.02),dk,s*.115,1.82,.3);br.rotation.z=s*-.45;root.add(br)});
 P.mouth=mesh(new TH.SphereGeometry(.085,10,8),dk,0,1.46,.3);P.mouth.scale.set(1,2.2,.4);root.add(P.mouth);
 const gl=new TH.Sprite(new TH.SpriteMaterial({map:glowTex,color:0xff2a2a,blending:TH.AdditiveBlending,transparent:true,depthWrite:false,opacity:.28,fog:false}));gl.scale.set(3,3,1);gl.position.y=1.3;root.add(gl);P.gl=gl;
 root.scale.setScalar(1.15);g.userData.P=P;return g}

/* ---------- world props ---------- */
const FPAL={shelf:0x5a3a1e,table:0x7a5230,sofa:0x8a2f4a,bed:0x6d4a2c,piano:0x1d1a24,tub:0xeef5f8,counter:0x7c818a,crate:0xa0703d};
class View3D{
 constructor(m){this.ready=false;this.ents={};this.fx=[];this.nades=[];this.at=0;this.aa=0;this.shake=0;this.hs=0;this.pr=null;this.first=true;this.eye=1.6;this.fov=72;this.lastN=0;this.bobT=0;this.mc={};this.disp=[];
  const cv=cvs(16,16);document.getElementById('game').appendChild(cv);cv.id='c3';
  const r=this.r=new TH.WebGLRenderer({canvas:cv,antialias:!/Mobi|Android/i.test(navigator.userAgent),powerPreference:'high-performance'});r.setPixelRatio(Math.min(window.devicePixelRatio||1,/Mobi|Android/i.test(navigator.userAgent)?1.5:2));
  const sc=this.scene=new TH.Scene();const cam=this.cam=new TH.PerspectiveCamera(72,1,.08,90);cam.rotation.order='YXZ';sc.add(cam);
  sc.add(this.amb=new TH.AmbientLight(0x6a6090,.62));sc.add(new TH.HemisphereLight(0x8a9cff,0x201028,.55));
  this.spot=new TH.SpotLight(0xfff0d0,2.2,32,.62,.5,1);cam.add(this.spot);cam.add(this.spot.target);this.spot.target.position.set(0,0,-6);
  this.pt=new TH.PointLight(0xffe6b8,1.1,9,1.4);cam.add(this.pt);
  this.fl=new TH.PointLight(0xffffff,0,28,1.5);sc.add(this.fl);this.tl=[0,1].map(()=>{const l=new TH.PointLight(0xffa040,0,11,1.5);sc.add(l);return l});
  this.world=new TH.Group();sc.add(this.world);
  // ambient motes (fireflies / dust) following the camera
  const N=70,pos=new Float32Array(N*3);this.mv=[];for(let i=0;i<N;i++){pos[i*3]=pos[i*3+1]=pos[i*3+2]=0;this.mv.push({x:(rnd()-.5)*24,y:.4+rnd()*2.6,z:(rnd()-.5)*24,p:rnd()*6})}
  const pg=new TH.BufferGeometry();pg.setAttribute('position',new TH.BufferAttribute(pos,3));this.motes=new TH.Points(pg,new TH.PointsMaterial({size:.16,map:glowTex,transparent:true,blending:TH.AdditiveBlending,depthWrite:false,color:0xffffff,fog:false}));this.motes.frustumCulled=false;sc.add(this.motes);
  this.setMap(m);this.resize();addEventListener('resize',()=>this.resize());
  this.ready=true;this.last=performance.now();const loop=t=>{requestAnimationFrame(loop);this.frame(t)};requestAnimationFrame(loop)}
 resize(){const w=innerWidth,h=innerHeight;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
 mat(c,o){const k=c+JSON.stringify(o||{});return this.mc[k]||(this.mc[k]=L(c,Object.assign({shininess:8,specular:0x101010},o||{})))}
 clearWorld(){this.world.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)[].concat(n.material).forEach(m=>{['map','emissiveMap'].forEach(k=>m[k]&&m[k].dispose());m.dispose()})});
  while(this.world.children.length)this.world.remove(this.world.children[0]);this.mc={};this.water=null;(this.sky||[]).forEach(o=>{this.cam.remove(o);o.geometry&&o.geometry.dispose();o.material&&o.material.dispose()});this.sky=[]}
 setMap(m){this.m=m;this.clearWorld();this.tick=[];const fo=m.theme==='forest',bg=m.bg||(fo?0x061018:0x07040c),fd=m.fog||(fo?.055:.07);this.scene.background=new TH.Color(bg);this.scene.fog=new TH.FogExp2(bg,fd);this.fogBase=fd;
  this.tl.forEach(l=>l.color.set(fo?0x7affc8:0xffa040));this.motes.material.color.set(fo?0xc8ff7a:0xffe9c0);this.motes.material.size=fo?.2:.1;
  const W=m.W/U,Hh=m.H/U,wd=this.world,add=o=>{wd.add(o);return o};
  // floor = the 2D map art with props removed (rugs, paths, pond, graveyard) + emissive light pools
  const [fc]=ART.maps(m,true),FH=Math.round(2048*m.H/m.W),GH=Math.round(512*m.H/m.W),pc=cvs(2048,FH);pc.getContext('2d').drawImage(fc,0,0,2048,FH);
  const gc=cvs(512,GH),gx=gc.getContext('2d');gx.fillStyle='#000';gx.fillRect(0,0,512,GH);
  m.torches.forEach(([x,y])=>{const px=x/m.W*512,py=y/m.H*GH,g=gx.createRadialGradient(px,py,0,px,py,34);const c=fo?'90,255,200':'255,150,60';g.addColorStop(0,`rgba(${c},.8)`);g.addColorStop(1,`rgba(${c},0)`);gx.fillStyle=g;gx.fillRect(px-40,py-40,80,80)});
  const ft=new TH.CanvasTexture(pc);ft.anisotropy=4;const et=new TH.CanvasTexture(gc);
  const fl=new TH.Mesh(new TH.PlaneGeometry(W,Hh),new TH.MeshPhongMaterial({map:ft,emissiveMap:et,emissive:0xffffff,emissiveIntensity:.7,shininess:6,specular:0x111111}));fl.rotation.x=-PI/2;fl.position.set(W/2,0,Hh/2);add(fl);
  if(!fo){const ce=new TH.Mesh(new TH.PlaneGeometry(W,Hh),this.mat(0x15101c,{side:TH.DoubleSide}));ce.rotation.x=PI/2;ce.position.set(W/2,3.2,Hh/2);add(ce);this.house(m,add)}else this.forest(m,add);
  PROPS.bake(this.world);
  if(this.ents)for(const k in this.ents)this.kill(k)}
 box(x,y,w,h,hh,mt,yo){const o=new TH.Mesh(new TH.BoxGeometry(w/U,hh,h/U),mt);o.position.set((x+w/2)/U,(yo||0)+hh/2,(y+h/2)/U);return o}
 glow(x,y,z,col,s,op){const g=new TH.Sprite(new TH.SpriteMaterial({map:glowTex,color:col,blending:TH.AdditiveBlending,transparent:true,depthWrite:false,opacity:op||.8,fog:false}));g.position.set(x,y,z);g.scale.set(s,s,1);return g}
 /* ===== HOUSE ===== */
 house(m,add){this.flames=[];const wp=tex(wallpaper(...(m.wp||['#5a4268','#6a4f7c'])));
  m.walls.forEach(([x,y,w,h])=>{const t=wp.clone();t.needsUpdate=true;t.repeat.set(Math.max(w,h)/U/2.4,1);add(this.box(x,y,w,h,3.2,new TH.MeshPhongMaterial({map:t,shininess:4,specular:0x111111})))});
  PROPS.walls(this,m,this.world,U);
  m.solid.forEach(([t,x,y,w,h])=>{const g=new TH.Group();g.position.set((x+w/2)/U,0,(y+h/2)/U);PROPS.furn(this,t,g,w/U,h/U,FPAL[t]);add(g)});
  m.hide.forEach(([t,x,y,w,h,fc])=>{const g=new TH.Group();g.position.set((x+w/2)/U,0,(y+h/2)/U);if(fc)g.rotation.y=PI;
   if(!PROPS.hide(this,t,g,w/U,h/U,x,y)){g.add(mesh(new TH.BoxGeometry(w/U,2,h/U),this.mat(0x555555),0,1,0))}add(g)});
  m.torches.forEach(([x,y])=>{const X=x/U,Z=y/U,g=new TH.Group();g.position.set(X,0,Z);g.add(mesh(new TH.CylinderGeometry(.04,.06,1.5,8),this.mat(0x2a1c14),0,.75,0));g.add(mesh(new TH.CylinderGeometry(.18,.08,.2,10),this.mat(0x1a120c),0,1.55,0));
   const fm=new TH.Mesh(new TH.ConeGeometry(.12,.38,8),new TH.MeshBasicMaterial({color:0xffb347,fog:false}));fm.position.y=1.82;fm.userData.keep=1;g.add(fm);g.add(this.glow(0,1.8,0,0xff9a3c,2.4,.9));g.userData.f=fm;add(g);this.flames.push(g)});}
 /* ===== FOREST ===== */
 forest(m,add){const fol=tex(foliageTex()),wood=tex(plankTex());this.flames=[];
  m.walls.forEach(([x,y,w,h],i)=>{if(i<4){const t=fol.clone();t.needsUpdate=true;t.repeat.set(Math.max(w,h)/U/3,2);add(this.box(x,y,w,h,7,new TH.MeshPhongMaterial({map:t,shininess:2})))}
   else{const t=wood.clone();t.needsUpdate=true;t.repeat.set(Math.max(w,h)/U/1.5,1);add(this.box(x,y,w,h,1.15,new TH.MeshPhongMaterial({map:t,shininess:4})))}});
  m.trees.forEach(([x,y,s,v])=>{const g=new TH.Group();g.position.set(x/U,0,y/U);PROPS.tree(this,g,s,v,x,y);add(g)});
  m.solid.forEach(([t,x,y,w,h])=>{if(t==='tree')return;const g=new TH.Group();g.position.set((x+w/2)/U,0,(y+h/2)/U);if(!PROPS.out(this,t,g,w/U,h/U,x,y))return;add(g)});
  m.hide.forEach(([t,x,y,w,h])=>{const g=new TH.Group();g.position.set((x+w/2)/U,0,(y+h/2)/U);if(!PROPS.hide(this,t,g,w/U,h/U,x,y))return;add(g)});
  PROPS.ground(this,m,this.world,U);
  m.torches.forEach(([x,y])=>{const g=new TH.Group();g.position.set(x/U,0,y/U);g.add(mesh(new TH.CylinderGeometry(.04,.05,2.2,8),this.mat(0x2a1c14),0,1.1,0));g.add(mesh(new TH.BoxGeometry(.28,.34,.28),this.mat(0x1a1208),0,2.3,0));
   g.add(mesh(new TH.BoxGeometry(.2,.26,.2),new TH.MeshBasicMaterial({color:0xbfffe0,fog:false}),0,2.3,0));g.add(this.glow(0,2.3,0,0x7affc8,3,.85));add(g)});
  // sky: stars + moon locked to the camera
  const sp=new Float32Array(420*3);for(let i=0;i<420;i++){const a=rnd()*PI*2,e=Math.acos(1-rnd()*.9),r=70;sp[i*3]=Math.sin(e)*Math.cos(a)*r;sp[i*3+1]=Math.cos(e)*r;sp[i*3+2]=Math.sin(e)*Math.sin(a)*r}
  const sg=new TH.BufferGeometry();sg.setAttribute('position',new TH.BufferAttribute(sp,3));const st=new TH.Points(sg,new TH.PointsMaterial({size:1.6,sizeAttenuation:false,color:0xdfeaff,fog:false}));st.frustumCulled=false;this.cam.add(st);(this.sky=this.sky||[]).push(st);
  const mo=this.glow(-30,28,-55,0xdfeaff,26,.8);this.cam.add(mo);this.sky.push(mo)}
 /* ===== entities ===== */
 tag(e,text,col){if(e.tt===text&&e.tc===col)return;e.tt=text;e.tc=col;if(e.tag){e.tag.material.map.dispose();e.tag.material.dispose();e.g.remove(e.tag)}
  e.tag=new TH.Sprite(new TH.SpriteMaterial({map:new TH.CanvasTexture(nameTag(text,col)),transparent:true,depthWrite:false,fog:false}));e.tag.scale.set(1.5,.375,1);e.tag.position.y=e.gh?2.85:2.15;e.g.add(e.tag)}
 mk(p){const gh=!!p.g,e={x:p.x,y:p.y,ya:p.a||0,gh,ph:Math.random()*6,key:''};e.g=gh?buildGhost():buildHuman((RO[p.i]||{}).c||0);e.P=e.g.userData.P;e.key=gh?'gh':'h';this.scene.add(e.g);return this.ents[p.i]=e}
 kill(k){const e=this.ents[k];if(!e)return;this.scene.remove(e.g);delete this.ents[k]}
 nade(d){const o=mesh(new TH.SphereGeometry(.09,10,8),this.mat(0x30343c),0,0,0);o.add(mesh(new TH.CylinderGeometry(.03,.03,.1,6),this.mat(0xff4d4d),0,.1,0));this.scene.add(o);this.nades.push({o,t:0,a:[d.a/U,d.b/U],b:[d.x/U,d.y/U]})}
 boom(x,y){const X=x/U,Z=y/U,s=mesh(new TH.SphereGeometry(1,16,12),new TH.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:.8,blending:TH.AdditiveBlending,depthWrite:false,fog:false}),X,1,Z);this.scene.add(s);
  this.fl.position.set(X,1.5,Z);this.fx.push({t:0,d:.7,u:(k)=>{s.scale.setScalar(.2+k*3);s.material.opacity=.8*(1-k);this.fl.intensity=5*(1-k);if(k>=1){this.scene.remove(s);s.geometry.dispose();s.material.dispose()}}});this.shake=.45}
 hit(k){this.hs=Math.max(this.hs,k||1)}
 reset(){this.hs=0;for(const k in this.ents)this.kill(k);this.first=true;this.pr=null;this.at=0;this.fx=[];this.nades.forEach(n=>this.scene.remove(n.o));this.nades=[];this.fl.intensity=0}
 predict(p,dt){if(p.es)return;const q=this.pr;if(ST.n!==this.lastN){this.lastN=ST.n;const ex=p.x-q.x,ey=p.y-q.y,d=Math.hypot(ex,ey);if(d>100){q.x=p.x;q.y=p.y}else if(d>5){q.x+=ex*.12;q.y+=ey*.12}}
  const v=readInput(),len=Math.hypot(v.x,v.y);if(len>.05&&p.ms>0){let sp=p.ms;if(!p.g&&sp<170&&v.r&&p.st>3&&!p.cr&&!inp.c)sp=175;const mm=Math.min(1,len)*sp*dt;GTMAP.move(M,q,v.x/len*mm,v.y/len*mm)}}
 updMarkers(me,t){const M=this.m; // exit doors (humans only) + your own task spot (cyan)
  if(this.mkFor!==M){if(this.mk)this.scene.remove(this.mk);this.mk=new TH.Group();this.mkFor=M;this.exitMats=[];
   (M.exits||[]).forEach(e=>{const x=e[0]/U,z=e[1]/U,bm=new TH.MeshBasicMaterial({color:0xff3344,transparent:true,opacity:.22,depthWrite:false,fog:false});
    const beam=new TH.Mesh(new TH.CylinderGeometry(.9,.9,4,20,1,true),bm);beam.position.set(x,2,z);this.mk.add(beam);
    const sp=this.glow(x,.6,z,0xff3344,3.4,.9);this.mk.add(sp);this.exitMats.push(bm,sp.material)});
   this.taskG=new TH.Group();const tb=new TH.Mesh(new TH.CylinderGeometry(.5,.5,4,20,1,true),new TH.MeshBasicMaterial({color:0x7ff3ff,transparent:true,opacity:.28,depthWrite:false,fog:false}));
   tb.position.y=2;this.taskG.add(tb);this.taskG.add(this.glow(0,.5,0,0x7ff3ff,3,.95));this.mk.add(this.taskG);this.scene.add(this.mk)}
  if(!this.mk.parent)this.scene.add(this.mk);
  const hum=!!me&&!me.g;this.mk.visible=hum;
  const col=me&&me.td?0x2de2a0:0xff3344;this.exitMats.forEach(mt=>mt.color.setHex(col));
  const show=hum&&!me.es&&!me.td&&!!(me.tx||me.ty);this.taskG.visible=show;
  if(show){this.taskG.position.set(me.tx/U,0,me.ty/U);this.taskG.scale.setScalar(1+.08*Math.sin(t*4))}}
 frame(now){const dt=Math.min(.1,(now-this.last)/1000);this.last=now;if(!ST||!this.m)return;const t=now/1000,me=ST.ps.find(p=>p.i===S.id);
  const seen={};
  for(const p of ST.ps){seen[p.i]=1;if(p.i===S.id)continue;let e=this.ents[p.i];const gh=!!p.g;
   if(e&&e.gh!==gh){const ox=e.x,oy=e.y;this.kill(p.i);e=null;this.fx.push({t:0,d:.5,u:k=>{}});}
   if(!e)e=this.mk(p);
   if(Math.hypot(p.x-e.x,p.y-e.y)>140){e.x=p.x;e.y=p.y}else{const k=1-Math.pow(.0004,dt);e.x+=(p.x-e.x)*k;e.y+=(p.y-e.y)*k}
   let d=(p.a||0)-e.ya;d=Math.atan2(Math.sin(d),Math.cos(d));e.ya+=d*Math.min(1,dt*12);
   const P=e.P,g=e.g;g.position.set(e.x/U,0,e.y/U);g.rotation.y=PI/2-e.ya;const mv=p.m?1:0;e.ph+=dt*(mv?(p.d?16:10):2);
   if(gh){if(GHOST_GLB&&!e.glb)attachGhostModel(e);
    if(e.glb){e.amp=(e.amp!==undefined?e.amp:1)+((mv?1:.25)-(e.amp!==undefined?e.amp:1))*Math.min(1,dt*6);animWalk(e,e.amp);e.glb.position.y=Math.abs(Math.sin(e.ph))*.05*e.amp}P.root.position.y=.3+Math.sin(t*2+e.ph)*.1;P.aL.rotation.z=Math.sin(e.ph)*.5;P.aR.rotation.z=-Math.sin(e.ph)*.5;P.bumps.forEach(b=>b.position.y=.28+Math.sin(t*5+b.userData.a*2)*.07);
    P.bm.color.set(p.s?0x5a5f68:0xb4bfb8);P.bm.emissiveIntensity=p.s?.05:.35+.2*Math.sin(t*7+e.ph);P.bm.opacity=p.s?.5:(Math.random()<.03?.3:.62+.18*Math.sin(t*2.3+e.ph));if(P.mouth)P.mouth.scale.y=2+Math.abs(Math.sin(t*7+e.ph))*1.5;if(P.gl)P.gl.material.opacity=.2+.12*Math.sin(t*5+e.ph);P.root.rotation.z=p.d?.0:0;P.root.rotation.x=mv?.12:0}
   else{const s=Math.sin(e.ph);P.lL.rotation.x=mv?s*.75:0;P.lR.rotation.x=mv?-s*.75:0;P.aL.rotation.x=mv?-s*.7:Math.sin(t*1.5)*.03;P.aR.rotation.x=mv?s*.7:-Math.sin(t*1.5)*.03;P.body.position.y=mv?Math.abs(s)*.035:0;
    const cr=(p.hd||p.cr)?.62:1;g.scale.y+=(cr-g.scale.y)*Math.min(1,dt*10)}
   this.tag(e,(RO[p.i]||{}).n||'',gh?'#ff6a6a':'#ffffff');
   const dd=Math.hypot(p.x-(this.pr?this.pr.x:p.x),p.y-(this.pr?this.pr.y:p.y))/U;e.tag.visible=dd<14;e.tag.position.y=(gh?2.85:2.15)/(g.scale.y||1)}
  for(const id in this.ents)if(!seen[id])this.kill(id);
  this.updMarkers(me,t);
  if(me){if(this.first||!this.pr){this.pr={x:me.x,y:me.y};this.first=false;look.yaw=Math.atan2(M.H/2-me.y,M.W/2-me.x);look.pitch=0}else this.predict(me,dt);
   const gh=!!me.g,blind=me.s||(gh&&ST.ph==='count'),hh=gh||typeof heat==='undefined'?0:heat;const target=me.h?.82:(me.cr?1.0:(gh?1.55:1.62));this.eye+=(target-this.eye)*Math.min(1,dt*8);
   const mv=readInput(),moving=Math.hypot(mv.x,mv.y)>.1&&me.ms>0;this.bobT+=dt*(moving?(mv.r?13:9):0);
   const cam=this.cam;cam.position.set(this.pr.x/U,this.eye+(moving?Math.sin(this.bobT)*.035:0)+(gh?Math.sin(t*2)*.04:0),this.pr.y/U);
   if(this.shake>0){this.shake=Math.max(0,this.shake-dt);cam.position.x+=(Math.random()-.5)*this.shake*.4;cam.position.y+=(Math.random()-.5)*this.shake*.4}
   const hsA=this.hs>0?(this.hs=Math.max(0,this.hs-dt/1.5),this.hs*this.hs*.9+this.hs*.1):0;
   if(hsA>0){cam.position.x+=(Math.random()-.5)*hsA*.5;cam.position.y+=(Math.random()-.5)*hsA*.4;cam.position.z+=(Math.random()-.5)*hsA*.5}
   cam.rotation.y=-look.yaw-PI/2;cam.rotation.x=look.pitch;cam.rotation.z=moving?Math.sin(this.bobT*.5)*.008:0;
   if(hsA>0){cam.rotation.z+=Math.sin(t*55)*hsA*.2+(Math.random()-.5)*hsA*.1;cam.rotation.x+=(Math.random()-.5)*hsA*.3;cam.rotation.y+=(Math.random()-.5)*hsA*.3}
   const tf=72+(me.d?16:0)+(moving&&mv.r?4:0)-hh*7+hsA*26;this.fov+=(tf-this.fov)*Math.min(1,dt*8);if(Math.abs(cam.fov-this.fov)>.05){cam.fov=this.fov;cam.updateProjectionMatrix()}
   if(gh){this.spot.color.set(0x9fe8ff);this.spot.intensity=blind?.1:1.8;this.spot.angle=.95;this.pt.color.set(0x7fd8ff);this.pt.distance=14;this.pt.intensity=blind?.2:1.2}
   else{this.spot.color.set(0xfff0d0);this.spot.intensity=blind?.1:2.3*(hh>.35&&Math.random()<hh*.3?.15:1);this.spot.angle=.6;this.pt.color.set(0xffe6b8);this.pt.distance=9;this.pt.intensity=blind?.2:1.1}
   this.scene.fog.density+=((blind?.22:this.fogBase*(1+hh*.7)+hsA*.1)-this.scene.fog.density)*Math.min(1,dt*6);
   if(hsA>.25){this.spot.intensity*=Math.random()<.5?.1:1;this.pt.intensity*=Math.random()<.5?.2:1}
   if(hh>.55)cam.position.x+=(Math.random()-.5)*(hh-.55)*.06;
   // 2 real lights on the nearest torches (flickering) - warm pools of light instead of flat glow
   const tt=this.m.torches.map(q=>[Math.hypot(q[0]-this.pr.x,q[1]-this.pr.y),q]).sort((a,b)=>a[0]-b[0]);this.tl.forEach((l,i)=>{const q=tt[i];if(q&&q[0]<700){l.position.set(q[1][0]/U,1.9,q[1][1]/U);l.intensity=(.9+.35*Math.sin(t*13+i*3)+.2*Math.sin(t*31+i))*(hh>.4&&Math.random()<hh*.2?.2:1)}else l.intensity=0})}
  // whistle arrow (HUD)
  const wa=document.getElementById('wa');if(this.at>0&&me){this.at-=dt;wa.style.display='block';wa.style.transform='rotate('+((this.aa-look.yaw)*180/PI)+'deg)';wa.style.opacity=.6+.4*Math.sin(t*12)}else if(wa)wa.style.display='none';
  // thrown grenades + effects
  for(let i=this.nades.length-1;i>=0;i--){const n=this.nades[i];n.t+=dt/.9;const k=Math.min(1,n.t);n.o.position.set(n.a[0]+(n.b[0]-n.a[0])*k,1.3*(1-k)+.12+Math.sin(k*PI)*1.2,n.a[1]+(n.b[1]-n.a[1])*k);n.o.rotation.x+=dt*12;if(n.t>=1){this.scene.remove(n.o);this.nades.splice(i,1)}}
  for(let i=this.fx.length-1;i>=0;i--){const f=this.fx[i];f.t+=dt;f.u(Math.min(1,f.t/f.d));if(f.t>=f.d)this.fx.splice(i,1)}
  this.flames.forEach((g,i)=>{if(g.userData.f)g.userData.f.scale.set(1,.85+Math.sin(t*14+i*2)*.2,1)});
  if(this.tick)for(let i=0;i<this.tick.length;i++)this.tick[i](t);
  if(this.water)this.water.material.opacity=.5+Math.sin(t*1.5)*.06;
  // motes
  const cp=this.cam.position,arr=this.motes.geometry.attributes.position.array;this.mv.forEach((o,i)=>{o.x+=Math.sin(t*.5+o.p)*dt*.4;o.z+=Math.cos(t*.4+o.p)*dt*.4;o.y+=Math.sin(t*.7+o.p*2)*dt*.15;
   if(o.x>12)o.x-=24;if(o.x<-12)o.x+=24;if(o.z>12)o.z-=24;if(o.z<-12)o.z+=24;arr[i*3]=cp.x+o.x;arr[i*3+1]=o.y;arr[i*3+2]=cp.z+o.z});this.motes.geometry.attributes.position.needsUpdate=true;
  this.r.render(this.scene,this.cam)}
}
window.View3D=View3D;
})();
