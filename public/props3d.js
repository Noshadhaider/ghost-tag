// GHOST TAG - detailed 3D props (three.js r128). Replaces the plain "box" furniture/trees with shaped, textured models.
// Every builder fills a THREE.Group centred on the prop's footprint (units = metres, 1 m = 50 server px).
// PROPS.bake(world) afterwards merges all static meshes that share a material, so hundreds of props cost only a few draw calls.
(function(){
const TH=THREE,PI=Math.PI,TAU=PI*2;
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const rnd=(s=>()=>{s=(s*16807)%2147483647;return(s-1)/2147483646})(9137);
const rr=(a,b)=>a+rnd()*(b-a);
const TC={},MC={};
const ct=(c,rx,ry)=>{const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;if(rx)t.repeat.set(rx,ry||rx);t.anisotropy=4;return t};
const once=(k,f)=>TC[k]||(TC[k]=f());
const mp=(map,o)=>{const k=(map?map.uuid:'')+JSON.stringify(o||{});return MC[k]||(MC[k]=new TH.MeshPhongMaterial(Object.assign({map,shininess:8,specular:0x151515},o||{})))};
const mc=(c,o)=>{const k='c'+c+JSON.stringify(o||{});return MC[k]||(MC[k]=new TH.MeshPhongMaterial(Object.assign({color:c,shininess:10,specular:0x151515},o||{})))};
const mb=(c,o)=>{const k='b'+c+JSON.stringify(o||{});return MC[k]||(MC[k]=new TH.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{})))};

