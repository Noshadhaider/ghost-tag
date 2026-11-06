// Map sanity: spawns/hide spots are free + reachable (flood fill on a 20px grid, same clearance bots use). node test/maps.js
const GM=require('../public/map.js');let fails=0;
const ok=(c,m)=>{if(!c){fails++;console.log('FAIL '+m)}};
for(const M of Object.values(GM.MAPS)){
 const C=20,cols=Math.ceil(M.W/C),rows=Math.ceil(M.H/C),blk=new Uint8Array(cols*rows);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)blk[j*cols+i]=GM.hit(M,{x:i*C+C/2,y:j*C+C/2},GM.R+5)?1:0;
 const s=M.spawns[0],seen=new Uint8Array(cols*rows),q=[(s[1]/C|0)*cols+(s[0]/C|0)];seen[q[0]]=1;
 for(let h=0;h<q.length;h++){const c=q[h],ci=c%cols,cj=c/cols|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=cols||nj>=rows)continue;const n=nj*cols+ni;if(seen[n]||blk[n])continue;seen[n]=1;q.push(n)}}
 const reach=(x,y)=>seen[(y/C|0)*cols+(x/C|0)];
 M.spawns.forEach((p,i)=>{ok(!GM.hit(M,{x:p[0],y:p[1]},GM.R+20),M.id+' spawn '+i+' free');ok(reach(p[0],p[1]),M.id+' spawn '+i+' reachable')});
 let badH=[];M.hide.forEach(h=>{const cx=h[1]+h[3]/2,cy=h[2]+h[4]/2;
  // a hide spot is usable if some free+reachable point lies inside its zone
  let found=false;for(let x=h[1]+8;x<h[1]+h[3]-8&&!found;x+=10)for(let y=h[2]+8;y<h[2]+h[4]-8;y+=10)if(!GM.hit(M,{x,y})&&reach(x,y)){found=true;break}
  if(!found)badH.push(h[0]+'@'+h[1]+','+h[2])});
 ok(!badH.length,M.id+' hide spots not usable: '+badH.join(' '));
 const open=[...seen].filter(v=>v).length,free=[...blk].filter(v=>!v).length;
 ok(open/free>.97,M.id+' walkable area connected ('+(100*open/free).toFixed(1)+'%)');
 console.log(M.id.padEnd(10),M.W+'x'+M.H,'hide spots',M.hide.length,'(low '+M.hide.filter(h=>GM.LOW[h[0]]).length+')','connected '+(100*open/free).toFixed(1)+'%');
 // crouch rule
 const low=M.hide.find(h=>GM.LOW[h[0]]),tall=M.hide.find(h=>!GM.LOW[h[0]]);
 if(low){const p={x:low[1]+low[3]/2,y:low[2]+low[4]/2,cr:false};ok(!GM.inHide(M,p),M.id+' low cover needs crouch');p.cr=true;ok(GM.inHide(M,p),M.id+' crouch hides in low cover')}
 if(tall){const p={x:tall[1]+tall[3]/2,y:tall[2]+tall[4]/2,cr:false};ok(GM.inHide(M,p),M.id+' tall cover hides standing')}
}
console.log(fails?fails+' FAILED':'MAPS OK');process.exit(fails?1:0);
