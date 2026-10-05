"use client";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { cameraAt, clamp, mix, smooth, type JourneyFrame } from "./journeyMath";

const gold = { color: "#c3a06a", metalness: .86, roughness: .29 };
const ebony = { color: "#15110f", metalness: .26, roughness: .3 };

function Brush({ position, tilt = .3, size = 1 }: { position: [number,number,number]; tilt?:number; size?:number }) {
  return <group position={position} rotation={[.13,.2,tilt]} scale={size}>
    <mesh position={[0,-.6,0]}><cylinderGeometry args={[.075,.055,1.65,16]} /><meshStandardMaterial {...ebony} /></mesh>
    <mesh position={[0,.36,0]}><cylinderGeometry args={[.14,.08,.43,24]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[0,.75,0]} scale={[1,1.28,.85]}><sphereGeometry args={[.22,20,16,0,Math.PI*2,0,Math.PI*.68]} /><meshStandardMaterial color="#73513b" roughness={1} /></mesh>
    <mesh position={[0,.59,0]}><cylinderGeometry args={[.2,.13,.16,20]} /><meshStandardMaterial color="#32231b" roughness={1} /></mesh>
  </group>;
}

function Compact() {
  return <group position={[-1.15,-1.03,-.05]} rotation={[.18,.35,.1]}>
    <mesh><cylinderGeometry args={[.67,.67,.14,48]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[0,.083,0]}><cylinderGeometry args={[.58,.58,.03,48]} /><meshStandardMaterial color="#bb886a" roughness={.95} /></mesh>
    <group position={[0,.15,-.61]} rotation={[-1.05,0,0]}>
      <mesh position={[0,0,.61]}><cylinderGeometry args={[.67,.67,.08,48]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0,.046,.61]}><cylinderGeometry args={[.59,.59,.014,48]} /><meshStandardMaterial color="#d2c5b7" metalness={1} roughness={.14} /></mesh>
    </group>
  </group>;
}

function Lipstick() {
  return <group position={[1.2,-.58,.35]} rotation={[.06,0,-.12]}>
    <mesh><cylinderGeometry args={[.16,.16,.72,24]} /><meshStandardMaterial {...ebony} /></mesh>
    <mesh position={[0,.43,0]}><cylinderGeometry args={[.14,.14,.25,24]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[0,.73,0]} rotation={[0,0,.03]}><capsuleGeometry args={[.115,.38,4,16]} /><meshStandardMaterial color="#691c2d" roughness={.4} /></mesh>
  </group>;
}

function Foundation() {
  return <group position={[2.23,-.68,-.15]} rotation={[0,.4,.04]}>
    <mesh><boxGeometry args={[.43,.91,.36]} /><meshPhysicalMaterial color="#c2a17c" metalness={.04} roughness={.18} clearcoat={1} /></mesh>
    <mesh position={[0,.53,0]}><boxGeometry args={[.42,.2,.36]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[0,.71,0]}><boxGeometry args={[.3,.2,.28]} /><meshStandardMaterial {...ebony} /></mesh>
  </group>;
}

function Jewellery({ scale=1 }: {scale?:number}) {
  return <group scale={scale} rotation={[.12,.14,.16]}>
    <mesh><torusGeometry args={[.8,.06,12,64,Math.PI*1.75]} /><meshStandardMaterial {...gold} /></mesh>
    {Array.from({length:19},(_,i)=> {
      const theta=(i/18)*Math.PI*1.75;
      return <group key={i} position={[Math.cos(theta)*.81,Math.sin(theta)*.81,0]}>
        <mesh scale={[.62,1,.55]}><octahedronGeometry args={[.13,0]} /><meshStandardMaterial color={i%3===0?"#49262b":"#d8bc83"} metalness={.7} roughness={.2} /></mesh>
      </group>;
    })}
    <mesh position={[0,-1.01,0]} scale={[.7,1,.3]}><octahedronGeometry args={[.29,1]} /><meshStandardMaterial {...gold} /></mesh>
  </group>;
}