/* ---------------- textures (drawn once, cached) ---------------- */
const T={
 wood:(a,b)=>{a=a||'#6a4527';b=b||'#503319';return once('wood'+a+b,()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle=a;x.fillRect(0,0,128,128);
  for(let p=0;p<4;p++){const pw=32;x.globalAlpha=.55;x.fillStyle=p%2?b:a;x.fillRect(p*pw,0,pw,128);x.globalAlpha=1;
   for(let i=0;i<16;i++){x.strokeStyle='rgba(0,0,0,'+(.05+rnd()*.13)+')';const gx=p*pw+2+rnd()*(pw-4);x.beginPath();x.moveTo(gx,0);x.bezierCurveTo(gx+rr(-4,4),40,gx+rr(-4,4),90,gx+rr(-2,2),128);x.stroke()}
   if(rnd()<.7){x.fillStyle='rgba(30,16,6,.5)';x.beginPath();x.ellipse(p*pw+8+rnd()*(pw-16),rnd()*128,3,5.5,0,0,TAU);x.fill()}
   x.fillStyle='rgba(0,0,0,.55)';x.fillRect(p*pw,0,1.5,128)}return ct(c)})},
 bark:()=>once('bark',()=>{const c=cvs(128,256),x=c.getContext('2d');x.fillStyle='#3b2819';x.fillRect(0,0,128,256);
  for(let i=0;i<70;i++){const px=rnd()*128;x.strokeStyle=rnd()<.5?'rgba(0,0,0,.35)':'rgba(120,90,60,.22)';x.lineWidth=1+rnd()*3;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+rr(-9,9),80,px+rr(-9,9),170,px+rr(-6,6),256);x.stroke()}
  for(let i=0;i<14;i++){const g=x.createRadialGradient(0,0,0,0,0,1);x.fillStyle='rgba(60,110,50,'+rr(.08,.2)+')';x.beginPath();x.ellipse(rnd()*128,rnd()*256,rr(6,18),rr(8,26),0,0,TAU);x.fill()}return ct(c)}),
 stone:(base,moss)=>{base=base||150;return once('stone'+base+(moss?1:0),()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#222';x.fillRect(0,0,128,128);
  for(let r=0;r<4;r++){let px=(r%2)*-16;while(px<128){const w=rr(26,42),v=base+rr(-26,26)|0;x.fillStyle=`rgb(${v},${v+3},${v+9})`;x.fillRect(px+1.5,r*32+1.5,w-3,29);
   for(let k=0;k<26;k++){x.fillStyle='rgba('+(rnd()<.5?'0,0,0':'255,255,255')+','+rr(.03,.09)+')';x.fillRect(px+rnd()*w,r*32+rnd()*30,rr(1,3),rr(1,3))}px+=w}}
  if(moss)for(let i=0;i<18;i++){x.fillStyle='rgba(50,110,60,'+rr(.12,.3)+')';x.beginPath();x.ellipse(rnd()*128,rnd()*128,rr(5,16),rr(4,10),0,0,TAU);x.fill()}return ct(c)})},
 shingle:(col)=>once('shingle'+col,()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#120a06';x.fillRect(0,0,128,128);
  for(let r=0;r<8;r++)for(let i=-1;i<7;i++){const px=i*22+(r%2)*11,v=rr(.7,1.15);x.fillStyle=col;x.globalAlpha=1;x.beginPath();x.moveTo(px,r*16);x.lineTo(px+21,r*16);x.lineTo(px+21,r*16+12);x.quadraticCurveTo(px+10.5,r*16+20,px,r*16+12);x.closePath();x.fill();x.fillStyle=`rgba(0,0,0,${(1-v)*.9})`;x.fill();x.strokeStyle='rgba(0,0,0,.45)';x.stroke()}return ct(c)}),
 fabric:(col,pat)=>once('fab'+col+pat,()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,128,128);
  x.strokeStyle='rgba(255,255,255,.06)';for(let i=-128;i<256;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i+128,128);x.stroke()}
  x.strokeStyle='rgba(0,0,0,.08)';for(let i=-128;i<256;i+=4){x.beginPath();x.moveTo(i+128,0);x.lineTo(i,128);x.stroke()}
  if(pat==='plaid'){x.fillStyle='rgba(255,230,160,.35)';for(let i=0;i<128;i+=32){x.fillRect(i,0,6,128);x.fillRect(0,i,128,6)}x.fillStyle='rgba(0,0,0,.25)';for(let i=16;i<128;i+=32){x.fillRect(i,0,10,128);x.fillRect(0,i,128,10)}}
  if(pat==='tuft'){x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(16+i*32,16+j*32,3,0,TAU);x.fill()}x.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<4;i++){x.beginPath();x.moveTo(16+i*32,0);x.lineTo(16+i*32,128);x.stroke()}}
  for(let i=0;i<300;i++){x.fillStyle='rgba(0,0,0,'+rr(.02,.06)+')';x.fillRect(rnd()*128,rnd()*128,2,2)}return ct(c)}),
 metal:(col)=>once('metal'+col,()=>{const c=cvs(128,256),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,128,256);
  for(let i=0;i<90;i++){x.strokeStyle='rgba('+(rnd()<.5?'255,255,255':'0,0,0')+','+rr(.02,.07)+')';x.beginPath();x.moveTo(rnd()*128,0);x.lineTo(rnd()*128,256);x.stroke()}
  for(let i=0;i<24;i++){x.fillStyle='rgba(120,60,20,'+rr(.08,.22)+')';x.beginPath();x.ellipse(rnd()*128,150+rnd()*106,rr(2,8),rr(3,12),0,0,TAU);x.fill()}
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;x.strokeRect(5,6,118,244);return ct(c)}),
 card:()=>once('card',()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#b98a52';x.fillRect(0,0,128,128);
  for(let i=0;i<120;i++){x.fillStyle='rgba('+(rnd()<.5?'0,0,0':'255,230,190')+','+rr(.03,.09)+')';x.fillRect(rnd()*128,rnd()*128,rr(2,14),1)}
  x.fillStyle='#d9c9a3';x.fillRect(56,0,16,128);x.fillStyle='#f0ece0';x.fillRect(12,70,34,26);x.fillStyle='#555';for(let i=0;i<3;i++)x.fillRect(16,76+i*7,26,2);
  x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,0,128,3);x.fillRect(0,125,128,3);return ct(c)}),
 books:()=>once('books',()=>{const c=cvs(512,320),x=c.getContext('2d');x.fillStyle='#1a0f06';x.fillRect(0,0,512,320);const cl=['#8b2a1e','#1f4e8c','#c79a2a','#2f7a4a','#6a3a9a','#9a9a9a','#7a3a1a','#223a5a','#a33a5a'];
  for(let r=0;r<5;r++){const by=r*64+58;for(let px=6;px<500;){if(rnd()<.07){px+=rr(14,34);continue}const w=rr(10,22),h=rr(34,54),lean=rnd()<.06;x.save();if(lean){x.translate(px,by);x.rotate(.22);x.translate(-px,-by)}
    x.fillStyle=cl[(rnd()*cl.length)|0];x.fillRect(px,by-h,w,h);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(px+w-3,by-h,3,h);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(px,by-h,2,h);
    x.fillStyle='rgba(230,200,110,.85)';x.fillRect(px+1,by-h+6,w-2,2);x.fillRect(px+1,by-6,w-2,2);if(rnd()<.5)x.fillRect(px+w/2-1,by-h*.6,2,h*.2);x.restore();px+=w+1}
   x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,by,512,8);if(r<4){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,by+8,512,6)}}
  for(let i=0;i<40;i++){x.fillStyle='rgba(200,200,200,'+rr(.03,.08)+')';x.fillRect(rnd()*512,rnd()*320,rr(10,40),1)}return ct(c)}),
 keys:()=>once('keys',()=>{const c=cvs(512,96),x=c.getContext('2d');x.fillStyle='#f4f0e6';x.fillRect(0,0,512,96);x.fillStyle='#666';for(let i=0;i<=22;i++)x.fillRect(i*512/22-1,0,2,96);
  x.fillStyle='#0d0d10';for(let i=0;i<22;i++){const o=i%7;if(o===2||o===6)continue;x.fillRect((i+1)*512/22-9,0,18,58)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,88,512,8);return ct(c)}),
 face:()=>once('face',()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#e9dcb4';x.beginPath();x.arc(64,64,62,0,TAU);x.fill();x.strokeStyle='#4a3010';x.lineWidth=5;x.stroke();
  x.fillStyle='#2a1a08';for(let i=0;i<12;i++){const a=i*TAU/12;x.fillRect(64+Math.cos(a)*50-2,64+Math.sin(a)*50-4,4,i%3?5:10)}
  x.strokeStyle='#111';x.lineWidth=4;x.beginPath();x.moveTo(64,64);x.lineTo(64+Math.cos(-1.4)*34,64+Math.sin(-1.4)*34);x.stroke();x.lineWidth=3;x.beginPath();x.moveTo(64,64);x.lineTo(64+Math.cos(1.1)*44,64+Math.sin(1.1)*44);x.stroke();
  for(let i=0;i<40;i++){x.fillStyle='rgba(80,50,10,'+rr(.04,.12)+')';x.beginPath();x.arc(rnd()*128,rnd()*128,rr(2,9),0,TAU);x.fill()}return ct(c)}),
 paint:()=>once('paint',()=>{const c=cvs(128,160),x=c.getContext('2d');let g=x.createLinearGradient(0,0,0,160);g.addColorStop(0,'#2a2418');g.addColorStop(1,'#120e08');x.fillStyle=g;x.fillRect(0,0,128,160);
  x.fillStyle='#1a1410';x.beginPath();x.ellipse(64,150,46,42,0,0,TAU);x.fill();x.fillStyle='#b9a98a';x.beginPath();x.ellipse(64,62,24,32,0,0,TAU);x.fill();
  x.fillStyle='#0a0806';x.beginPath();x.ellipse(53,56,6,8,0,0,TAU);x.ellipse(75,56,6,8,0,0,TAU);x.fill();x.fillStyle='#ff3a2a';x.fillRect(52,55,3,3);x.fillRect(74,55,3,3);
  x.strokeStyle='#0a0806';x.lineWidth=2.5;x.beginPath();x.moveTo(52,82);x.quadraticCurveTo(64,90,76,82);x.stroke();
  for(let i=0;i<60;i++){x.fillStyle='rgba(0,0,0,'+rr(.05,.18)+')';x.fillRect(rnd()*128,rnd()*160,rr(2,20),1)}return ct(c)}),
 shade:()=>once('shade',()=>{const c=cvs(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.55,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new TH.CanvasTexture(c)}),
 straw:()=>once('straw',()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#c9a64a';x.fillRect(0,0,128,128);for(let i=0;i<260;i++){x.strokeStyle=['#e8cf7a','#a8863a','#d8b858','#8a6c28'][i%4];x.lineWidth=1.2;const px=rnd()*128,py=rnd()*128;x.beginPath();x.moveTo(px,py);x.lineTo(px+rr(-14,14),py+rr(6,22));x.stroke()}return ct(c)}),
 canvas:()=>once('canvas',()=>{const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#8f3f2a';x.fillRect(0,0,128,128);for(let i=0;i<128;i+=32){x.fillStyle='rgba(230,210,170,.5)';x.fillRect(i,0,16,128)}
  for(let i=0;i<200;i++){x.fillStyle='rgba(0,0,0,'+rr(.03,.1)+')';x.fillRect(rnd()*128,rnd()*128,1,rr(3,14))}return ct(c)}),
 blade:()=>once('blade',()=>{const c=cvs(64,128),x=c.getContext('2d');for(let i=0;i<9;i++){const px=4+i*6.5+rnd()*3,hh=60+rnd()*66,l=rr(-12,12);x.strokeStyle=['#2d7a3d','#3d9a50','#1f5f30','#5ab36a'][i%4];x.lineWidth=3.2;x.beginPath();x.moveTo(px,128);x.quadraticCurveTo(px+l*.3,128-hh*.6,px+l,128-hh);x.stroke()}return new TH.CanvasTexture(c)}),
 petal:()=>once('petal',()=>{const c=cvs(64,128),x=c.getContext('2d');let g=x.createLinearGradient(0,0,64,0);g.addColorStop(0,'#1f6a35');g.addColorStop(.5,'#3fae5a');g.addColorStop(1,'#1f6a35');x.fillStyle=g;x.fillRect(0,0,64,128);x.strokeStyle='rgba(0,0,0,.3)';x.beginPath();x.moveTo(32,0);x.lineTo(32,128);x.stroke();for(let i=0;i<10;i++){x.beginPath();x.moveTo(32,i*12);x.lineTo(i%2?6:58,i*12+22);x.stroke()}return ct(c)})
};

/* ---------------- small building helpers ---------------- */
const add=(g,geo,m,x,y,z)=>{const o=new TH.Mesh(geo,m);o.position.set(x||0,y||0,z||0);g.add(o);return o};
const bx=(g,w,h,d,m,x,y,z)=>add(g,new TH.BoxGeometry(w,h,d),m,x,y,z);
const cy=(g,rt,rb,h,m,x,y,z,s)=>add(g,new TH.CylinderGeometry(rt,rb,h,s||12),m,x,y,z);
const sp=(g,r,m,x,y,z,sx,sy,sz,s)=>{const o=add(g,new TH.SphereGeometry(r,s||12,Math.max(6,(s||12)*.7|0)),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o};
const pv=(g,x,y,z,ry,rx,rz)=>{const o=new TH.Group();o.position.set(x||0,y||0,z||0);o.rotation.order='YXZ';o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o};
// position based noise (same value for duplicated vertices => no cracks)
const hn=(x,y,z,s)=>{const v=Math.sin(x*12.9898+y*78.233+z*37.719+s*4.1)*43758.5453;return v-Math.floor(v)};
// box with chamfered/rounded edges (soft cushions, mattresses, tubs ...)
function rb(g,w,h,d,r,m,x,y,z){const geo=new TH.BoxGeometry(w,h,d,4,4,4),p=geo.attributes.position,n=geo.attributes.normal,v=new TH.Vector3(),c=new TH.Vector3(),q=new TH.Vector3(),iw=w/2-r,ih=h/2-r,id=d/2-r;
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(Math.max(-iw,Math.min(iw,v.x)),Math.max(-ih,Math.min(ih,v.y)),Math.max(-id,Math.min(id,v.z)));q.copy(v).sub(c);if(q.lengthSq()>1e-9){q.normalize();n.setXYZ(i,q.x,q.y,q.z);v.copy(c).addScaledVector(q,r);p.setXYZ(i,v.x,v.y,v.z)}}
 return add(g,geo,m,x,y,z)}
// contact shadow blob
let SG=null,SHM=null;const shadow=(g,w,d,op,y)=>{SG=SG||new TH.PlaneGeometry(1,1);SHM=SHM||(()=>{const m=new TH.MeshBasicMaterial({map:T.shade(),transparent:true,depthWrite:false,opacity:.85});m.userData.sh=1;return m})();const m=new TH.Mesh(SG,SHM);m.rotation.x=-PI/2;m.position.y=y||.02;m.scale.set(w,d,1);g.add(m)};
const wood=(a,b)=>mp(T.wood(a,b)),dark=mc(0x2e1c0e),brass=mc(0xc9a24a,{shininess:70,specular:0x886622}),iron=mc(0x23242a,{shininess:30});
const glowOf=v=>(x,y,z,col,s,op)=>v.glow(x,y,z,col,s,op);

/* ======================= HOUSE FURNITURE (solid) ======================= */
const F={};
F.shelf=(g,w,h,v)=>{const wd=wood('#5a3a1e','#47301a'),bt=mp(T.books());
 [-1,1].forEach(s=>bx(g,.07,2.1,h,wd,s*(w/2-.035),1.05,0));bx(g,w,.14,h,dark,0,.07,0);bx(g,w+.08,.07,h+.08,dark,0,2.13,0);bx(g,w+.02,.05,h+.02,wd,0,2.07,0);bx(g,w-.1,2,.03,mc(0x1a1008),0,1.05,0);
 for(let i=0;i<6;i++)bx(g,w-.1,.04,h*.96,wd,0,.17+i*.38,0);
 [1,-1].forEach(s=>{const p=add(g,new TH.PlaneGeometry(w-.16,1.9),bt,0,1.14,s*(h/2-.16));if(s<0)p.rotation.y=PI;
  for(let k=0;k<5;k++){const r=rnd(),y0=.19+(r%1>.5?2:1)*0,yy=.19+((rnd()*5)|0)*.38,xx=rr(-w/2+.3,w/2-.3),zz=s*(h/2-.12);
   if(k%3===0)cy(g,.06,.06,.18,mc([0x3a6a8a,0x7a4a2a,0x5a7a3a][k%3]),xx,yy+.11,zz,8);else if(k%3===1)bx(g,.16,.1,.12,mc(0x8a6a3a),xx,yy+.07,zz);else sp(g,.07,mc(0xddd6c0),xx,yy+.09,zz,1,1.15,1,8)}});
 shadow(g,w*1.25,h*1.7,.7)};
F.table=(g,w,h,v)=>{const top=wood('#7a5230','#5c3c20');rb(g,w,.06,h,.02,top,0,.78,0);bx(g,w+.04,.03,h+.04,dark,0,.73,0);bx(g,w-.24,.1,h-.24,dark,0,.67,0);
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=a*(w/2-.1),z=b*(h/2-.1);cy(g,.05,.065,.62,wood('#4a2f18','#3a2210'),x,.38,z,10);sp(g,.075,dark,x,.62,z,1,.8,1,8);sp(g,.07,dark,x,.07,z,1.2,.6,1.2,8)});
 bx(g,w*.62,.012,h*.8,mp(T.fabric('#7b2a3d')),0,.812,0);cy(g,.12,.12,.014,mc(0xf2eee4,{shininess:60}),w*.2,.82,h*.12,16);cy(g,.1,.1,.014,mc(0xf2eee4,{shininess:60}),-w*.22,.82,-h*.15,16);
 cy(g,.05,.065,.04,brass,0,.84,0,10);cy(g,.012,.014,.16,brass,0,.9,0,6);cy(g,.026,.026,.2,mc(0xf6efd8),0,1.0,0,8);
 const fm=add(g,new TH.ConeGeometry(.035,.12,6),mb(0xffc357),0,1.16,0);fm.userData.keep=1;const gl=glowOf(v)(0,1.12,0,0xffb347,.8,.8);g.add(gl);
 if(v.tick)v.tick.push(t=>{fm.scale.set(1,.8+Math.sin(t*15+g.position.x)*.25,1);gl.material.opacity=.65+Math.sin(t*11+g.position.z)*.15});
 shadow(g,w*1.3,h*1.3,.65)};
