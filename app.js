'use strict';
const $=id=>document.getElementById(id);
const state={mass:5,force:10,time:0,running:false,mode:'demo',tracked:false,object:'car'};
const acceleration=()=>state.force/state.mass;
const distance=()=>0.5*acceleration()*state.time**2;
let scene,marker,mover,arStarting=false;
function reset(){state.time=0;state.running=false;$('play').textContent='ابدأ الحركة';update();}
function update(){ $('massOut').textContent=state.mass+' كجم';$('forceOut').textContent=state.force+' نيوتن';$('acc').textContent=acceleration().toFixed(2)+' م/ث²';$('equation').textContent=`${state.force} ÷ ${state.mass} = ${acceleration().toFixed(2)}`;$('time').textContent=state.time.toFixed(2)+' ث';$('speed').textContent=(acceleration()*state.time).toFixed(2)+' م/ث';$('distance').textContent=distance().toFixed(2)+' م';if(mover)mover.setAttribute('position',`${-1+distance()*.1} .12 0`);}
for(const key of ['mass','force'])$(key).addEventListener('input',e=>{state[key]=Number(e.target.value);reset()});
$('object').onchange=e=>{state.object=e.target.value;reset();buildObject()};
$('play').onclick=()=>{if(state.mode==='ar'&&!state.tracked){$('error').textContent='وجّه الكاميرا نحو الماركر أولًا.';return}if(state.time>=10||distance()>=20)reset();state.running=!state.running;$('play').textContent=state.running?'إيقاف مؤقت':'متابعة';};$('reset').onclick=reset;
$('save').onclick=()=>{const tr=document.createElement('tr');for(const value of [$('object').selectedOptions[0].textContent,state.mass,state.force,acceleration().toFixed(2)]){const td=document.createElement('td');td.textContent=value;tr.append(td)}$('results').append(tr)};$('clear').onclick=()=>$('results').replaceChildren();
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('تعذر تحميل مكتبة الواقع المعزز. تحقق من اتصال الإنترنت ثم أعد المحاولة.'))};document.head.append(s)})}
function buildObject(){if(!mover)return;const car='<a-box width=".42" height=".13" depth=".22" color="#48b4ad"></a-box><a-box position="-.03 .1 0" width=".21" height=".1" depth=".19" color="#8061a7"></a-box>'+[-.14,.14].flatMap(x=>[-.13,.13].map(z=>`<a-cylinder position="${x} -.06 ${z}" rotation="90 0 0" radius=".065" height=".045" color="#253a45"></a-cylinder>`)).join('');mover.innerHTML=state.object==='car'?car:state.object==='box'?'<a-box width=".3" height=".3" depth=".3" color="#cf9b58" position="0 .06 0"></a-box>':'<a-sphere radius=".16" color="#8861af" position="0 .04 0"></a-sphere>';}
$('ar').onclick=async()=>{if(arStarting)return;if(!window.isSecureContext){$('error').textContent='تحتاج الكاميرا إلى رابط HTTPS أو localhost. راجع ملف التعليمات.';return}arStarting=true;$('ar').disabled=true;$('error').textContent='';reset();try{if(!window.AFRAME)await loadScript('https://aframe.io/releases/1.6.0/aframe.min.js');if(!window.THREEx?.ArToolkitContext)await loadScript('https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js');state.mode='ar';$('preview').hidden=true;$('status').textContent='اسمح بالكاميرا ثم وجّهها نحو الماركر';$('ar').classList.add('selected');$('demo').classList.remove('selected');document.body.classList.add('ar-mode');$('arHost').innerHTML=`<a-scene embedded vr-mode-ui="enabled: false" renderer="alpha: true; antialias: true" shadow="type: pcfsoft" arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best; patternRatio: 0.5"><a-entity light="type: ambient; intensity: 0.8"></a-entity><a-entity light="type: directional; intensity: 1.4; castShadow: true" position="-2 4 3"></a-entity><a-marker type="pattern" url="assets/edubond.patt" size="1"><a-box position="0 -.035 0" width="2.8" depth=".65" height=".15" color="#344d59" shadow="receive: true"></a-box><a-entity id="mover" shadow="cast: true; receive: true"></a-entity><a-box position="0 .005 -.25" width="2.8" height=".01" depth=".025" color="#f7d783"></a-box></a-marker><a-entity camera></a-entity></a-scene>`;scene=$('arHost').querySelector('a-scene');marker=scene.querySelector('a-marker');mover=$('mover');buildObject();update();marker.addEventListener('markerFound',()=>{state.tracked=true;$('status').textContent='تم اكتشاف الماركر • ابدأ التجربة';$('error').textContent=''});marker.addEventListener('markerLost',()=>{state.tracked=false;state.running=false;$('play').textContent='متابعة';$('status').textContent='الماركر خارج الرؤية • الحركة متوقفة'});}catch(e){$('error').textContent=e.message;stopAR()}finally{arStarting=false;$('ar').disabled=false}};
function stopAR(){state.running=false;state.mode='demo';state.tracked=false;const source=scene?.systems?.arjs?.arToolkitSource;const video=source?.domElement;video?.srcObject?.getTracks().forEach(t=>t.stop());video?.remove();scene?.pause();$('arHost').replaceChildren();scene=marker=mover=null;$('preview').hidden=false;$('status').textContent='مشهد ثلاثي الأبعاد • جاهز';$('ar').classList.remove('selected');$('demo').classList.add('selected');document.body.classList.remove('ar-mode');reset()}
$('demo').onclick=stopAR;window.addEventListener('camera-error',()=>{$('error').textContent='تعذر الوصول للكاميرا. اسمح باستخدامها من إعدادات المتصفح ثم أعد المحاولة.';stopAR()});document.addEventListener('visibilitychange',()=>{if(document.hidden){state.running=false;$('play').textContent='متابعة'}});
const canvas=$('preview');
let world,renderer,camera,body3d,platform,forceArrow,THREE3D,lastObject;
let yaw=.65,pitch=.65,zoom=6.4;
async function init3D(){
 $('status').textContent='جارٍ تحميل المشهد ثلاثي الأبعاد…';
 try {
 const T=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');THREE3D=T;
 renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor('#183b44');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 world=new T.Scene();camera=new T.PerspectiveCamera(38,1,.1,100);
 world.add(new T.HemisphereLight(0xe5ffff,0x35304a,2.2));const sun=new T.DirectionalLight(0xffedce,4);sun.position.set(-2,6,4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4});sun.shadow.bias=-.001;world.add(sun);
 const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:0x183b44,roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-.4;floor.receiveShadow=true;world.add(floor);
 const grid=new T.GridHelper(16,32,0x32616a,0x244d56);grid.position.y=-.395;world.add(grid);
 platform=new T.Group();world.add(platform);body3d=new T.Group();world.add(body3d);
 forceArrow=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(),.6,0xffd16a,.12,.08);world.add(forceArrow);
 canvas.style.touchAction='none';canvas.style.cursor='grab';canvas.setAttribute('aria-label','مشهد ثلاثي الأبعاد؛ اسحب لتدوير المنظور');
 let drag=null;canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag.x)*.008;pitch=Math.max(.25,Math.min(1.25,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY}});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>{drag=null;canvas.style.cursor='grab'});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(4,Math.min(10,zoom+e.deltaY*.005))},{passive:false});
 const footer=document.querySelector('.view-footer strong');footer.textContent='مجسمات ثلاثية الأبعاد • اسحب لتدوير المشهد';
 $('status').textContent='مشهد ثلاثي الأبعاد • جاهز';draw();
 }catch(e){$('error').textContent='تعذر تحميل العرض ثلاثي الأبعاد. تحقق من الإنترنت ودعم WebGL ثم حدّث الصفحة.';$('status').textContent='تعذر تحميل المشهد';}
}
function disposeGroup(group){while(group.children.length){const child=group.children[0];group.remove(child);child.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}})}}
function make3DObject(){const T=THREE3D;disposeGroup(body3d);disposeGroup(platform);
 const material=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:.38,metalness});
 const box=(parent,x,y,z,w,h,d,color)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
 box(platform,0,-.1,0,3.2,.2,.95,state.object==='car'?0x465562:0xb48a60);
 if(state.object==='car'){
 for(let x=-1.35;x<1.5;x+=.38)box(platform,x,.007,0,.20,.012,.025,0xffedb4);
 for(const z of [-.49,.49])box(platform,0,.02,z,3.3,.08,.05,0x81b8b6);
 box(body3d,0,.20,0,.56,.18,.29,0x4bbcb4);box(body3d,-.035,.345,0,.29,.15,.25,0x8960ae);box(body3d,.115,.35,0,.012,.09,.20,0xb5e8f0);
 for(const x of [-.18,.18])for(const z of [-.17,.17]){const wheel=new T.Mesh(new T.CylinderGeometry(.095,.095,.055,24),material(0x17232f));wheel.rotation.x=Math.PI/2;wheel.position.set(x,.105,z);wheel.castShadow=true;body3d.add(wheel);const hub=new T.Mesh(new T.CylinderGeometry(.045,.045,.058,20),material(0xbac9cf,.6));hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);body3d.add(hub)}
 for(const z of [-.095,.095])box(body3d,.287,.23,z,.012,.055,.065,0xffe5a0);
 }else{
 for(const x of [-1.3,1.3])for(const z of [-.32,.32])box(platform,x,-.28,z,.10,.35,.10,0x7e5943);
 if(state.object==='box'){box(body3d,0,.20,0,.38,.4,.38,0xd3a267);for(const x of [-.15,.15])box(body3d,x,.20,.196,.025,.4,.012,0x866344);box(body3d,0,.405,0,.07,.012,.38,0xf2d09d)}
 else{const sphere=new T.Mesh(new T.SphereGeometry(.22,40,28),material(0x9861bd,.12));sphere.position.y=.22;sphere.castShadow=true;body3d.add(sphere);const ring=new T.Mesh(new T.TorusGeometry(.221,.012,12,64),material(0xf1cb69));ring.position.y=.22;ring.rotation.x=.6;body3d.add(ring)}
 }
 lastObject=state.object;
}
function draw(){if(!renderer)return;if(lastObject!==state.object)make3DObject();const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const w=Math.round(rect.width),h=Math.round(rect.height);if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.set(zoom*Math.sin(yaw)*Math.cos(pitch),zoom*Math.sin(pitch),zoom*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(0,0,0);body3d.position.x=-1+distance()*.1;forceArrow.position.set(body3d.position.x,.7,0);forceArrow.visible=state.force>0;forceArrow.setLength(.25+state.force*.014,.12,.08);renderer.render(world,camera);}
init3D();
let previous;function frame(now){const dt=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(state.running&&(state.mode==='demo'||state.tracked)){const end=acceleration()>0?Math.min(10,Math.sqrt(40/acceleration())):10;state.time=Math.min(end,state.time+dt);if(state.time>=end){state.running=false;$('play').textContent='تجربة جديدة'}update()}if(state.mode==='demo')draw();requestAnimationFrame(frame)}update();requestAnimationFrame(frame);
