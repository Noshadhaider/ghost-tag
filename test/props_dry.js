// Dry-run of public/props3d.js against a tiny THREE mock (no browser/GPU): catches typos, bad calls and bake() problems.
const fs=require('fs'),vm=require('vm');
class V3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){return this.set(v.x,v.y,v.z)}clone(){return new V3(this.x,this.y,this.z)}sub(v){return this.set(this.x-v.x,this.y-v.y,this.z-v.z)}
 normalize(){return this}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}addScaledVector(v,s){return this.set(this.x+v.x*s,this.y+v.y*s,this.z+v.z*s)}fromBufferAttribute(a,i){return this.set(a.getX(i),a.getY(i),a.getZ(i))}applyMatrix4(){return this}applyMatrix3(){return this}}
class Euler{constructor(){this.x=this.y=this.z=0;this.order='XYZ'}set(x,y,z){this.x=x;this.y=y;this.z=z}}
class O3{constructor(){this.position=new V3;this.rotation=new Euler;this.scale=new V3(1,1,1);this.children=[];this.parent=null;this.userData={};this.matrixWorld={}}
 add(o){this.children.push(o);o.parent=this;return this}remove(o){this.children=this.children.filter(c=>c!==o);o.parent=null}traverse(f){f(this);this.children.slice().forEach(c=>c.traverse(f))}updateMatrixWorld(){}}
class Mesh extends O3{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;this.renderOrder=0}}
class Sprite extends O3{constructor(m){super();this.material=m}}
class BA{constructor(a,n){this.array=a;this.itemSize=n;this.count=a.length/n}getX(i){return this.array[i*this.itemSize]}getY(i){return this.array[i*this.itemSize+1]}getZ(i){return this.array[i*this.itemSize+2]}
 setX(i,x){this.array[i*this.itemSize]=x}setY(i,y){this.array[i*this.itemSize+1]=y}setZ(i,z){this.array[i*this.itemSize+2]=z}setXYZ(i,x,y,z){this.array.set([x,y,z],i*3)}}
class BG{constructor(n){this.attributes={};this.index=null;if(n){this.attributes.position=new BA(new Float32Array(n*3).map(()=>Math.random()),3);this.attributes.normal=new BA(new Float32Array(n*3).fill(.5),3);this.attributes.uv=new BA(new Float32Array(n*2),2);this.index=new BA(Uint16Array.from({length:n},(_,i)=>i),1)}}
 setAttribute(k,a){this.attributes[k]=a}setIndex(a){this.index=a}computeVertexNormals(){}computeBoundingSphere(){}scale(){return this}dispose(){}getIndex(){return this.index}}
BA.prototype.getX=BA.prototype.getX;
const geo=()=>class extends BG{constructor(){super(24)}};
let uid=0;class Mat{constructor(p){Object.assign(this,p||{});this.userData={};this.uuid='m'+(uid++)}}
class Tex{constructor(){this.repeat={x:1,y:1,set(a,b){this.x=a;this.y=b}};this.uuid='t'+(uid++)}}
const TH={Vector3:V3,Vector2:class{constructor(x,y){this.x=x;this.y=y}},Matrix3:class{getNormalMatrix(){return this}},Group:class extends O3{},Mesh,Sprite,BufferGeometry:BG,BufferAttribute:BA,
 Float32BufferAttribute:BA,CanvasTexture:Tex,MeshPhongMaterial:Mat,MeshBasicMaterial:Mat,RepeatWrapping:1,DoubleSide:2,AdditiveBlending:2,anisotropy:4};
['Box','Cylinder','Sphere','Cone','Plane','Circle','Torus','Icosahedron','Lathe'].forEach(n=>TH[n+'Geometry']=geo());
const ctx=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}),set:(t,k,v)=>(t[k]=v,true)});
const doc={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
const win={GTMAP:{hit:()=>false}};
const sb={THREE:TH,document:doc,window:win,Math,JSON,Float32Array,Uint16Array,Uint32Array,console};
vm.createContext(sb);vm.runInContext(fs.readFileSync(__dirname+'/../public/props3d.js','utf8'),sb);
const P=win.PROPS;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const v={glow:()=>new Sprite(new Mat),tick:[],flames:[],water:null};
const world=new TH.Group();let made=0;
const tryAll=(label,fn)=>{try{fn();made++}catch(e){ok(false,label+' -> '+e.message+'\n'+(e.stack||'').split('\n')[1])}};
['shelf','table','sofa','bed','piano','tub','counter','crate','weird'].forEach(t=>tryAll('furn '+t,()=>{const g=new TH.Group();P.furn(v,t,g,2.4,.8,0x777777);world.add(g)}));
['locker','clock','sheet','boxes','wardrobe','curtain','plant','barrel','bush','grass','log','haystack','tent','tomb'].forEach(t=>tryAll('hide '+t,()=>{const g=new TH.Group();const r=P.hide(v,t,g,1.6,1.2,100,100);if(!r)throw new Error('not handled');world.add(g)}));
['rock','grave','pond','well','cart','cabin','tomb'].forEach(t=>tryAll('out '+t,()=>{const g=new TH.Group();const r=P.out(v,t,g,3,2,100,100);if(!r)throw new Error('not handled');world.add(g)}));
for(let vv=0;vv<4;vv++)tryAll('tree variant '+vv,()=>{const g=new TH.Group();P.tree(v,g,1.1,vv,100+vv*50,200);world.add(g)});
tryAll('walls',()=>P.walls(v,{walls:[[0,0,2700,24],[0,0,24,1800],[300,300,600,24],[900,100,24,500]]},world,50));
tryAll('ground',()=>P.ground(v,{W:2800,H:1800,sol:[]},world,50));
ok(made>=36,'all builders ran ('+made+' ok)');
let before=0;world.traverse(o=>{if(o.isMesh)before++});
tryAll('bake',()=>P.bake(world));let after=0,tot=0;world.traverse(o=>{if(o.isMesh){after++;tot+=o.geometry.attributes.position.count}});
console.log('  meshes before bake: '+before+'  after: '+after+'  vertices: '+tot);
ok(after>0&&after<before/4,'bake merges meshes by material ('+before+' -> '+after+')');
console.log(fails?'\n'+fails+' FAILED':'\nPROPS DRY RUN OK');process.exit(fails?1:0);