F.sofa=(g,w,h,v)=>{const fb=mp(T.fabric('#8a2f4a','tuft')),fd=mp(T.fabric('#6a2038')),fs=mp(T.fabric('#9a3a58'));
 rb(g,w-.1,.32,h-.1,.05,fd,0,.3,0);rb(g,w,.5,.2,.07,fb,0,.66,-h/2+.12);
 [-1,1].forEach(s=>{const a=cy(g,.14,.14,h,fb,s*(w/2-.1),.5,0,14);a.rotation.x=PI/2;sp(g,.14,fb,s*(w/2-.1),.5,h/2,1,1,.6,10);sp(g,.14,fb,s*(w/2-.1),.5,-h/2,1,1,.6,10);bx(g,.2,.2,h-.2,fd,s*(w/2-.1),.3,0);cy(g,.04,.03,.1,wood('#3a2210'),s*(w/2-.15),.06,h/2-.12,8);cy(g,.04,.03,.1,wood('#3a2210'),s*(w/2-.15),.06,-h/2+.12,8)});
 [-1,1].forEach(s=>{rb(g,w/2-.3,.16,h-.34,.06,fs,s*(w/4-.02),.55,.07);const bk=rb(g,w/2-.3,.45,.16,.07,fs,s*(w/4-.02),.8,-h/2+.28);bk.rotation.x=-.22});
 shadow(g,w*1.25,h*1.4,.7)};
F.bed=(g,w,h,v)=>{const wd=wood('#6d4a2c','#573a20'),bl=mp(T.fabric('#5a3d9a','plaid')),wh=mp(T.fabric('#eeeae0'));
 bx(g,w,.26,h,wd,0,.32,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cy(g,.06,.07,.2,wd,a*(w/2-.08),.1,b*(h/2-.08),8));
 rb(g,w-.12,.22,h-.12,.06,wh,0,.55,0);rb(g,w*.62,.07,h-.05,.03,bl,w*.17,.68,0);[-1,1].forEach(s=>bx(g,w*.62,.34,.03,bl,w*.17,.52,s*(h/2-.03)));
 [-1,1].forEach(s=>sp(g,.28,wh,-w/2+.4,.74,s*h*.22,1,.4,.75,12));
 bx(g,.1,1.15,h,wd,-w/2+.05,.65,0);[-1,1].forEach(s=>{cy(g,.05,.05,1.25,wd,-w/2+.05,.65,s*(h/2-.05),8);sp(g,.07,brass,-w/2+.05,1.3,s*(h/2-.05),1,1,1,8);cy(g,.045,.045,.8,wd,w/2-.05,.4,s*(h/2-.05),8)});
 bx(g,.08,.55,h,wd,w/2-.04,.5,0);shadow(g,w*1.25,h*1.35,.7)};
F.piano=(g,w,h,v)=>{const bk=mc(0x0d0c12,{shininess:90,specular:0x666666}),kt=mp(T.keys());
 bx(g,w,1.1,h*.62,bk,0,.62,-h*.18);bx(g,w+.05,.06,h*.68,bk,0,1.2,-h*.18);bx(g,w*.92,.08,h*.34,bk,0,.8,h*.2);
 const k=add(g,new TH.PlaneGeometry(w*.86,h*.24),kt,0,.846,h*.2);k.rotation.x=-PI/2;
 [-1,1].forEach(s=>{bx(g,.07,.9,h*.34,bk,s*(w/2-.04),.5,h*.2);cy(g,.04,.04,.5,bk,s*(w/2-.1),.25,-h*.3,8)});bx(g,.07,.65,.07,bk,0,.35,h*.34);
 const ms=bx(g,w*.5,.3,.02,bk,0,1.4,-h*.12);ms.rotation.x=-.25;const sh=bx(g,w*.4,.24,.01,mc(0xf0ecdc),0,1.4,-h*.105);sh.rotation.x=-.25;
 cy(g,.02,.02,.22,brass,w*.15,.04,h*.34+.02,6);cy(g,.2,.2,.06,mc(0x5a1f1f),0,.5,h/2+.4,14);[[-1,-1],[1,-1],[0,1]].forEach(([a,b])=>cy(g,.02,.02,.48,bk,a*.13,.24,h/2+.4+b*.1,6));
 shadow(g,w*1.3,h*1.7,.7)};
