import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

// ── Project data with per-project color scheme ────────────────────────────
const PROJECTS = [
  { name:"Co-Code Editor", url:"https://projects-final.vercel.app/",   tagline:"Real-time Collab IDE",
    kanji:"編", bg1:"#6b0000", bg2:"#2a0000", border:"#ff4400", glow:"#ff2200", btn:"#cc2200", navDot:"#ff4400", lightCol:0xff2200 },
  { name:"Tally",           url:"https://tally-cyan-ten.vercel.app/",   tagline:"Daily Habit Tracker",
    kanji:"習", bg1:"#001666", bg2:"#000840", border:"#33aaff", glow:"#0066ff", btn:"#0044cc", navDot:"#33aaff", lightCol:0x0077ff },
  { name:"RushTap",         url:"https://rushtap.netlify.app/",         tagline:"Competitive Tap Game",
    kanji:"速", bg1:"#004d1a", bg2:"#001f0a", border:"#00cc55", glow:"#00aa33", btn:"#007722", navDot:"#00cc55", lightCol:0x00cc44 },
  { name:"ApexTrainer",     url:"https://gittychandlerbing-coder.github.io/Apex_trainer/", tagline:"Fitness Coach App",
    kanji:"鍛", bg1:"#5c3500", bg2:"#2a1800", border:"#ffaa00", glow:"#ff8800", btn:"#cc7700", navDot:"#ffaa00", lightCol:0xffaa00 },
]

// ── Helpers ───────────────────────────────────────────────────────────────
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}

