// Smoke test: runs View3D.setMap() for every map + a few frames (incl. a hit-shake) against a universal THREE stub.
const fs=require('fs'),vm=require('vm'),GM=require('../public/map.js');
const mk=()=>new Proxy(function(){},{get:(t,k)=>{if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k==='length')return 0;if(k in t&&k!=='name'&&k!=='prototype')return t[k];return t[k]=mk()},set:(t,k,v)=>(t[k]=v,true),apply:()=>mk(),construct:()=>mk()});
const TH=new Proxy({RepeatWrapping:1,DoubleSide:2,AdditiveBlending:2},{get:(t,k)=>k in t?t[k]:(t[k]=mk())});
const ctx=mk(),canvas={width:1,height:1,style:{},getContext:()=>ctx,appendChild(){}};
const el=()=>({style:{},appendChild(){},classList:{add(){},remove(){}},id:''});
const doc={createElement:()=>canvas,getElementById:()=>el()};
const win={GTMAP:GM};let raf=null;
const ART={maps:(m)=>[canvas,canvas],mkc:()=>canvas};
const sb={THREE:TH,document:doc,window:win,Math,JSON,Float32Array,Uint16Array,Uint32Array,console,navigator:{userAgent:'x'},performance,innerWidth:800,innerHeight:400,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(f){raf=f},
 ART,GTMAP:GM,RO:{},S:{id:'me'},look:{yaw:0,pitch:0},inp:{c:0},heat:0,readInput:()=>({x:0,y:0,r:0})};
sb.window=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(__dirname+'/../public/props3d.js','utf8'),sb);
vm.runInContext(fs.readFileSync(__dirname+'/../public/view3d.js','utf8'),sb);
let fails=0;
for(const id of Object.keys(GM.MAPS)){try{const M=GM.MAPS[id];sb.M=M;
 const V=new sb.View3D(M);const spawn=M.spawns[1];
 sb.ST={n:1,ph:'play',t:100,ps:[{i:'me',x:spawn[0],y:spawn[1],g:0,s:0,f:1,m:0,d:0,a:0,hd:0,cr:0,st:100,cd:0,nd:1,h:0,ms:125,hp:3,iv:0},{i:'g1',x:spawn[0]+90,y:spawn[1],g:1,s:0,f:1,m:1,d:0,a:3,hd:0,cr:0}]};
 let t=1000;for(let k=0;k<5;k++)V.frame(t+=33);V.hit(1.4);for(let k=0;k<90;k++)V.frame(t+=33);
 if(!(V.hs===0))throw new Error('hit shake should decay to 0, is '+V.hs);
 V.setMap(M);console.log('PASS '+id+': setMap + frames + hit-shake decay');
}catch(e){console.log('FAIL '+id+': '+e.stack.split('\n').slice(0,3).join(' | '));fails++}}
console.log(fails?fails+' FAILED':'VIEW SMOKE OK');process.exit(fails?1:0);