F.tub=(g,w,h,v)=>{const en=mc(0xeef5f8,{shininess:80,specular:0x777777});rb(g,w,.55,h,.1,en,0,.33,0);bx(g,w+.04,.04,h+.04,en,0,.58,0);
 bx(g,w-.28,.02,h-.28,mc(0x7ec8e3,{transparent:true,opacity:.8,shininess:90,specular:0xaaddff}),0,.5,0);
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>sp(g,.07,brass,a*(w/2-.12),.06,b*(h/2-.1),1,1,1,8));
 cy(g,.02,.02,.32,brass,w/2-.1,.78,0,8);const sp2=cy(g,.014,.014,.16,brass,w/2-.18,.94,0,6);sp2.rotation.z=PI/2;[-1,1].forEach(s=>sp(g,.03,brass,w/2-.1,.66,s*.12,1,1,1,6));
 shadow(g,w*1.25,h*1.35,.6)};
F.counter=(g,w,h,v)=>{const cab=wood('#6a6e78','#585c66'),dr=mc(0x52565f),mb2=mc(0xdcdde2,{shininess:70,specular:0x777777});bx(g,w,.9,h,mc(0x4a4e58),0,.45,0);
 [1,-1].forEach(s=>{const n=Math.max(1,Math.round(w/.7)),dw=(w-.1)/n;for(let i=0;i<n;i++){const x=-w/2+.05+dw*(i+.5);bx(g,dw-.06,.74,.02,dr,x,.46,s*(h/2+.008));cy(g,.012,.012,.12,iron,x+dw*.3,.7,s*(h/2+.04),6).rotation.x=PI/2}}) ;
 bx(g,w+.06,.06,h+.06,mb2,0,.93,0);bx(g,.5,.025,h*.55,mc(0x9aa0aa,{shininess:80}),-w*.18,.955,0);cy(g,.015,.015,.28,iron,-w*.18,1.1,-h*.2,6);
 [[.3,.97],[.38,.95]].forEach(([x,y],i)=>cy(g,.04,.04,.2+i*.05,mc([0x4a8a5a,0x8a4a3a][i],{transparent:true,opacity:.85}),w*.3+x*.2,y+.1,h*.1,8));shadow(g,w*1.15,h*1.5,.6)};
F.crate=(g,w,h,v)=>{const wd=wood('#a0703d','#86582c'),fr=wood('#6a4724','#503319');bx(g,w,1.1,h,wd,0,.62,0);[.1,1.1].forEach(y=>bx(g,w+.04,.1,h+.04,fr,0,y+.03,0));
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(g,.1,1.2,.1,fr,a*(w/2),.62,b*(h/2)));
 [[1,w,0,0],[-1,w,0,0],[1,h,1,0],[-1,h,1,0]].forEach(([s,len,side])=>{const L=Math.hypot(len,1),d=bx(g,.08,L*.9,.025,fr,0,.62,0);if(side){d.position.x=s*(w/2+.014);d.rotation.set(0,PI/2,Math.atan2(len,1))}else{d.position.z=s*(h/2+.014);d.rotation.z=Math.atan2(len,1)}});
 bx(g,w-.04,.03,h-.04,wood('#8a5f32','#6a4724'),0,1.19,0);
 if(w>1)[0,1].forEach(i=>bx(g,.5,.05,.02,mc(0xd8c9a0),(i?.25:-.3)*w,.9,h/2+.03));shadow(g,w*1.2,h*1.35,.7)};
F.default=(g,w,h,v,col)=>{bx(g,w,1,h,mc(col||0x777777),0,.5,0);shadow(g,w*1.2,h*1.2,.6)};

/* ======================= HIDING SPOTS ======================= */
const H={};
H.locker=(g,w,h,v)=>{const mt=mp(T.metal('#5b7f93')),ml=mp(T.metal('#46687a')),ch=mc(0xd8dde2,{shininess:80,specular:0x999999}),cap=mc(0x32505e);
 bx(g,w,2,h,mt,0,1,0);bx(g,w+.04,.06,h+.04,cap,0,2.03,0);bx(g,w+.02,.1,h+.02,cap,0,.05,0);
 [-1,1].forEach((s,i)=>{const dx=-s*w*.24,pivot=pv(g,s*w/2,0,h/2+.01,i?s*.6:0);
  if(i)bx(g,w*.46,1.8,.01,mc(0x020304),s*w/2+dx,1.02,h/2+.006);
  bx(pivot,w*.46,1.82,.03,ml,dx,1.02,.015);for(let k=0;k<5;k++)bx(pivot,w*.3,.022,.01,mc(0x0a1218),dx,1.58+k*.07,.034);bx(pivot,.04,.14,.04,ch,dx-s*w*.18,1.0,.04);bx(pivot,w*.12,.08,.01,mc(0xe8d8a0),dx,1.4,.034)});
 shadow(g,w*1.2,h*1.5,.6)};
H.clock=(g,w,h,v)=>{const wd=wood('#4a2c16','#3a2010'),dk=mc(0x2f1a0c);bx(g,w*.95,.18,h*.9,dk,0,.09,0);bx(g,w*.8,1.5,h*.7,wd,0,.95,0);bx(g,w*.7,.7,.02,mc(0x120a05),0,.65,h*.36);
 bx(g,w*.9,.5,h*.78,wd,0,2.0,0);const arch=cy(g,w*.42,w*.42,h*.78,wd,0,2.25,0,16);arch.rotation.x=PI/2;arch.scale.set(1,1,1);bx(g,w,.08,h*.9,dk,0,1.76,0);bx(g,w,.1,h*.9,dk,0,2.5,0);
 const fc=add(g,new TH.CircleGeometry(.22,24),mp(T.face()),0,2.05,h*.39+.012);bx(g,.02,.02,.02,brass,0,2.05,h*.4+.02);
 const rim=add(g,new TH.TorusGeometry(.225,.018,6,24),brass,0,2.05,h*.39+.012);
 const pg=pv(g,0,1.45,h*.36),pr=cy(pg,.01,.01,.7,brass,0,-.35,.012,6),pd=cy(pg,.1,.1,.02,brass,0,-.62,.012,18);pd.rotation.x=PI/2;pg.userData.keep=1;pr.userData.keep=1;pd.userData.keep=1;
 if(v.tick)v.tick.push(t=>{pg.rotation.z=Math.sin(t*3.1+g.position.x)*.28});shadow(g,w*1.2,h*1.3,.6)};
H.sheet=(g,w,h,v)=>{const r=Math.min(w,h)*.5,pts=[];for(let i=0;i<=14;i++){const t=i/14;pts.push(new TH.Vector2(.03+Math.pow(t,.55)*r*1.15,.95*(1-t)))}
 const geo=new TH.LatheGeometry(pts,28),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),a=Math.atan2(z,x),f=1+Math.sin(a*6+y*4)*.07*(1-y)+Math.sin(a*11)*.03;p.setX(i,x*f);p.setZ(i,z*f);p.setY(i,y+Math.max(0,Math.sin(a*7)*.07*(1-y/.25)))}
 geo.computeVertexNormals();const m=add(g,geo,mc(0xe3e7f0,{side:TH.DoubleSide,emissive:0x151a28,shininess:6}),0,0,0);m.scale.set(w/(r*2.1),1.0,h/(r*2.1));
 for(let i=0;i<3;i++)cy(g,.03,.025,.4,wood('#3a2210'),(i-1)*w*.18,.15,h*.25,6).rotation.z=rr(-.2,.2);shadow(g,w*1.25,h*1.25,.55)};