function brighten(hex,amt=40){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgb(${Math.min(r+amt,255)},${Math.min(g+amt,255)},${Math.min(b+amt,255)})`}

// ── Per-project colored banner texture ───────────────────────────────────
function makeBannerTex(p,hov){
  const cv=document.createElement("canvas");cv.width=256;cv.height=384
  const g=cv.getContext("2d")
  const bg=g.createLinearGradient(0,0,0,384)
  bg.addColorStop(0,hov?brighten(p.bg1):p.bg1);bg.addColorStop(1,hov?brighten(p.bg2):p.bg2)
  g.fillStyle=bg;g.fillRect(0,0,256,384)
  // Glowing outer border
  g.shadowColor=p.glow;g.shadowBlur=hov?20:10
  g.strokeStyle=hov?p.border:`${p.border}cc`;g.lineWidth=hov?5:4;g.strokeRect(5,5,246,374);g.shadowBlur=0
  g.strokeStyle=hov?"#ffffff33":"#ffffff18";g.lineWidth=1.5;g.strokeRect(12,12,232,360)
  // Ghost kanji BG
  g.save();g.globalAlpha=0.08;g.fillStyle=p.border;g.font="bold 140px serif";g.textAlign="center";g.fillText(p.kanji,128,242);g.restore()
  // Top kanji
  g.shadowColor=p.glow;g.shadowBlur=hov?12:4;g.fillStyle=hov?p.border:`${p.border}cc`;g.font="bold 30px serif";g.textAlign="center";g.fillText(p.kanji,128,58);g.shadowBlur=0
  g.strokeStyle=`${p.border}77`;g.lineWidth=1;g.beginPath();g.moveTo(28,72);g.lineTo(228,72);g.stroke()
  // Name + tagline
  g.fillStyle="#ffffff";g.font="bold 18px Arial,sans-serif";g.fillText(p.name,128,106)
  g.fillStyle="#ffffffaa";g.font="italic 12px Arial,sans-serif";g.fillText(p.tagline,128,128)
  g.strokeStyle=`${p.border}44`;g.lineWidth=1;g.beginPath();g.moveTo(40,146);g.lineTo(216,146);g.stroke()
  // Center kanji oval
  g.shadowColor=p.glow;g.shadowBlur=hov?18:6;g.strokeStyle=`${p.border}${hov?"ff":"99"}`;g.lineWidth=2;g.beginPath();g.ellipse(128,228,50,55,0,0,Math.PI*2);g.stroke()
  g.fillStyle=hov?p.border:`${p.border}cc`;g.font="54px serif";g.fillText(p.kanji,128,252);g.shadowBlur=0
  // Button
  g.fillStyle=hov?p.btn:`${p.btn}99`;rrect(g,58,298,140,42,8);g.fill()
  g.shadowColor=hov?p.glow:"transparent";g.shadowBlur=hov?8:0
  g.strokeStyle=hov?p.border:`${p.border}88`;g.lineWidth=1.5;rrect(g,58,298,140,42,8);g.stroke()
  g.fillStyle=hov?"#ffffff":"#ffffffcc";g.font="bold 12px Arial,sans-serif";g.fillText("OPEN PROJECT →",128,324);g.shadowBlur=0
  // Corner diamonds
  g.fillStyle=hov?p.border:`${p.border}99`;g.font="12px serif"
  ;[[21,23],[225,23],[21,372],[225,372]].forEach(([x,y])=>g.fillText("◆",x,y))
  return new THREE.CanvasTexture(cv)
}

function makeLanternTex(c="#ff8800"){
  const cv=document.createElement("canvas");cv.width=64;cv.height=64
  const g=cv.getContext("2d")
  const gr=g.createRadialGradient(32,32,2,32,32,29)
  gr.addColorStop(0,"#fff8e0");gr.addColorStop(0.55,"#ffdd88");gr.addColorStop(1,c)
  g.fillStyle=gr;g.beginPath();g.arc(32,32,29,0,Math.PI*2);g.fill()
  g.strokeStyle="#00000033";g.lineWidth=1
  for(let dx=-8;dx<=8;dx+=4){g.beginPath();g.moveTo(32+dx,5);g.lineTo(32+dx,59);g.stroke()}
  g.fillStyle="#660000";g.font="bold 15px serif";g.textAlign="center";g.fillText("家",32,38)
  return new THREE.CanvasTexture(cv)
}

function makeSignTex(chars,bgC="#6a0c00",bdC="#ff8800"){
  const cv=document.createElement("canvas");cv.width=96;cv.height=400
  const g=cv.getContext("2d")
  g.fillStyle=bgC;g.fillRect(0,0,96,400)
  g.shadowColor=bdC;g.shadowBlur=6;g.strokeStyle=bdC;g.lineWidth=3;g.strokeRect(4,4,88,392);g.shadowBlur=0
  g.fillStyle="#ffcc88";g.font="bold 26px serif";g.textAlign="center"
  chars.split("").forEach((ch,i)=>g.fillText(ch,48,52+i*46))
  return new THREE.CanvasTexture(cv)
}

function makeNameTex(){
  const cv=document.createElement("canvas");cv.width=1024;cv.height=256
  const g=cv.getContext("2d")
  g.fillStyle="#03040d";g.fillRect(0,0,1024,256)
  g.strokeStyle="#cc5500";g.lineWidth=4;g.strokeRect(5,5,1014,246)
  g.strokeStyle="#ff440022";g.lineWidth=2;g.strokeRect(14,14,996,228)
  const ng=g.createLinearGradient(0,0,1024,0)
  ng.addColorStop(0,"#ff4400");ng.addColorStop(0.5,"#ffcc00");ng.addColorStop(1,"#ff4400")
  g.fillStyle=ng;g.font="bold 48px Georgia,serif";g.textAlign="center"
  g.shadowColor="#ff6600";g.shadowBlur=18;g.fillText("✦  ADI'S PORTFOLIO  ✦",512,106);g.shadowBlur=0
  g.fillStyle="#ff995577";g.font="italic 17px Arial,sans-serif";g.fillText("CLICK THE BANNERS TO EXPLORE PROJECTS",512,152)
  g.fillStyle="#ff440033";g.font="12px Arial,sans-serif";g.fillText("DRAG TO ROTATE  ·  HOVER TO PREVIEW  ·  CLICK TO OPEN",512,192)
  return new THREE.CanvasTexture(cv)
}

// ── Scene ─────────────────────────────────────────────────────────────────
function initScene(el,setTip,setHovIdx){
  const W=el.clientWidth||800,H=el.clientHeight||600
  const scene=new THREE.Scene()
  scene.background=new THREE.Color(0x04060f)
  scene.fog=new THREE.Fog(0x04060f,14,28)
  const cam=new THREE.PerspectiveCamera(46,W/H,0.1,50)
  cam.position.set(0,3.5,10);cam.lookAt(0,2.0,0)
  const ren=new THREE.WebGLRenderer({antialias:true})
  ren.setSize(W,H);ren.setPixelRatio(Math.min(devicePixelRatio,2))
  ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap
  ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.2
  el.appendChild(ren.domElement)

  // Global lights
  scene.add(new THREE.AmbientLight(0x0d1020,0.7))
  const dL=new THREE.DirectionalLight(0xffd4aa,0.9);dL.position.set(4,10,6);dL.castShadow=true;dL.shadow.mapSize.set(1024,1024);scene.add(dL)
  scene.add(Object.assign(new THREE.PointLight(0x8888ff,0.25,20),{position:new THREE.Vector3(0,12,0)}))

  const shop=new THREE.Group();scene.add(shop)
  const banners=[],bannerLights=[]
  const bTex=PROJECTS.map(p=>({n:makeBannerTex(p,false),h:makeBannerTex(p,true)}))
  const lWarm=makeLanternTex("#ff8800"),lWhite=makeLanternTex("#ffffff")

  // ── Authentic Japanese color palette ────────────────────────────────────
  const M={
    wall: new THREE.MeshStandardMaterial({color:0x0a1235,roughness:0.88,metalness:0.04}), // deep navy indigo
    dw:   new THREE.MeshStandardMaterial({color:0x0d0500,roughness:0.92}),                // dark lacquered wood
    wood: new THREE.MeshStandardMaterial({color:0x7a4020,roughness:0.80}),                // warm mid-brown
    roof: new THREE.MeshStandardMaterial({color:0x0c0e1c,roughness:0.82}),                // dark slate grey
    tile: new THREE.MeshStandardMaterial({color:0x080a12,roughness:0.90}),                // very dark tile
    bbg:  new THREE.MeshStandardMaterial({color:0x05081a,roughness:0.70}),                // dark navy (so boards pop)
    floor:new THREE.MeshStandardMaterial({color:0x090b12,roughness:1.00}),                // dark stone
    lat:  new THREE.MeshStandardMaterial({color:0x100600,roughness:0.95}),                // lattice wood
    nO:   new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff6600,emissiveIntensity:4}),
    nC:   new THREE.MeshStandardMaterial({color:0x00ccff,emissive:0x00ccff,emissiveIntensity:3}),
    rg:   new THREE.MeshStandardMaterial({color:0x07091a,roughness:0.95}),
  }

  const B=(w,h,d,m,x,y,z)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;shop.add(me);return me}
  const C=(rt,rb,h,s,m,x,y,z)=>{const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s),m);me.position.set(x,y,z);me.castShadow=true;shop.add(me);return me}
  const S=(r,s,m,x,y,z)=>{const me=new THREE.Mesh(new THREE.SphereGeometry(r,s,s),m);me.position.set(x,y,z);me.castShadow=true;shop.add(me);return me}

  // Ground
  B(8.5,0.18,6.0,M.floor,0,-0.09,0.15)
  // Navy walls
  B(5.4,4.0,0.22,M.wall,0,2.0,-1.13);B(0.22,4.0,2.66,M.wall,-2.7,2.0,-0.04);B(0.22,4.0,2.66,M.wall,2.7,2.0,-0.04)
  // Lattice on sides
  for(let y=0.5;y<3.9;y+=0.38){B(0.24,0.055,2.56,M.lat,-2.7,y,-0.04);B(0.24,0.055,2.56,M.lat,2.7,y,-0.04)}
  for(let z=-1.1;z<1.25;z+=0.44){B(0.24,3.7,0.055,M.lat,-2.7,2.0,z);B(0.24,3.7,0.055,M.lat,2.7,2.0,z)}
  // Lower front — warm brown wood panels
  B(1.5,1.92,0.22,M.wood,-1.9,0.96,1.14);B(1.5,1.92,0.22,M.wood,1.9,0.96,1.14)
  B(0.13,1.92,0.26,M.dw,-1.12,0.96,1.14);B(0.13,1.92,0.26,M.dw,1.12,0.96,1.14)
  B(2.38,0.15,0.26,M.dw,0,1.9,1.14)
  for(let dy=0.22;dy<1.86;dy+=0.22)B(2.1,0.04,0.24,M.dw,0,dy,1.15)
  // Banner bg (very dark navy so colored banners pop)
  B(5.4,1.6,0.2,M.bbg,0,2.88,1.1)
  B(5.62,0.18,0.28,M.dw,0,2.1,1.14);B(5.62,0.18,0.28,M.dw,0,3.66,1.14)
  ;[-1.35,0,1.35].forEach(x=>B(0.1,1.45,0.26,M.dw,x,2.88,1.14))
  B(0.13,1.6,0.26,M.dw,-2.62,2.88,1.14);B(0.13,1.6,0.26,M.dw,2.62,2.88,1.14)

  // ── Colored banners with per-project glow ──────────────────────────────
  const BX=[-2.0,-0.67,0.67,2.0]
  PROJECTS.forEach((proj,i)=>{
    const lc=proj.lightCol
    const rc=((lc>>16)&255)/255, gc=((lc>>8)&255)/255, bc=(lc&255)/255
    // Glow halo (larger transparent plane behind banner)
    const haloMat=new THREE.MeshBasicMaterial({color:lc,transparent:true,opacity:0.25,depthWrite:false})
    const halo=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.65),haloMat)
    halo.position.set(BX[i],2.88,1.22);shop.add(halo)
    // Banner plane
    const bm=new THREE.MeshStandardMaterial({map:bTex[i].n,emissiveMap:bTex[i].n,emissive:new THREE.Color(rc,gc,bc),emissiveIntensity:0.5,roughness:0.25})
    const bme=new THREE.Mesh(new THREE.PlaneGeometry(1.22,1.38),bm)
    bme.position.set(BX[i],2.88,1.32);bme.userData={idx:i};shop.add(bme);banners.push(bme)
    // Colored point light in front of each banner
    const bL=new THREE.PointLight(lc,1.4,3.2);bL.position.set(BX[i],2.88,1.9);shop.add(bL)
    bannerLights.push({light:bL,halo:haloMat})
  })

  // ── Roofs ──────────────────────────────────────────────────────────────
  B(5.85,0.2,1.12,M.roof,0,2.06,0.6);B(5.95,0.1,0.12,M.dw,0,1.97,1.22)
  for(let x=-2.78;x<=2.78;x+=0.28)B(0.27,0.07,1.04,M.tile,x,2.15,0.6)
  B(5.95,0.22,1.32,M.roof,0,3.7,0.52);B(6.05,0.12,0.14,M.dw,0,3.61,1.27)
  for(let x=-2.82;x<=2.82;x+=0.28)B(0.27,0.07,1.22,M.tile,x,3.8,0.52)
  B(5.65,0.25,3.05,M.roof,0,3.94,-0.1);B(5.65,0.34,0.16,M.rg,0,4.07,-0.1)
  for(let x=-2.68;x<=2.68;x+=0.28)B(0.27,0.07,2.85,M.tile,x,4.05,-0.1)
  // Corner pillars
  ;[-2.68,2.68].forEach(x=>C(0.09,0.09,4.06,8,M.dw,x,2.03,1.16))

  // ── Lanterns (alternating warm + white) ────────────────────────────────
  ;[-2.15,-1.55,-0.95,-0.35,0.35,0.95,1.55,2.15].forEach((x,idx)=>{
    const tex=idx%2===0?lWarm:lWhite,eC=idx%2===0?0xff9944:0xeeeedd
    const str=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.3,4),new THREE.MeshBasicMaterial({color:0x222222}))
    str.position.set(x,1.94,1.25);shop.add(str)
    S(0.16,12,new THREE.MeshStandardMaterial({map:tex,emissive:eC,emissiveIntensity:1.8}),x,1.73,1.25)
    C(0.016,0.004,0.12,4,new THREE.MeshBasicMaterial({color:0xcc1100}),x,1.56,1.25)
  })
  ;[-1.55,0,1.55].forEach(x=>{const pl=new THREE.PointLight(0xff9933,0.8,3.5);pl.position.set(x,1.73,1.25);shop.add(pl)})

  // ── Neon strips ────────────────────────────────────────────────────────
  B(5.62,0.05,0.04,M.nO,0,1.98,1.25);B(5.62,0.05,0.04,M.nO,0,2.13,1.25)
  B(5.62,0.05,0.04,M.nC,0,3.62,1.25) // cyan top strip

  // ── Side signs (blue left, green right for color variety) ──────────────
  const sg1=new THREE.Mesh(new THREE.PlaneGeometry(0.48,2.1),new THREE.MeshStandardMaterial({map:makeSignTex("ポート","#001666","#33aaff"),emissive:0x001a88,emissiveIntensity:0.7,side:THREE.DoubleSide}))
  const sg2=new THREE.Mesh(new THREE.PlaneGeometry(0.48,2.1),new THREE.MeshStandardMaterial({map:makeSignTex("フォリオ","#004d1a","#00cc55"),emissive:0x005522,emissiveIntensity:0.7,side:THREE.DoubleSide}))
  sg1.position.set(-2.97,2.5,1.32);sg2.position.set(2.97,2.5,1.32);shop.add(sg1);shop.add(sg2)
  const sl1=new THREE.PointLight(0x3399ff,0.7,2.2);sl1.position.set(-2.97,2.5,1.7);shop.add(sl1)
  const sl2=new THREE.PointLight(0x00cc55,0.7,2.2);sl2.position.set(2.97,2.5,1.7);shop.add(sl2)

  // ── Name sign ──────────────────────────────────────────────────────────
  const nm=new THREE.Mesh(new THREE.PlaneGeometry(5.22,1.18),new THREE.MeshStandardMaterial({map:makeNameTex(),emissive:new THREE.Color(0.5,0.2,0),emissiveIntensity:0.7}))
  nm.position.set(0,3.93,1.38);shop.add(nm)
  const nameL=new THREE.PointLight(0xff8800,0.8,4);nameL.position.set(0,4.2,2.2);shop.add(nameL)

  // ── Entrance floor lamps ───────────────────────────────────────────────
  ;[-1.82,1.82].forEach(x=>{
    C(0.04,0.04,1.88,8,M.dw,x,0.94,1.4)
    S(0.2,12,new THREE.MeshStandardMaterial({map:lWarm,emissive:0xffaa44,emissiveIntensity:2.0}),x,1.93,1.4)
    const pl=new THREE.PointLight(0xff9933,1.1,3.2);pl.position.set(x,1.93,1.4);shop.add(pl)
  })

  // Ground glow
  const gp=new THREE.Mesh(new THREE.PlaneGeometry(7,4.5),new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0.025,depthWrite:false}))
  gp.rotation.x=-Math.PI/2;gp.position.set(0,0.02,0.5);shop.add(gp)

  // ── Particles ──────────────────────────────────────────────────────────
  const N=220;const pP=new Float32Array(N*3)
  for(let i=0;i<N;i++){pP[i*3]=(Math.random()-.5)*24;pP[i*3+1]=Math.random()*14;pP[i*3+2]=(Math.random()-.5)*24-5}
  const pGeo=new THREE.BufferGeometry();pGeo.setAttribute("position",new THREE.BufferAttribute(pP,3))
  scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xffaa44,size:0.05,sizeAttenuation:true,transparent:true,opacity:0.65})))

  // ── Interaction ────────────────────────────────────────────────────────
  const ray=new THREE.Raycaster();const ms=new THREE.Vector2()
  let hovIdx=-1,dragging=false,prevX=0,autoRot=true,tY=0,cY=0

  function swapTex(i,h){
    const me=banners[i];const t=h?bTex[i].h:bTex[i].n
    me.material.map=t;me.material.emissiveMap=t;me.material.emissiveIntensity=h?1.8:0.5
    me.material.map.needsUpdate=true;me.material.needsUpdate=true
  }

  function onMM(e){
    if(dragging){tY+=(e.clientX-prevX)*0.006;prevX=e.clientX}
    const rc=ren.domElement.getBoundingClientRect()
    ms.x=((e.clientX-rc.left)/rc.width)*2-1;ms.y=-((e.clientY-rc.top)/rc.height)*2+1
    ray.setFromCamera(ms,cam);const hits=ray.intersectObjects(banners)
    if(hits.length){
      const i=banners.indexOf(hits[0].object);autoRot=false
      if(i!==hovIdx){if(hovIdx!==-1){swapTex(hovIdx,false);setHovIdx(-1)}hovIdx=i;swapTex(i,true);setHovIdx(i);ren.domElement.style.cursor="pointer"}
      setTip({v:true,x:e.clientX,y:e.clientY-72,n:PROJECTS[i].name,t:PROJECTS[i].tagline,col:PROJECTS[i].border})
    }else{
      if(hovIdx!==-1){swapTex(hovIdx,false);setHovIdx(-1);hovIdx=-1;ren.domElement.style.cursor=dragging?"grabbing":"grab";setTimeout(()=>{if(hovIdx===-1&&!dragging)autoRot=true},1500)}
      setTip(s=>({...s,v:false}))
    }
  }
  function onMD(e){dragging=true;prevX=e.clientX;autoRot=false;ren.domElement.style.cursor="grabbing"}
  function onMU(){dragging=false;ren.domElement.style.cursor=hovIdx!==-1?"pointer":"grab";setTimeout(()=>{if(!dragging&&hovIdx===-1)autoRot=true},2200)}
  function onCK(e){
    const rc=ren.domElement.getBoundingClientRect()
    ms.x=((e.clientX-rc.left)/rc.width)*2-1;ms.y=-((e.clientY-rc.top)/rc.height)*2+1
    ray.setFromCamera(ms,cam);const hits=ray.intersectObjects(banners)
    if(hits.length)window.open(PROJECTS[banners.indexOf(hits[0].object)].url,"_blank")
  }
  function onTS(e){dragging=true;prevX=e.touches[0].clientX;autoRot=false}
  function onTM(e){e.preventDefault();tY+=(e.touches[0].clientX-prevX)*0.006;prevX=e.touches[0].clientX}
  function onTE(){dragging=false;setTimeout(()=>{if(!dragging)autoRot=true},2200)}

  ren.domElement.addEventListener("mousemove",onMM);ren.domElement.addEventListener("mousedown",onMD)
  ren.domElement.addEventListener("mouseup",onMU);ren.domElement.addEventListener("click",onCK)
  ren.domElement.addEventListener("touchstart",onTS,{passive:true});ren.domElement.addEventListener("touchmove",onTM,{passive:false});ren.domElement.addEventListener("touchend",onTE)
  ren.domElement.style.cursor="grab"

  // ── focusBanner — called from navbar ─────────────────────────────────
  function focusBanner(i){
    tY=Math.round(cY/(Math.PI*2))*Math.PI*2;autoRot=false
    if(hovIdx!==-1&&hovIdx!==i)swapTex(hovIdx,false)
    hovIdx=i;swapTex(i,true);setHovIdx(i)
    setTip({v:true,x:window.innerWidth*0.5,y:190,n:PROJECTS[i].name,t:PROJECTS[i].tagline,col:PROJECTS[i].border})
    setTimeout(()=>{swapTex(i,false);setHovIdx(-1);hovIdx=-1;setTip(s=>({...s,v:false}));setTimeout(()=>{autoRot=true},1500)},2800)
  }

  // ── Animation loop ────────────────────────────────────────────────────
  let frame=0,aid;const pArr=pGeo.attributes.position
  function loop(){
    aid=requestAnimationFrame(loop);frame++
    if(autoRot&&!dragging)tY+=0.0035
    cY+=(tY-cY)*0.055;shop.rotation.y=cY
    for(let i=0;i<N;i++){pArr.array[i*3+1]+=0.007;if(pArr.array[i*3+1]>14)pArr.array[i*3+1]=-0.5}
    pArr.needsUpdate=true
    const t=frame*0.025
    // Pulsing banner glow lights + halos
    bannerLights.forEach(({light,halo},i)=>{
      const pulse=Math.sin(t+i*Math.PI*0.5)*0.35+1.0
      light.intensity=(i===hovIdx?2.8:1.2)*pulse
      halo.opacity=(i===hovIdx?0.45:0.22)+Math.sin(t+i)*0.06
    })
    // Banner breathing emissiveIntensity
    banners.forEach((b,i)=>{if(i!==hovIdx)b.material.emissiveIntensity=0.38+Math.sin(t+i*1.3)*0.14})
    // Neon flicker
    if(frame%90===0&&Math.random()>.6){M.nO.emissiveIntensity=0.4;setTimeout(()=>{M.nO.emissiveIntensity=4},65)}
    ren.render(scene,cam)
  }
  loop()

  const onResize=()=>{const w=el.clientWidth,h=el.clientHeight;cam.aspect=w/h;cam.updateProjectionMatrix();ren.setSize(w,h)}
  window.addEventListener("resize",onResize)

  return {
    focusBanner,
    cleanup:()=>{
      cancelAnimationFrame(aid);window.removeEventListener("resize",onResize)
      ren.domElement.removeEventListener("mousemove",onMM);ren.domElement.removeEventListener("mousedown",onMD)
      ren.domElement.removeEventListener("mouseup",onMU);ren.domElement.removeEventListener("click",onCK)
      ren.domElement.removeEventListener("touchstart",onTS);ren.domElement.removeEventListener("touchmove",onTM);ren.domElement.removeEventListener("touchend",onTE)
      ren.dispose();if(el.contains(ren.domElement))el.removeChild(ren.domElement)
    }
  }
}

// ── React component ───────────────────────────────────────────────────────
export default function JapaneseShopPortfolio(){
  const ref=useRef(null)
  const focusFn=useRef(null)
  const [tip,setTip]=useState({v:false,x:0,y:0,n:"",t:"",col:"#ff6600"})
  const [hovIdx,setHovIdx]=useState(-1)

  useEffect(()=>{
    if(!ref.current)return
    const{focusBanner,cleanup}=initScene(ref.current,setTip,setHovIdx)
    focusFn.current=focusBanner
    return cleanup
  },[])

  return(
    <div style={{width:"100%",height:"100vh",background:"#04060f",position:"relative",overflow:"hidden",fontFamily:"sans-serif"}}>
      <div ref={ref} style={{width:"100%",height:"100%"}}/>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position:"absolute",top:0,left:0,right:0,
        display:"flex",alignItems:"center",flexWrap:"wrap",gap:6,
        padding:"10px 14px",
        background:"linear-gradient(180deg,rgba(4,6,15,0.97) 0%,rgba(4,6,15,0.6) 75%,transparent 100%)",
        zIndex:100,
      }}>
        <span style={{color:"#ff6600",fontSize:13,fontFamily:"serif",letterSpacing:2,whiteSpace:"nowrap",marginRight:4}}>
          ⛩ ADI'S PORTFOLIO
        </span>
        <div style={{width:1,height:22,background:"#ffffff22",flexShrink:0}}/>
        {PROJECTS.map((p,i)=>(
          <button key={i} onClick={()=>focusFn.current?.(i)}
            style={{
              display:"flex",alignItems:"center",gap:6,
              background:hovIdx===i?`${p.navDot}18`:"rgba(255,255,255,0.03)",
              border:`1px solid ${hovIdx===i?p.navDot:"rgba(255,255,255,0.1)"}`,
              borderRadius:20,padding:"5px 12px",
              color:hovIdx===i?p.navDot:"#ffffffaa",
              fontSize:12,cursor:"pointer",transition:"all 0.25s",
              boxShadow:hovIdx===i?`0 0 14px ${p.navDot}55,inset 0 0 8px ${p.navDot}11`:"none",
              whiteSpace:"nowrap",
            }}>
            <span style={{
              width:8,height:8,borderRadius:"50%",flexShrink:0,
              background:p.navDot,
              boxShadow:`0 0 6px ${p.navDot},0 0 14px ${p.navDot}88`,
            }}/>
            {p.name}
          </button>
        ))}
      </nav>

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tip.v&&(
        <div style={{
          position:"fixed",left:tip.x,top:tip.y,transform:"translateX(-50%)",
          background:"rgba(4,6,15,0.97)",border:`1px solid ${tip.col}`,borderRadius:8,
          padding:"10px 18px",color:"#fff",pointerEvents:"none",zIndex:200,
          textAlign:"center",boxShadow:`0 0 28px ${tip.col}66,0 0 6px ${tip.col}33`,
        }}>
          <div style={{color:tip.col,fontWeight:"bold",fontSize:15}}>{tip.n}</div>
          <div style={{color:"#ffffffbb",fontSize:13,marginTop:3}}>{tip.t}</div>
          <div style={{color:tip.col,fontSize:11,marginTop:5,opacity:0.8}}>Click to open →</div>
        </div>
      )}

      {/* ── Bottom hint ────────────────────────────────────────────────── */}
      <div style={{position:"absolute",bottom:22,left:"50%",transform:"translateX(-50%)",color:"#ffffff33",fontSize:11,letterSpacing:3,pointerEvents:"none",textAlign:"center"}}>
        🖱 DRAG TO ROTATE &nbsp;·&nbsp; CLICK BANNERS TO OPEN
      </div>

      {/* ── Per-project colored indicator dots ─────────────────────────── */}
      <div style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",display:"flex",gap:12,alignItems:"center"}}>
        {PROJECTS.map((p,i)=>(
          <div key={i} title={`Click to highlight: ${p.name}`} onClick={()=>focusFn.current?.(i)}
            style={{
              width:hovIdx===i?12:9,height:hovIdx===i?12:9,borderRadius:"50%",cursor:"pointer",
              background:hovIdx===i?p.navDot:"transparent",
              border:`2px solid ${p.navDot}`,
              boxShadow:hovIdx===i?`0 0 12px ${p.navDot},0 0 24px ${p.navDot}66`:`0 0 5px ${p.navDot}66`,
              transition:"all 0.3s",
            }}/>
        ))}
      </div>
    </div>
  )
}