function BeautyTable() {
  return <group position={[0,-.25,-14]}>
    <mesh position={[0,-1.22,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[4.1,64]} /><meshStandardMaterial color="#211812" roughness={.27} metalness={.32} /></mesh>
    <mesh position={[0,-1.27,0]}><cylinderGeometry args={[4.1,4.1,.065,64]} /><meshStandardMaterial {...gold} /></mesh>
    <Brush position={[-2.3,.1,.1]} tilt={-.5} /><Brush position={[-1.84,-.1,-.32]} tilt={-.22} size={.76} />
    <Compact /><Lipstick /><Foundation />
    <group position={[.35,-1.1,-.8]} rotation={[Math.PI/2,0,0]} scale={.63}><Jewellery /></group>
    <group position={[-.15,.65,-1.7]}><mesh scale={[.7,1,1]}><torusGeometry args={[1.5,.035,12,64]} /><meshStandardMaterial {...gold} /></mesh><mesh scale={[.7,1,1]}><circleGeometry args={[1.47,64]} /><meshStandardMaterial color="#352a23" metalness={.8} roughness={.25} /></mesh></group>
  </group>;
}

function World({ frame }: { frame: RefObject<JourneyFrame> }) {
  const { camera, invalidate, gl } = useThree();
  const tables = useRef<THREE.Group>(null);
  const opening = useRef<THREE.Group>(null);
  const ornament = useRef<THREE.Group>(null);
  const key = useRef<THREE.PointLight>(null);
  const texture = useLoader(THREE.TextureLoader,"/media/look-2.webp");
  const crop = useMemo(()=> { const t=texture.clone();t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(.5,.22);t.offset.set(.24,.2);t.needsUpdate=true;return t; },[texture]);
  useEffect(()=>()=>crop.dispose(),[crop]);
  const pigment = useMemo(()=> {
    const positions = new Float32Array(36*3);
    for(let i=0;i<36;i++){positions[i*3]=Math.sin(i*2.4)*4;positions[i*3+1]=Math.cos(i*1.6)*2;positions[i*3+2]=-31+(i%5)*.2;}
    return positions;
  },[]);
  useEffect(()=> {
    const draw=()=>{if(!document.hidden && !frame.current.paused && frame.current.chapter!==9)invalidate();};
    window.addEventListener("journey-frame",draw);window.addEventListener("pointermove",draw,{passive:true});document.addEventListener("visibilitychange",draw);
    const lost=(e:Event)=>{e.preventDefault();window.dispatchEvent(new Event("journey-webgl-lost"));};
    gl.domElement.addEventListener("webglcontextlost",lost);
    return ()=>{window.removeEventListener("journey-frame",draw);window.removeEventListener("pointermove",draw);document.removeEventListener("visibilitychange",draw);gl.domElement.removeEventListener("webglcontextlost",lost);};
  },[invalidate,frame,gl]);
  useFrame(()=> {
    const {travel,pointerX,pointerY}=frame.current;
    const [x,y,z]=cameraAt(travel);
    camera.position.set(x+pointerX*.08,y-pointerY*.045,z);
    camera.rotation.set(-.035*Math.sin(travel*.6),.025*Math.sin(travel*.8),.009*Math.sin(travel*Math.PI));
    if(tables.current) {tables.current.visible=travel>.55&&travel<2.1;tables.current.position.x=-Math.sin(clamp(travel-1)*Math.PI)*.8;}
    if(opening.current)opening.current.visible=travel<.72;
    if(ornament.current){ornament.current.visible=travel>4.7&&travel<6.2;ornament.current.rotation.z=(travel-5)*.3;}
    if(key.current){key.current.position.set(3+Math.sin(travel*2)*2,4,z-4);key.current.intensity=35+Math.sin(travel*Math.PI)*8;}
  });
  return <>
    <ambientLight intensity={.8} color="#ddc2a0" />
    <pointLight ref={key} position={[3,4,-4]} color="#ffe0af" intensity={40} distance={24} decay={1.6} />
    <directionalLight position={[-5,3,4]} color="#d2d9df" intensity={1.6} />
    <group ref={opening}><mesh position={[0,0,0]}><planeGeometry args={[4.5,3]} /><meshBasicMaterial map={crop} color="#bfa272" /></mesh></group>
    <group ref={tables}><BeautyTable /></group>
    <group position={[0,0,-44]}><mesh scale={[.7,1,1]}><torusGeometry args={[2.8,.045,12,80]} /><meshStandardMaterial {...gold} /></mesh><mesh scale={[.7,1,1]} position={[0,0,-.04]}><torusGeometry args={[2.9,.012,8,80]} /><meshStandardMaterial {...gold} /></mesh></group>
    {[0,1,2,3,4,5].map(i=><group key={i} position={[(i%2?1:-1)*2.5,0,-52-i*6]} rotation={[0,(i%2?1:-1)*-.1,0]}><mesh><boxGeometry args={[2.7,3.9,.025]} /><meshStandardMaterial color="#6d5637" metalness={.8} roughness={.3} /></mesh><mesh position={[0,0,.02]}><planeGeometry args={[2.63,3.83]} /><meshBasicMaterial color="#100d0a" /></mesh></group>)}
    <group ref={ornament} position={[0,0,-94]}><Jewellery scale={2.5} /></group>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[pigment,3]} /></bufferGeometry><pointsMaterial color="#dcc19b" size={.015} transparent opacity={.35} depthWrite={false} /></points>
  </>;
}

export default function JourneyStage({frame}:{frame:RefObject<JourneyFrame>}) {
  return <div className="journey-stage" aria-hidden="true"><Canvas frameloop="demand" dpr={[1,1.35]} camera={{fov:42,near:.08,far:42,position:[0,0,1.7]}} gl={{alpha:true,antialias:true,powerPreference:"low-power"}}><Suspense fallback={null}><World frame={frame}/></Suspense></Canvas></div>;
}