H.boxes=(g,w,h,v)=>{const cm=mp(T.card());[[-.22,0,.1,.55,.5,.35,.2],[.2,0,-.1,.5,.4,.3,-.3],[-.02,.5,0,.45,.38,.28,.5]].forEach(([a,b,c,s,hh,dd,ry],i)=>{const k=rb(g,w*s*1.5,hh*1.35,h*s*1.5,.012,cm,a*w,b*1.3+hh*.67,c*h);k.rotation.y=ry});
 const o=pv(g,w*.28,.1,h*.28,.4);rb(o,.55,.4,.5,.01,cm,0,.2,0);[[0,.2,.3,-1.1],[0,-.2,.3,1.1]].forEach(([a,b,c,r],i)=>{const f=bx(o,.55,.02,.26,cm,0,.42,i?-.32:.32);f.rotation.x=i?-.9:.9});shadow(g,w*1.25,h*1.25,.6)};
H.wardrobe=(g,w,h,v)=>{const wd=wood('#6a4125','#573419'),pn=wood('#533219','#43270f'),dk2=mc(0x3f2412);
 bx(g,w,2.2,h,wd,0,1.2,0);bx(g,w+.08,.1,h+.06,dk2,0,.1,0);bx(g,w+.12,.1,h+.1,dk2,0,2.35,0);bx(g,w+.2,.08,h+.14,mc(0x2f1a0c),0,2.44,0);cy(g,.1,.1,.06,brass,0,2.55,0,10);[-1,1].forEach(s=>cy(g,.05,.04,.1,dk2,s*(w/2-.08),.04,h/2-.07,8));
 bx(g,w*.47,2.0,.01,mc(0x030303),-w*.25,1.2,h/2+.004);
 [-1,1].forEach((s,i)=>{const pivot=pv(g,s*(w/2-.02),0,h/2,i?0:s*.55),dx=-s*w*.24;bx(pivot,w*.47,2.0,.04,wd,dx,1.2,.02);bx(pivot,w*.34,1.2,.03,pn,dx,1.55,.05);bx(pivot,w*.34,.55,.03,pn,dx,.62,.05);bx(pivot,w*.4,.04,.03,dk2,dx,1.0,.05);
  sp(pivot,.035,brass,dx-s*w*.18,1.2,.07,1,1,1,8);add(pivot,new TH.TorusGeometry(.03,.007,5,10),brass,dx-s*w*.18,1.14,.07)});
 shadow(g,w*1.25,h*1.5,.65)};
H.curtain=(g,w,h,v)=>{const a=mp(T.fabric('#8a1530')),b=mp(T.fabric('#a82242')),n=Math.max(4,Math.round(w/.15));
 for(let i=0;i<n;i++){const x=-w/2+(i+.5)*w/n,z=Math.sin(i*1.9)*.05;cy(g,.085,.1+Math.abs(Math.sin(i))*.03,2.62,i%2?a:b,x,1.4,z,8)}
 const rod=cy(g,.025,.025,w+.3,brass,0,2.78,0,8);rod.rotation.z=PI/2;[-1,1].forEach(s=>sp(g,.06,brass,s*(w/2+.16),2.78,0,1,1,1,8));for(let i=0;i<n;i+=2)add(g,new TH.TorusGeometry(.05,.01,5,8),brass,-w/2+(i+.5)*w/n,2.78,0);
 bx(g,w*1.05,.12,h*.7,mc(0x5a0e20),0,.06,0);shadow(g,w*1.2,h*1.4,.5)};
H.plant=(g,w,h,v)=>{const pot=mc(0x9a5230),soil=mc(0x2a1a10),lf=[mp(T.petal(),{side:TH.DoubleSide}),mp(T.petal(),{side:TH.DoubleSide,color:0xb8e8b8}),mp(T.petal(),{side:TH.DoubleSide,color:0x9ad89a})];
 cy(g,.3,.22,.5,pot,0,.25,0,14);cy(g,.33,.3,.07,mc(0xb0623c),0,.53,0,14);cy(g,.28,.28,.02,soil,0,.5,0,12);
 for(let i=0;i<18;i++){const r=i%2,pvt=pv(g,0,.55+r*.2,0,i*2.4,-.45-(i%4)*.24),L=.55+rnd()*.5;add(pvt,new TH.PlaneGeometry(.3,L),lf[i%3],0,L/2,0)}
 shadow(g,w*1.3,h*1.3,.55)};
H.barrel=(g,w,h,v)=>{const r=w*.5,pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push(new TH.Vector2(r*(.88+.2*Math.sin(t*PI)),t*1.3))}
 const st=mp(T.wood('#7a4a24','#5f381a'),{side:TH.DoubleSide});add(g,new TH.LatheGeometry(pts,18),st,0,0,0);const lid=add(g,new TH.CircleGeometry(r*.88,18),mp(T.wood('#6a4020','#563018')),0,1.3,0);lid.rotation.x=-PI/2;
 [.22,.65,1.08].forEach(y=>{const rad=r*(.88+.2*Math.sin(y/1.3*PI))+.012;const t=add(g,new TH.TorusGeometry(rad,.02,6,22),iron,0,y,0);t.rotation.x=PI/2});shadow(g,w*1.3,h*1.3,.6)};


/* outdoor hiding spots */
H.bush=(g,w,h,v)=>{for(let i=0;i<16;i++){const a=rnd()*TAU,rd=Math.sqrt(rnd()),r=.38+rnd()*.34,X=Math.cos(a)*rd*(w/2-.4),Z=Math.sin(a)*rd*(h/2-.35),Y=.5+rnd()*.7;
  const geo=new TH.IcosahedronGeometry(r,1),p=geo.attributes.position;for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k),z=p.getZ(k),f=.85+hn(x,y,z,i)*.3;p.setXYZ(k,x*f,y*f,z*f)}geo.computeVertexNormals();
  add(g,geo,mc([0x2f7a45,0x3f8a4f,0x286a3a,0x1f5a30][i%4],{flatShading:true,shininess:2}),X,Y,Z)}
 for(let i=0;i<8;i++)sp(g,.05,mc(0xd8305a),rr(-w/2+.5,w/2-.5),.7+rnd()*.8,rr(-h/2+.4,h/2-.4)+(i%2?.35:-.35),1,1,1,6);shadow(g,w*1.3,h*1.4,.7)};
H.grass=(g,w,h,v)=>{const gm=mp(T.blade(),{transparent:true,alphaTest:.35,side:TH.DoubleSide,shininess:2});for(let c=0;c<3;c++)for(let j=0;j<4;j++){const p=add(g,new TH.PlaneGeometry(w*.7,2.1),gm,rr(-w*.25,w*.25),1.0,rr(-h*.25,h*.25));p.rotation.y=j*PI/4+c*.2}shadow(g,w*1.1,h*1.1,.5)};
H.log=(g,w,h,v)=>{const bk=mp(T.bark()),rg=mc(0xcaa06a);[[-.4,.4,0],[.4,.4,0],[0,1.0,0]].forEach(([a,b],i)=>{const L=w*(1-i*.08),c=cy(g,.46,.44,L,bk,0,b,a*.9,12);c.rotation.z=PI/2;
  [-1,1].forEach(s=>{const e=add(g,new TH.CircleGeometry(.4,12),rg,s*(L/2+.005),b,a*.9);e.rotation.y=s*PI/2;add(g,new TH.TorusGeometry(.2,.012,4,12),mc(0x8a6a3a),s*(L/2+.008),b,a*.9).rotation.y=PI/2})});
 sp(g,.45,mc(0x3f8a4f,{flatShading:true}),-w*.25,1.4,0,1.5,.35,1,7);[[.2,.6],[.3,.5]].forEach(([a,b],i)=>{cy(g,.02,.025,.12,mc(0xeadfc8),w*.3+i*.12,1.4,.1+i*.06,5);sp(g,.07,mc(0xd8503a),w*.3+i*.12,1.5,.1+i*.06,1,.5,1,6)});shadow(g,w*1.2,h*1.7,.65)};
