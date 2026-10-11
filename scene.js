import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';

export function createScene(el,initial){
 let config=initial,group,measurements,evening=false,measureVisible=false;
 const scene=new THREE.Scene(); scene.background=new THREE.Color('#eeeee6'); scene.fog=new THREE.Fog('#eeeee6',22,65);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;el.append(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(8.8,5.8,10.8);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.85,0); controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=6;controls.maxDistance=25;controls.maxPolarAngle=Math.PI/2-.03;controls.enablePan=false;
 const hemi=new THREE.HemisphereLight('#fbfcf1','#8c9980',2.8);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff5db',4.5);sun.position.set(-5,9,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;scene.add(sun);
 const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const groundMat=mat('#c9cbbb');const grassMat=mat('#abb698');const tileMat=mat('#cecdbf');const concrete=mat('#b8bcaf');const leaf1=mat('#6e8056');const leaf2=mat('#879965');const leaf3=mat('#b5ba84');const bark=mat('#817663');
 function box(w,h,d,x,y,z,material,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function cylinder(r1,r2,h,x,y,z,material,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,10),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 let seed=39;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.09;scene.add(ground);
 box(13,.04,9,0,-.05,-1,grassMat);box(13,.07,3.7,0,-.04,5.1,tileMat);
 const seamMat=mat('#adb3a3');for(let x=-6;x<7;x+=1.05)box(.011,.004,3.7,x,.001,5.1,seamMat);for(let z=3.6;z<7;z+=1.05)box(13,.004,.011,0,.001,z,seamMat);
 function tree(x,z,s=1){cylinder(.10*s,.14*s,2.8*s,x,1.3*s,z,bark);for(let k=0;k<5;k++){let branch=cylinder(.028*s,.055*s,1.1*s,x+(rand()-.5)*.4*s,2.1*s,z+(rand()-.5)*.4*s,bark);branch.rotation.z=(rand()-.5)*1.5;branch.rotation.x=(rand()-.5)*1.1}for(let i=0;i<28;i++){const m=new THREE.Mesh(new THREE.SphereGeometry((.32+rand()*.25)*s,10,8),i%3===0?leaf1:leaf2);m.position.set(x+(rand()-.5)*1.9*s,(2.3+rand()*.95)*s,z+(rand()-.5)*1.6*s);m.scale.set(1,.85,1);m.castShadow=true;scene.add(m)}}
 tree(-4.5,-2.1,1.15);tree(4.8,-3.2,.9);tree(-5.7,-4.8,.8);
 function planting(x,z,w,d){box(w,.14,d,x,.06,z,mat('#b0b69f'));for(let i=0;i<80;i++){const px=x+(rand()-.5)*w,pz=z+(rand()-.5)*d,h=.16+rand()*.35;const blade=new THREE.Mesh(new THREE.ConeGeometry(.045,h,3),i%4===0?leaf3:leaf2);blade.position.set(px,h/2+.10,pz);blade.rotation.z=(rand()-.5)*.3;scene.add(blade)}for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.2+rand()*.16,2),leaf1);m.position.set(x+(rand()-.5)*w,.22,z+(rand()-.5)*d);m.scale.y=.7;m.castShadow=true;scene.add(m)}}
 planting(-4,1.4,1.15,4.6);planting(4.5,1.3,1.3,4.9);planting(0,-4.4,6.3,.8);
 const planter=mat('#6b7463');cylinder(.35,.28,.6,-2.9,.29,3.1,planter);for(let i=0;i<25;i++){let m=new THREE.Mesh(new THREE.SphereGeometry(.11,5,4),leaf2);m.position.set(-2.9+(rand()-.5)*.5,.8+rand()*.5,3.1+(rand()-.5)*.4);m.scale.set(1,2.8,1);scene.add(m)}
 function label(text,x,y,z){const c=document.createElement('canvas');c.width=400;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#f9fbf3';ctx.fillRect(0,0,400,80);ctx.fillStyle='#50633c';ctx.font='500 36px sans-serif';ctx.textAlign='center';ctx.fillText(text,200,52);let tex=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));s.scale.set(1.65,.33,1);s.position.set(x,y,z);return s}
 function line(a,b,parent){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);parent.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:'#687e49'})))}
 function rebuild(c){config=c;if(group){scene.remove(group);group.traverse(o=>{o.geometry?.dispose(); if(o.material && ![groundMat,grassMat,tileMat,concrete,leaf1,leaf2,leaf3,bark].includes(o.material)){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}group=new THREE.Group();scene.add(group);const w=c.width+.04,d=c.depth+.04,h=2.505;const steel=mat(c.color==='dark'?'#4c5555':'#969081',.5,.48);const dark=mat('#394441',.45,.35);const inner=mat('#d7d9cf',.75);const floor=mat('#aaa995');const glazing=new THREE.MeshPhysicalMaterial({color:'#7f9e9b',roughness:.12,metalness:.15,transparent:true,opacity:.65,side:THREE.DoubleSide});
 box(w+.16,.11,d+.16,0,.055,0,concrete,group);box(w-.08,.05,d-.08,0,.14,0,floor,group);
 // Panelled metal shell, with real front openings and the standard upper light band.
 box(w,.06,d,0,.20,0,dark,group);box(w,.09,.08,0,2.19,-d/2,steel,group);box(w,.09,.08,0,2.19,d/2,steel,group);box(.08,.09,d,-w/2,2.19,0,steel,group);box(.08,.09,d,w/2,2.19,0,steel,group);
 box(w,1.91,.06,0,1.185,-d/2,steel,group);
 // Side glass options replace wall segments rather than covering them.
 const glassCount=Number(c.glass)||0;const opening=.94;
 function sideWall(x,n,withWindow=false){let segments=[];for(let z=-d/2+.5;z<d/2;z+=1){const last=Math.min(1,d/2-(z-.5));let isGlass=n>0 && z>-.7&&z<1.4;let isWindow=withWindow&&Math.abs(z-(-d/2+.5))<.1;if(isWindow){box(.055,.81,last,x,.635,z,steel,group);box(.055,.28,last,x,2.0,z,steel,group);box(.055,.82,.11,x,1.45,z-last/2+.055,steel,group);box(.055,.82,.11,x,1.45,z+last/2-.055,steel,group);box(.072,.82,.84,x,1.45,z,dark,group);box(.078,.70,.71,x,1.45,z,glazing,group)}else if(isGlass){box(.035,1.89,last-.09,x,1.185,z,glazing,group);box(.04,1.88,.038,x,1.185,z-last/2+.02,dark,group);box(.04,1.88,.038,x,1.185,z+last/2-.02,dark,group);n--}else{box(.055,1.91,last,x,1.185,z,steel,group);box(.061,1.90,.011,x,1.185,z-last/2+.01,dark,group)}}}
 sideWall(w/2,glassCount);sideWall(-w/2,0,c.window);
 const doorW=c.door==='standard'?1:2;const doorX=c.doorPosition==='right'?(w/2-doorW/2-.20):c.doorPosition==='center'?0:(-w/2+doorW/2+.20);
 let leftEdge=doorX-doorW/2,rightEdge=doorX+doorW/2;const leftW=leftEdge+w/2,rightW=w/2-rightEdge;
 if(leftW>0)box(leftW,1.91,.06,-w/2+leftW/2,1.185,d/2,steel,group);if(rightW>0)box(rightW,1.91,.06,rightEdge+rightW/2,1.185,d/2,steel,group);
 const doorH=1.94;box(.06,doorH,.10,leftEdge,1.19,d/2+.02,dark,group);box(.06,doorH,.10,rightEdge,1.19,d/2+.02,dark,group);box(doorW,.055,.10,doorX,2.14,d/2+.02,dark,group);
 const leaves=c.door==='standard'?1:2;for(let i=0;i<leaves;i++){let x=leftEdge+(i+.5)*doorW/leaves;box(doorW/leaves-.06,doorH-.07,.035,x,1.17,d/2+.03,c.door==='glass'?glazing:steel,group);box(.04,doorH-.05,.07,leftEdge+i*doorW/leaves,1.18,d/2+.05,dark,group);box(doorW/leaves,.10,.07,x,.28,d/2+.05,dark,group);box(.025,.20,.05,x+(i===0?1:-1)*(.5*doorW/leaves-.12),1.23,d/2+.1,mat('#c3c9bf',.3,.7),group)}
 // Dark perimeter and bright translucent clerestory.
 box(w-.06,.23,.025,0,2.345,d/2,glazing,group);box(w-.06,.23,.025,0,2.345,-d/2,glazing,group);box(.025,.23,d-.06,w/2,2.345,0,glazing,group);box(.025,.23,d-.06,-w/2,2.345,0,glazing,group);
 for(let x=-w/2;x<=w/2+.01;x+=1)box(.022,.23,.03,x,2.345,d/2+.01,dark,group);
 for(let z=-d/2;z<=d/2+.01;z+=1)box(.03,.23,.022,w/2+.01,2.345,z,dark,group);
 const roofW=c.width+.28,roofD=c.depth+.28;box(roofW,.10,roofD,0,h-.05,0,dark,group);box(roofW-.1,.015,roofD-.1,0,h+.01,0,steel,group);
 for(let x=-w/2+.1;x<w/2;x+=1)box(.008,1.90,.008,x,1.19,d/2+.034,dark,group);
 box(.06,2.12,.06,w/2,1.28,-d/2,steel,group);box(.06,2.12,.06,-w/2,1.28,d/2,steel,group);
 
 if(c.purpose!=='Garden storage'){const chairMat=mat('#c6bda6');box(.62,.15,.62,-.7,.47,-.7,chairMat,group);box(.62,.55,.13,-.7,.74,-.95,chairMat,group);box(.1,.37,.62,-1.02,.63,-.7,chairMat,group);box(.1,.37,.62,-.38,.63,-.7,chairMat,group);for(let x of[-.92,-.48])for(let z of[-.9,-.5])box(.035,.33,.035,x,.3,z,dark,group);cylinder(.32,.32,.045,.30,.52,-.4,mat('#b3a083'),group);cylinder(.04,.06,.38,.30,.31,-.4,dark,group);
 }
 if(c.accessories?.includes('floorframe')){box(w+.07,.08,.05,0,.18,d/2,mat('#8e9692',.4,.6),group);box(.05,.08,d+.07,w/2,.18,0,mat('#8e9692',.4,.6),group)}
 if(c.accessories?.includes('shelf'))box(1.3,.05,.25,-w/2+.7,1.3,-d/2+.18,inner,group);
 if(c.accessories?.includes('table')){box(.96,.045,.6,-w/2+.5,.85,-.4,inner,group);box(.03,.7,.03,-w/2+.8,.5,-.4,dark,group)}
 if(c.accessories?.includes('bike')){box(.09,.7,.08,-w/2+.1,1.6,.55,inner,group);box(.25,.06,.08,-w/2+.19,1.94,.55,inner,group)}
 if(c.accessories?.includes('lights')){box(.035,.035,.018,doorX,2.08,d/2+.10,dark,group)}
 if(measurements)scene.remove(measurements);measurements=new THREE.Group();scene.add(measurements);const z=d/2+.6;line([-w/2,.2,z],[w/2,.2,z],measurements);line([-w/2,.2,z-.12],[-w/2,.2,z+.12],measurements);line([w/2,.2,z-.12],[w/2,.2,z+.12],measurements);measurements.add(label(`${w.toFixed(2)} m`,0,.30,z+.1));line([w/2+.5,.2,-d/2],[w/2+.5,.2,d/2],measurements);measurements.add(label(`${d.toFixed(2)} m`,w/2+.65,.35,0));measurements.visible=measureVisible;
 camera.far=100;controls.update();
 }
 rebuild(config);
 const resize=new ResizeObserver(()=>{const width=el.clientWidth,height=el.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()});resize.observe(el);
 let pending;function loop(){pending=requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)}loop();
 const api={update:rebuild,setMeasure(on){measureVisible=on;measurements.visible=on},rotate(dir){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),dir*.35);camera.position.copy(controls.target).add(offset);controls.update()},zoom(dir){camera.position.sub(controls.target).multiplyScalar(dir===1?.85:1.17).add(controls.target);controls.update()},front(){camera.position.set(0,3,13);controls.target.set(0,1,0);controls.update()},reset(){camera.position.set(8.8,5.8,10.8);controls.target.set(0,.85,0);controls.update()},daylight(on){evening=on;scene.background.set(on?'#5b6873':'#eeeee6');scene.fog.color.copy(scene.background);hemi.intensity=on?.8:2.8;sun.intensity=on?1.2:4.5;sun.color.set(on?'#e9b97c':'#fff5db');renderer.toneMappingExposure=on?1.1:1.15;rebuild(config)},snapshot(){renderer.render(scene,camera);const c=document.createElement('canvas');c.width=1200;c.height=Math.min(1800,Math.max(1,Math.round(1200*renderer.domElement.height/renderer.domElement.width)));const ctx=c.getContext('2d');ctx.drawImage(renderer.domElement,0,0,c.width,c.height);return c.toDataURL('image/png')},destroy(){cancelAnimationFrame(pending);resize.disconnect();renderer.dispose();controls.dispose()}};
 return api;
}
