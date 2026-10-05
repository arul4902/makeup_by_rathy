"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture.js";
import { Suspense, useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

const vertex = `varying vec2 vUv; uniform float uProgress;
void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.y*3.14159)*sin(uProgress*3.14159)*0.06;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
const fragment = `uniform sampler2D uTexture; uniform float uProgress; varying vec2 vUv;
void main(){vec4 c=texture2D(uTexture,vUv);float sweep=smoothstep(uProgress*1.8-0.5,uProgress*1.8+0.12,vUv.x+sin(vUv.y*14.0)*0.025);float lum=dot(c.rgb,vec3(0.299,0.587,0.114));vec3 shadow=mix(vec3(lum)*vec3(0.72,0.62,0.53),c.rgb,0.65)*0.78;vec3 color=mix(c.rgb,shadow,sweep);gl_FragColor=vec4(color,c.a);
#include <colorspace_fragment>
}`;

function Scene({ active, scatter }: { active: boolean; scatter: boolean }) {
  const { viewport, size } = useThree();
  const texture = useTexture("/media/look-2.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  const group = useRef<THREE.Group>(null);
  const portrait = useRef<THREE.Mesh>(null);
  const powder = useRef<THREE.Points>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const mobile = size.width < 768;
  const positions = useMemo(() => {
    const data = new Float32Array((mobile ? 75 : 300) * 3);
    let seed = 321;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < data.length; i += 3) { data[i] = (rand() - .5) * 18; data[i + 1] = (rand() - .5) * 12; data[i + 2] = (rand() - .5) * 5; }
    return data;
  }, [mobile]);
  const uniforms = useMemo(() => ({ uTexture: { value: texture }, uProgress: { value: 0 } }), [texture]);
  useEffect(() => {
    const move = (e: PointerEvent) => { pointer.current = { x: e.clientX / innerWidth - .5, y: e.clientY / innerHeight - .5 }; };
    const scroll = () => { const el = document.getElementById("home"); if (el) progress.current = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / (el.offsetHeight - innerHeight))); };
    window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("scroll", scroll, { passive: true }); scroll();
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); };
  }, []);
  useFrame((state, delta) => {
    if (!active) return;
    const p = progress.current;
    uniforms.uProgress.value = THREE.MathUtils.damp(uniforms.uProgress.value, p, 4, delta);
    if (group.current) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * .035 + Math.sin(p * Math.PI) * -.06, 3, delta);
    if (portrait.current) portrait.current.scale.setScalar(1 + Math.sin(p * Math.PI) * .045);
    if (powder.current) { powder.current.rotation.z = state.clock.elapsedTime * .007 + p * .12; powder.current.position.z = THREE.MathUtils.damp(powder.current.position.z, p * 1.2 + (scatter ? .9 : 0), 2, delta); powder.current.position.x = pointer.current.x * .15; }
  });
  const height = viewport.height * (mobile ? .68 : .79);
  const width = height * (592 / 798);
  return <>
    <group ref={group} position={[mobile ? viewport.width * .12 : viewport.width * .238, mobile ? -.15 : -.1, 0]}>
      <mesh ref={portrait}><planeGeometry args={[width, height, 12, 12]} /><shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} /></mesh>
    </group>
    <points ref={powder}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#e7d2b5" size={mobile ? .012 : .016} transparent opacity={.43} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} /></points>
  </>;
}

export default function HeroScene({ scatter }: { scatter: boolean }) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = document.getElementById("home"); if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && !document.hidden));
    const visibility = () => setActive(!document.hidden && el.getBoundingClientRect().bottom > 0);
    observer.observe(el); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className="hero-webgl" aria-hidden="true"><Canvas dpr={[1, 1.5]} frameloop={active ? "always" : "never"} camera={{ position: [0, 0, 8], fov: 40 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}><Suspense fallback={null}><Scene active={active} scatter={scatter} /></Suspense></Canvas></div>;
}