H.haystack=(g,w,h,v)=>{const st=mp(T.straw(),{flatShading:true});const d=add(g,new TH.SphereGeometry(1,16,10,0,TAU,0,PI/2),st,0,.1,0);d.scale.set(w*.55,2.1,h*.55);cy(g,w*.55,w*.57,.3,st,0,.15,0,16);
 for(let i=0;i<10;i++){const a=i*.9;cy(g,.012,.012,.7,mc(0xe8cf7a),Math.cos(a)*w*.3,1.3+(i%3)*.15,Math.sin(a)*h*.3,4).rotation.set(rr(-.5,.5),0,rr(-.6,.6))}
 const pf=pv(g,w*.55,0,h*.3,.4,0,-.12);cy(pf,.02,.02,1.7,wood('#5a3a1e','#47301a'),0,.85,0,6);bx(pf,.3,.04,.04,iron,0,1.7,0);[-1,0,1].forEach(i=>cy(pf,.01,.01,.22,iron,i*.12,1.82,0,4));shadow(g,w*1.4,h*1.4,.65)};
H.tent=(g,w,h,v)=>{const tm=mp(T.canvas(),{flatShading:true});const t=add(g,new TH.ConeGeometry(w*.72,2.3,4),tm,0,1.15,0);t.rotation.y=PI/4;
 const fl=add(g,new TH.PlaneGeometry(.75,1.45),mc(0x0b0705,{side:TH.DoubleSide}),0,.74,h*.36+.04);fl.rotation.x=-.35;
 [-1,1].forEach(s=>{const fp=add(g,new TH.PlaneGeometry(.5,1.45),tm,s*.5,.74,h*.36+.07);fp.rotation.set(-.33,0,s*.45);fp.material=mp(T.canvas(),{side:TH.DoubleSide})});
 cy(g,.03,.03,.5,wood('#3a2a18','#2a1c0e'),0,2.4,0,6);[0,1,2,3].forEach(i=>{const a=i*PI/2+PI/4,X=Math.cos(a)*(w*.72+.55),Z=Math.sin(a)*(h*.72+.55);cy(g,.008,.008,Math.hypot(w*.72+.55,2),mc(0xcfc3a0),X*.5,1.0,Z*.5,3).rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8);cy(g,.02,.02,.2,wood('#3a2a18','#2a1c0e'),X,.05,Z,5)});
 sp(g,.25,mp(T.fabric('#6a5a40')),w*.55,.18,-h*.1,1.3,.6,.9,8);shadow(g,w*1.8,h*1.8,.7)};

/* ======================= OUTDOOR ======================= */
const O={};
O.rock=(g,w,h,v)=>{const rk=mc(0x6a727c,{flatShading:true,shininess:4}),mo=mc(0x3f6a45,{flatShading:true,shininess:2});
 [[0,.4,0,1],[.55,.25,.3,.5],[-.5,.2,-.3,.4]].forEach(([a,b,c,s],i)=>{const geo=new TH.IcosahedronGeometry(1,1),p=geo.attributes.position;for(let k=0;k<p.count;k++){const X=p.getX(k),Y=p.getY(k),Z=p.getZ(k),f=.9+hn(X,Y,Z,i)*.24;p.setXYZ(k,X*f,Y*f,Z*f)}geo.computeVertexNormals();
  const o=add(g,geo,i?mc(0x5c646e,{flatShading:true}):rk,a*w*.5,b*.8,c*h*.5);o.scale.set(w*.55*s,.7*s+.1,h*.55*s);o.rotation.y=i*1.3});
 const t=add(g,new TH.IcosahedronGeometry(.4,0),mo,-w*.1,.78,0);t.scale.set(w*.5,.18,h*.5);shadow(g,w*1.7,h*1.7,.7)};
O.grave=(g,w,h,x0,y0,v)=>{const st=mp(T.stone(150,1)),k=((x0*7+y0*13)|0)%3,mound=mc(0x2c2118,{flatShading:true});
 if(k===0){bx(g,w,.7,.2,st,0,.35,0);const c=cy(g,w/2,w/2,.2,st,0,.7,0,14);c.rotation.x=PI/2}
 else if(k===1){bx(g,.14,.95,.14,st,0,.48,0);bx(g,.55,.13,.14,st,0,.72,0);bx(g,w*.9,.18,.3,st,0,.09,0)}
 else{bx(g,w*.9,.62,.18,st,0,.31,0);const r=add(g,new TH.CylinderGeometry(.22,.22,.18,3),st,0,.72,0);r.rotation.x=PI/2;r.scale.set(1.3,1,.7)}
 sp(g,.5,mound,0,.05,h*.3,.55,.15,.9,8);bx(g,w*.55,.02,.03,mc(0x2a2a30),0,.52,.11);bx(g,w*.4,.02,.03,mc(0x2a2a30),0,.44,.11);
 if(k===2)for(let i=0;i<3;i++)cy(g,.01,.01,.22,mc(0x6a5a3a),-.15+i*.15,.12,h*.45,4);shadow(g,w*2,h*2.2,.65)};
O.tomb=(g,w,h,v)=>{const st=mp(T.stone(140,1)),stD=mc(0x59606a);bx(g,w,2,h,st,0,1,0);bx(g,w*1.15,.18,h*1.1,stD,0,.09,0);bx(g,w*1.15,.16,h*1.1,stD,0,2.0,0);
 const roof=new TH.CylinderGeometry(w*.65,w*.65,h*1.15,3);roof.scale(1,1,.5);const rf=add(g,roof,mp(T.stone(125,1)),0,2.4,0);rf.rotation.x=-PI/2;
 [-1,1].forEach(s=>{cy(g,.1,.12,1.85,stD,s*w*.33,1,h/2+.1,12);bx(g,.3,.1,.3,stD,s*w*.33,.05,h/2+.1);bx(g,.28,.1,.28,stD,s*w*.33,1.92,h/2+.1)});
 bx(g,w*.4,1.5,.05,mc(0x05060a),0,.85,h/2+.005);const arch=cy(g,w*.2,w*.2,.05,mc(0x05060a),0,1.6,h/2+.005,14);arch.rotation.x=PI/2;
 [0,1,2].forEach(i=>bx(g,w*.9-i*.08,.1,.3,stD,0,.04+i*.1-.0,h/2+.4-i*.1));
 bx(g,.08,.6,.08,stD,0,3.3,0);bx(g,.34,.08,.08,stD,0,3.45,0);shadow(g,w*1.6,h*1.5,.7)};
O.well=(g,w,h,v)=>{const st=mp(T.stone(130,1)),wd=wood('#4a2e1a','#3a2210');cy(g,.78,.82,.9,st,0,.45,0,16);cy(g,.82,.82,.1,mc(0x555d66),0,.95,0,16);cy(g,.55,.55,.02,mc(0x03060a),0,.97,0,16);
 [-1,1].forEach(s=>bx(g,.1,1.9,.1,wd,s*.72,1.4,0));bx(g,.14,.14,1.6,wd,0,2.2,0);const wn=cy(g,.08,.08,1.2,wd,0,1.9,0,8);wn.rotation.z=PI/2;
 const rf=new TH.CylinderGeometry(1.1,1.1,1.6,3);rf.scale(1,1,.55);const r2=add(g,rf,mp(T.shingle('#4a3020')),0,2.55,0);r2.rotation.x=-PI/2;
 cy(g,.012,.012,.7,mc(0x9a8a6a),0,1.55,0,4);cy(g,.1,.08,.14,wd,0,1.15,0,8);shadow(g,w*2,h*2,.7)};
O.cart=(g,w,h,v)=>{const wd=wood('#6a4526','#523417'),dk2=wood('#3d2812','#2e1c0a');const L=w*.78,D=h*.72;
 bx(g,L,.1,D,wd,-.15,.7,0);[-1,1].forEach(s=>{bx(g,L,.34,.06,wd,-.15,.9,s*D/2);bx(g,.06,.34,D,wd,-.15-L/2,.9,0);});bx(g,L,.08,.08,dk2,-.15,.62,D/2-.1);bx(g,L,.08,.08,dk2,-.15,.62,-D/2+.1);
 const ax=cy(g,.045,.045,h+.1,dk2,-.2,.5,0,8);ax.rotation.x=PI/2;
 [-1,1].forEach(s=>{const wg=pv(g,-.2,.5,s*(D/2+.12));add(wg,new TH.TorusGeometry(.5,.05,8,28),wd,0,0,0);add(wg,new TH.TorusGeometry(.51,.012,5,28),iron,0,0,.05);cy(wg,.09,.09,.2,dk2,0,0,0,10).rotation.x=PI/2;for(let i=0;i<4;i++)bx(wg,.96,.045,.05,wd,0,0,0).rotation.z=i*PI/4});
 [-1,1].forEach(s=>{const sh=bx(g,1.3,.07,.07,dk2,w/2-.1,.55,s*D*.38);sh.rotation.z=.12});
 [[.1,.95,.15,.55],[-.5,.9,-.2,.45]].forEach(([a,b,c,r],i)=>sp(g,r*.7,mc(i?0x9a8a64:0xb09a70),a-.2,b,c,1,.8,.85,9));
 cy(g,.07,.06,.16,mc(0x222222),-.15-L/2,1.25,D/2-.05,6);g.add(glowOf(v)(-.15-L/2,1.25,D/2-.05,0xffb347,1.2,.75));cy(g,.012,.012,.3,iron,-.15-L/2,1.4,D/2-.05,4);
 shadow(g,w*1.5,h*1.7,.7)};
O.cabin=(g,w,h,v)=>{const lg=mp(T.bark()),lgD=mc(0x4a301a),sh=mp(T.shingle('#5a3a22')),wd=wood('#5a3a20','#47301a'),FZ=h/2+.125,WT=2.55;
 const r=.23;for(let c=0;c<6;c++){const y=.22+c*.42;[-1,1].forEach(s=>{const a=cy(g,r,r,w+.3,lg,0,y,s*(h/2-r*.5),9);a.rotation.z=PI/2;const b=cy(g,r,r,h+.3,lg,s*(w/2-r*.5),y+.2,0,9);b.rotation.x=PI/2})}
 bx(g,w-.4,WT,h-.4,lgD,0,WT/2,0);
 const ang=.62,sw=h/2+.55,roofL=sw/Math.cos(ang),rise=sw*Math.tan(ang);
 [-1,1].forEach(s=>{const rf=bx(g,w+.8,.12,roofL,sh,0,WT+rise/2,s*sw/2);rf.rotation.x=-s*ang});
 const R=(h+.3)/1.73,k=((h/2+.15)*Math.tan(ang))/(1.5*R);[-1,1].forEach(s=>{const gg=add(g,new TH.CylinderGeometry(R,R,.16,3),lgD,s*(w/2-.1),WT+.5*R*k,0);gg.geometry.scale(1,1,k);gg.rotation.order='YXZ';gg.rotation.set(-PI/2,PI/2,0)});
 bx(g,w+.9,.14,.14,lgD,0,WT+rise+.04,0);
 const ch=mp(T.stone(120,1));bx(g,.6,2.4,.6,ch,w*.32,3.6,-h*.2);bx(g,.72,.1,.72,mc(0x3a3e46),w*.32,4.85,-h*.2);
 bx(g,.9,1.9,.06,mp(T.wood('#3a2410','#2c1a08')),0,.95,FZ+.03);sp(g,.04,brass,.3,.95,FZ+.09,1,1,1,6);[-1,1].forEach(s=>bx(g,.1,2.05,.1,wd,s*.52,1.02,FZ+.06));bx(g,1.25,.12,.12,wd,0,2.05,FZ+.06);
 [0,1,2].forEach(i=>bx(g,1.5,.14,.4,wd,0,.07+i*.14*0+i*.0,FZ+.35-i*.12).position.y=.07+i*.14);
 [-1,1].forEach(s=>{const x=s*w*.3;bx(g,.9,.75,.05,mc(0x2a1a0c),x,1.6,FZ+.02);bx(g,.78,.63,.03,mb(0xffc857),x,1.6,FZ+.045);bx(g,.78,.04,.05,wd,x,1.6,FZ+.06);bx(g,.04,.63,.05,wd,x,1.6,FZ+.06);bx(g,1.0,.08,.14,wd,x,1.2,FZ+.08)});
 g.add(glowOf(v)(0,1.5,FZ+.5,0xffc857,3.4,.45));g.add(glowOf(v)(-w*.3,1.6,FZ+.6,0xffc857,1.6,.5));g.add(glowOf(v)(w*.3,1.6,FZ+.6,0xffc857,1.6,.5));shadow(g,w*1.5,h*1.5,.75)};
O.pond=(g,w,h,v)=>{const wtr=new TH.Mesh(new TH.CircleGeometry(1,40),new TH.MeshPhongMaterial({color:0x2a6f86,transparent:true,opacity:.55,shininess:90,specular:0x88ccff,emissive:0x0a2a3a}));wtr.position.y=.05;wtr.rotation.x=-PI/2;wtr.scale.set(w/2,h/2,1);wtr.userData.keep=1;g.add(wtr);v.water=wtr;
 const rk=mc(0x6a727c,{flatShading:true});for(let i=0;i<26;i++){const a=i/26*TAU,s=rr(.18,.38),o=add(g,new TH.IcosahedronGeometry(1,0),rk,Math.cos(a)*(w/2+.1),s*.3,Math.sin(a)*(h/2+.1));o.scale.set(s,s*.7,s)}
 for(let i=0;i<14;i++){const a=rr(0,TAU),rx=w/2*rr(.7,1.02),rz=h/2*rr(.7,1.02),x=Math.cos(a)*rx,z=Math.sin(a)*rz;cy(g,.012,.012,rr(.9,1.4),mc(0x4a6a3a),x,.6,z,4);cy(g,.035,.035,.22,mc(0x4a2e1a),x,1.25,z,5)}
 for(let i=0;i<7;i++){const a=rr(0,TAU),r=rr(.1,.8),l=add(g,new TH.CircleGeometry(.28,10),mc(0x2f7a45,{side:TH.DoubleSide}),Math.cos(a)*w/2*r,.07,Math.sin(a)*h/2*r);l.rotation.x=-PI/2}};
// trees --------------------------------------------------------------------------------------------------------------------------------------
function tree(g,s,vv,x,y){const hh=2.6*s,bk=mp(T.bark()),fol=[0x1f5a45,0x285f3c,0x2a4f5e,0x3a5a2c];
 const dead=vv===3&&((x*.7+y*.3)|0)%2===0,col=fol[vv%4],tr=cy(g,.17*s,.36*s,hh,bk,0,hh/2,0,10);
 for(let i=0;i<5;i++){const a=i*TAU/5+rnd(),rt=add(g,new TH.ConeGeometry(.12*s,.7*s,5),bk,Math.cos(a)*.3*s,.18*s,Math.sin(a)*.3*s);rt.rotation.z=Math.cos(a)*.9;rt.rotation.x=-Math.sin(a)*.9}
 if(dead){for(let i=0;i<6;i++){const a=i*1.1+rnd(),py=pv(g,0,hh*(.45+i*.09),0,a,0,.7+rnd()*.5),L=1.0+rnd()*1.1;cy(py,.025*s,.07*s,L,bk,0,L/2,0,5);const q=pv(py,0,L*.7,0,0,0,rr(-.8,.8));cy(q,.015,.04*s,L*.5,bk,0,L*.25,0,4)}cy(g,.04,.17*s,1.4*s,bk,0,hh+.6*s,0,6).rotation.z=.12;return}
 if(vv<2){const mat=mc(col,{flatShading:true,shininess:2});for(let i=0;i<5;i++){const r=(1.55-i*.28)*s,c=add(g,new TH.ConeGeometry(r,1.5*s,9),mat,0,hh*.62+i*.85*s,0);c.rotation.y=rnd()*3;c.scale.x=1+rnd()*.12;const sk=add(g,new TH.CylinderGeometry(r*.55,r,.18*s,9),mc(col-0x020402,{flatShading:true}),0,hh*.62+i*.85*s-.55*s,0)}}
 else{[[0,hh+.9*s,0,1.3],[.75,hh+.3*s,.4,.95],[-.7,hh+.45*s,-.35,1.05],[.2,hh+1.6*s,-.2,.8],[-.3,hh+.2*s,.7,.85],[.35,hh+.5*s,-.75,.8]].forEach(([a,b,c,r],i)=>{const geo=new TH.IcosahedronGeometry(r*s,1),p=geo.attributes.position;for(let k=0;k<p.count;k++){const X=p.getX(k),Y=p.getY(k),Z=p.getZ(k),f=.86+hn(X,Y,Z,i+x)*.28;p.setXYZ(k,X*f,Y*f,Z*f)}geo.computeVertexNormals();
   add(g,geo,mc(i%2?col:col+0x0a1408,{flatShading:true,shininess:2}),a*s,b,c*s)});
  [0,1].forEach(i=>{const a=i*PI+rnd()*.5,py=pv(g,0,hh*.8,0,a,0,.9);cy(py,.04*s,.1*s,1.1*s,bk,0,.55*s,0,5)})}}

/* ================= public api ================= */
const API={tex:T};
API.furn=(v,t,g,w,h,col)=>{(F[t]||F.default)(g,w,h,v,col);return true};
API.hide=(v,t,g,w,h,x,y)=>{const f=H[t]||O[t];if(!f)return false;f(g,w,h,v);return true};
API.out=(v,t,g,w,h,x,y)=>{if(t==='grave'){O.grave(g,w,h,x,y,v);return true}if(!O[t])return false;O[t](g,w,h,v);return true};
API.tree=(v,g,s,vv,x,y)=>{tree(g,s,vv,x,y);shadow(g,2.6*s,2.6*s,.6)};
API.shadow=shadow;
// extra world dressing ---------------------------------------------------------------------------------
API.walls=(v,m,world,U)=>{ // skirting + crown moulding + spooky portraits on indoor walls
 const g=new TH.Group(),sk=mc(0x24162c),cr=mc(0x2c1c36),gold=mc(0xc9a24a,{shininess:60}),pt=mp(T.paint());let n=0;
 m.walls.forEach(([x,y,w,h],i)=>{const wm=w/U,hm=h/U,cx=(x+w/2)/U,cz=(y+h/2)/U;bx(g,wm+.03,.16,hm+.03,sk,cx,.08,cz);bx(g,wm+.05,.1,hm+.05,cr,cx,3.15,cz);
  const horiz=wm>hm,len=horiz?wm:hm;if(len>4.4&&n<26&&(i%2===0)){const s=(i%4<2?1:-1),off=(i*37%5-2)*.5,fw=.78,fh=.98;
   const px=horiz?cx+off:cx+s*(wm/2+.02),pz=horiz?cz+s*(hm/2+.02):cz+off,ry=horiz?(s>0?0:PI):(s>0?PI/2:-PI/2);
   const fr=pv(g,px,2.55,pz,ry);bx(fr,fw+.1,fh+.1,.04,gold,0,0,0);const pl=add(fr,new TH.PlaneGeometry(fw,fh),pt,0,0,.025);n++}});
 world.add(g)};
API.ground=(v,m,world,U)=>{ // grass tufts, glowing mushrooms, pebbles scattered on outdoor maps
 const g=new TH.Group(),gt=mp(T.blade(),{transparent:true,alphaTest:.35,side:TH.DoubleSide,color:0xaabb99}),free=(x,y,r)=>!window.GTMAP.hit(m,{x,y},r);
 for(let i=0,k=0;i<420&&k<2000;k++){const x=60+rnd()*(m.W-120),y=60+rnd()*(m.H-120);if(!free(x,y,26))continue;i++;const hh=rr(.28,.55);for(let j=0;j<3;j++){const p=add(g,new TH.PlaneGeometry(.4,hh),gt,x/U,hh/2,y/U);p.rotation.y=j*PI/3+rnd()}}
 const mus=mc(0xcfe8ff,{emissive:0x2a6a8a}),cap=mc(0x35e0c0,{emissive:0x0f7a68,flatShading:true});
 for(let i=0,k=0;i<46&&k<900;k++){const x=70+rnd()*(m.W-140),y=70+rnd()*(m.H-140);if(!free(x,y,24))continue;i++;const s=rr(.6,1.3),X=x/U,Z=y/U;cy(g,.02*s,.03*s,.14*s,mus,X,.07*s,Z,5);const c=add(g,new TH.SphereGeometry(.07*s,7,4,0,TAU,0,PI/2),cap,X,.14*s,Z);if(i%4===0)g.add(v.glow(X,.18,Z,0x35e0c0,.55,.4))}
 const rk=mc(0x5a626c,{flatShading:true});for(let i=0,k=0;i<90&&k<900;k++){const x=60+rnd()*(m.W-120),y=60+rnd()*(m.H-120);if(!free(x,y,20))continue;i++;const s=rr(.05,.14),o=add(g,new TH.IcosahedronGeometry(1,0),rk,x/U,s*.4,y/U);o.scale.set(s,s*.6,s*rr(.8,1.3));o.rotation.y=rnd()*3}
 world.add(g)};

/* ---- bake: merge every static mesh in the world that shares a material -> a handful of draw calls ---- */
API.bake=(world)=>{world.updateMatrixWorld(true);const buckets=new Map(),remove=[];
 const keep=o=>{for(let p=o;p&&p!==world;p=p.parent)if(p.userData&&p.userData.keep)return true;return false};
 world.traverse(o=>{if(!o.isMesh||keep(o)||Array.isArray(o.material)||!o.geometry||!o.geometry.attributes.position)return;if(o.material.map&&o.material.map.repeat&&(o.material.map.repeat.x!==1||o.material.map.repeat.y!==1))return;
  let b=buckets.get(o.material);if(!b)buckets.set(o.material,b=[]);b.push(o);remove.push(o)});
 remove.forEach(o=>{o.parent.remove(o)});
 buckets.forEach((list,mat)=>{let nv=0,ni=0;list.forEach(o=>{const g=o.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count});
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),big=nv>65535,idx=big?new Uint32Array(ni):new Uint16Array(ni),v3=new TH.Vector3(),nm=new TH.Matrix3();let vo=0,io=0;
  list.forEach(o=>{const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,M=o.matrixWorld;nm.getNormalMatrix(M);
   for(let i=0;i<p.count;i++){v3.fromBufferAttribute(p,i).applyMatrix4(M);pos[(vo+i)*3]=v3.x;pos[(vo+i)*3+1]=v3.y;pos[(vo+i)*3+2]=v3.z;
    if(n){v3.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor[(vo+i)*3]=v3.x;nor[(vo+i)*3+1]=v3.y;nor[(vo+i)*3+2]=v3.z}else nor[(vo+i)*3+1]=1;
    if(u){uv[(vo+i)*2]=u.getX(i);uv[(vo+i)*2+1]=u.getY(i)}}
   if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count}else{for(let i=0;i<p.count;i++)idx[io+i]=vo+i;io+=p.count}vo+=p.count});
  const geo=new TH.BufferGeometry();geo.setAttribute('position',new TH.BufferAttribute(pos,3));geo.setAttribute('normal',new TH.BufferAttribute(nor,3));geo.setAttribute('uv',new TH.BufferAttribute(uv,2));geo.setIndex(new TH.BufferAttribute(idx,1));geo.computeBoundingSphere();
  const mesh=new TH.Mesh(geo,mat);if(mat.userData&&mat.userData.sh)mesh.renderOrder=-5;world.add(mesh)})};
window.PROPS=API;
})();
