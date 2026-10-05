"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// Vertex shader for the bridal portrait plane
const portraitVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
uniform float uProgress;
uniform vec2 uPointer;

void main() {
  vUv = uv;
  vec3 p = position;
  // Subtle 2.5D breathing motion that preserves facial geometry without distortion
  float breath = sin(uProgress * 3.14159) * 0.03;
  p.z += breath * (1.0 - length(uv - 0.5));
  vPosition = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

// Fragment shader: paints the bride into existence with an organic feathered brush sweep,
// cosmetic powder grain, and soft blush-toned perimeter
const portraitFragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDetailEyes;
uniform sampler2D uDetailJewel;
uniform sampler2D uDetailHair;
uniform float uProgress;
uniform float uSweep;
uniform float uExpansion;
uniform float uCloseupPhase;
varying vec2 vUv;
varying vec3 vPosition;

// Subtle pseudo-random grain
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // Base bridal photo
  vec4 baseColor = texture2D(uTexture, vUv);

  // Closeups textures blending during closeup phase
  vec4 eyeColor = texture2D(uDetailEyes, vUv);
  vec4 jewelColor = texture2D(uDetailJewel, vUv);
  vec4 hairColor = texture2D(uDetailHair, vUv);

  vec4 targetPhoto = baseColor;
  if (uCloseupPhase > 0.05 && uCloseupPhase < 0.38) {
    float f = smoothstep(0.05, 0.18, uCloseupPhase) * (1.0 - smoothstep(0.28, 0.38, uCloseupPhase));
    targetPhoto = mix(targetPhoto, eyeColor, f);
  } else if (uCloseupPhase >= 0.38 && uCloseupPhase < 0.70) {
    float f = smoothstep(0.38, 0.50, uCloseupPhase) * (1.0 - smoothstep(0.60, 0.70, uCloseupPhase));
    targetPhoto = mix(targetPhoto, jewelColor, f);
  } else if (uCloseupPhase >= 0.70 && uCloseupPhase < 0.98) {
    float f = smoothstep(0.70, 0.82, uCloseupPhase) * (1.0 - smoothstep(0.90, 0.98, uCloseupPhase));
    targetPhoto = mix(targetPhoto, hairColor, f);
  }

  // Brush sweep reveal calculation:
  // An organic curved sweep across the UV space:
  // Starts top-left (0.2, 0.8) curving down across center to (0.8, 0.2)
  vec2 sweepOrigin = vec2(0.15 + uSweep * 0.7, 0.85 - uSweep * 0.7);
  float distToSweep = length(vUv - sweepOrigin);

  // Organic wave distortion for realistic bristle texture
  float wave = sin(vUv.y * 28.0 + vUv.x * 14.0) * 0.035;
  float grain = (hash(vUv * 250.0) - 0.5) * 0.03;

  // Reveal factor based on sweep progress + smooth radial expansion
  float strokeReveal = smoothstep(0.45 + wave + grain, -0.05, distToSweep - (uSweep * 1.35));
  float expansionReveal = smoothstep(0.0, 0.75, uExpansion);
  float totalReveal = clamp(max(strokeReveal, expansionReveal), 0.0, 1.0);

  // Soft cosmetic powder fringe: warm blush tone #D9B8B0 along the feathered reveal edge
  float edge = smoothstep(0.01, 0.22, totalReveal) * (1.0 - smoothstep(0.22, 0.92, totalReveal));
  vec3 blushPowder = vec3(0.85, 0.72, 0.69); // #D9B8B0
  vec3 finalRgb = mix(targetPhoto.rgb, blushPowder, edge * 0.32);

  // Warm studio light sweep across the photo
  float lightSweep = exp(-pow((vUv.x + vUv.y * 0.5) - (uProgress * 1.6), 2.0) * 8.0) * 0.14;
  finalRgb += vec3(lightSweep * 0.95, lightSweep * 0.88, lightSweep * 0.75);

  gl_FragColor = vec4(finalRgb, totalReveal);
  #include <colorspace_fragment>
}
`;

// Procedural Jasmine Petal Geometry
function JasminePetal({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 5 delicate ivory petals */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, 0]} rotation={[0.1, 0.1, angle]}>
            <coneGeometry args={[0.07, 0.22, 16]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.7} metalness={0.05} />
          </mesh>
        );
      })}
      {/* Tiny soft golden pistil */}
      <mesh position={[0, 0, 0.03]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#E8D6BA" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

// Highly polished 3D Luxury Makeup Brush
function LuxuryMakeupBrush({ progress, pointer }: { progress: number; pointer: { x: number; y: number } }) {
  const brushGroup = useRef<THREE.Group>(null);
  const ferruleMesh = useRef<THREE.Mesh>(null);

  // Brush travels along a graceful curve:
  // 0.00 -> 0.15: Enters from top-right outside frame
  // 0.15 -> 0.45: Sweeps across the portrait
  // 0.45 -> 0.65: Glides out of focus
  useFrame((_, delta) => {
    if (!brushGroup.current) return;

    let targetX = 4.2;
    let targetY = 2.8;
    let targetZ = 0.5;
    let rotX = 0.4;
    let rotY = -0.3;
    let rotZ = 0.6;
    let opacity = 0;

    if (progress < 0.12) {
      // Entering from outside top-right
      const t = THREE.MathUtils.smoothstep(progress, 0.0, 0.12);
      targetX = THREE.MathUtils.lerp(4.0, 2.2, t);
      targetY = THREE.MathUtils.lerp(2.8, 1.4, t);
      targetZ = THREE.MathUtils.lerp(0.8, 0.4, t);
      rotZ = THREE.MathUtils.lerp(0.9, 0.45, t);
      opacity = t;
    } else if (progress < 0.45) {
      // Signature brush reveal sweep across the bridal photo
      const t = THREE.MathUtils.smoothstep(progress, 0.12, 0.45);
      // Sweeping in an elegant arc
      targetX = THREE.MathUtils.lerp(1.8, -1.2, t) + Math.sin(t * Math.PI) * 0.35;
      targetY = THREE.MathUtils.lerp(1.2, -1.1, t) + Math.cos(t * Math.PI) * 0.25;
      targetZ = 0.25 + Math.sin(t * Math.PI) * 0.15;
      rotX = 0.35 + Math.sin(t * Math.PI) * 0.2;
      rotY = -0.25 + Math.cos(t * Math.PI) * 0.2;
      rotZ = THREE.MathUtils.lerp(0.45, -0.2, t);
      opacity = 1;
    } else if (progress < 0.62) {
      // Gliding away gracefully as photo expands
      const t = THREE.MathUtils.smoothstep(progress, 0.45, 0.62);
      targetX = THREE.MathUtils.lerp(-1.2, -3.8, t);
      targetY = THREE.MathUtils.lerp(-1.1, -2.4, t);
      targetZ = THREE.MathUtils.lerp(0.25, -0.5, t);
      rotZ = THREE.MathUtils.lerp(-0.2, -0.7, t);
      opacity = 1 - t;
    } else {
      // Out of frame
      targetX = -5.0;
      opacity = 0;
    }

    // Add subtle pointer influence for organic responsiveness
    targetX += pointer.x * 0.2;
    targetY -= pointer.y * 0.2;

    brushGroup.current.position.x = THREE.MathUtils.damp(brushGroup.current.position.x, targetX, 5, delta);
    brushGroup.current.position.y = THREE.MathUtils.damp(brushGroup.current.position.y, targetY, 5, delta);
    brushGroup.current.position.z = THREE.MathUtils.damp(brushGroup.current.position.z, targetZ, 5, delta);

    brushGroup.current.rotation.x = THREE.MathUtils.damp(brushGroup.current.rotation.x, rotX, 5, delta);
    brushGroup.current.rotation.y = THREE.MathUtils.damp(brushGroup.current.rotation.y, rotY, 5, delta);
    brushGroup.current.rotation.z = THREE.MathUtils.damp(brushGroup.current.rotation.z, rotZ, 5, delta);

    // Subtle specular gleam across metallic ferrule
    if (ferruleMesh.current) {
      (ferruleMesh.current.material as THREE.MeshStandardMaterial).roughness = 0.18 + Math.sin(progress * 12.0) * 0.05;
    }

    brushGroup.current.visible = opacity > 0.01;
  });

  return (
    <group ref={brushGroup} position={[4, 2.5, 0.5]}>
      {/* Lacquered luxury handle in deep espresso */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.075, 0.05, 1.85, 32]} />
        <meshPhysicalMaterial
          color="#2C211C"
          roughness={0.18}
          metalness={0.12}
          clearcoat={0.92}
          clearcoatRoughness={0.1}
          reflectivity={0.8}
        />
      </mesh>

      {/* Polished champagne gold ferrule */}
      <mesh ref={ferruleMesh} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.13, 0.082, 0.55, 32]} />
        <meshStandardMaterial
          color="#DFC69C"
          metalness={0.92}
          roughness={0.2}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Soft dual-toned tapered bristles */}
      {/* Base bristle body in soft cosmetic champagne blush */}
      <mesh position={[0, 0.52, 0]} scale={[1, 1.25, 0.88]}>
        <cylinderGeometry args={[0.18, 0.125, 0.32, 28]} />
        <meshStandardMaterial color="#D6B8A2" roughness={0.96} metalness={0.02} />
      </mesh>
      {/* Silky ivory bristle tip */}
      <mesh position={[0, 0.78, 0]} scale={[1, 1.35, 0.86]}>
        <sphereGeometry args={[0.19, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
        <meshStandardMaterial color="#FFF9F2" roughness={0.98} metalness={0.01} />
      </mesh>

      {/* Gentle soft contact shadow under brush */}
      <mesh position={[0, 0, -0.3]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 2.2]} />
        <meshBasicMaterial color="#49382F" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 3D Scene containing all elements inside the Light Canvas
function Scene({ progress }: { progress: number }) {
  const { viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const portraitMesh = useRef<THREE.Mesh>(null);
  const portraitGroup = useRef<THREE.Group>(null);
  const floatingGroup = useRef<THREE.Group>(null);
  const typographyGroup = useRef<THREE.Group>(null);

  // Load bridal images
  const loader = useMemo(() => new THREE.TextureLoader(), []);
  const texture = useMemo(() => {
    const t = loader.load("/media/look-2.webp");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [loader]);
  const textureEyes = useMemo(() => {
    const t = loader.load("/media/look-2.webp");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [loader]);
  const textureJewel = useMemo(() => {
    const t = loader.load("/media/look-3.webp");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [loader]);
  const textureHair = useMemo(() => {
    const t = loader.load("/media/look-6.webp");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [loader]);

  // Fine cosmetic powder particles
  const powderData = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    return positions;
  }, []);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uDetailEyes: { value: textureEyes },
    uDetailJewel: { value: textureJewel },
    uDetailHair: { value: textureHair },
    uProgress: { value: 0 },
    uSweep: { value: 0 },
    uExpansion: { value: 0 },
    uCloseupPhase: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
  }), [texture, textureEyes, textureJewel, textureHair]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / innerWidth - 0.5) * 2,
        y: (e.clientY / innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const p = progress;
    uniforms.uProgress.value = p;

    // Sweep progress: 0.15 -> 0.45
    const sweep = THREE.MathUtils.smoothstep(p, 0.15, 0.45);
    uniforms.uSweep.value = sweep;

    // Expansion progress: 0.42 -> 0.65
    const expansion = THREE.MathUtils.smoothstep(p, 0.42, 0.65);
    uniforms.uExpansion.value = expansion;

    // Closeup phase: 0.65 -> 0.85
    const closeup = THREE.MathUtils.smoothstep(p, 0.65, 0.85);
    uniforms.uCloseupPhase.value = closeup;

    // Subtle 2.5D tilt of the portrait plane following mouse and scroll
    if (portraitGroup.current) {
      const targetRotY = pointer.current.x * 0.045 + Math.sin(p * Math.PI) * 0.03;
      const targetRotX = -pointer.current.y * 0.035;
      portraitGroup.current.rotation.y = THREE.MathUtils.damp(portraitGroup.current.rotation.y, targetRotY, 4, delta);
      portraitGroup.current.rotation.x = THREE.MathUtils.damp(portraitGroup.current.rotation.x, targetRotX, 4, delta);

      // Scale expansion from initial reveal frame to 65% editorial portrait
      const scale = THREE.MathUtils.lerp(0.85, 1.05, expansion);
      portraitGroup.current.scale.set(scale, scale, 1);

      // Settle smoothly into final hero layout towards p >= 0.85
      const settleX = THREE.MathUtils.lerp(0.4, 0.0, THREE.MathUtils.smoothstep(p, 0.85, 1.0));
      portraitGroup.current.position.x = THREE.MathUtils.damp(portraitGroup.current.position.x, settleX, 4, delta);
    }

    // Floating bridal details parallax movement
    if (floatingGroup.current) {
      floatingGroup.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.05 + p * 0.2;
      floatingGroup.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.08 - p * 0.4;
      floatingGroup.current.position.x = pointer.current.x * 0.12;
    }

    // 3D Typography parallax (placed behind the bride)
    if (typographyGroup.current) {
      // Moves at different speed from bride, creating layered 3D depth
      typographyGroup.current.position.y = -0.3 + p * 0.6;
      typographyGroup.current.position.x = pointer.current.x * -0.08;
    }
  });

  // Calculate editorial portrait dimensions
  const isMobile = viewport.width < 7.5;
  const portraitHeight = viewport.height * (isMobile ? 0.62 : 0.72);
  const portraitWidth = portraitHeight * (592 / 798);

  return (
    <>
      {/* Diffused Luxury Studio Lighting */}
      <ambientLight intensity={1.25} color="#FFFBF5" />
      <directionalLight position={[4, 5, 4]} intensity={1.8} color="#FFF3E2" />
      <directionalLight position={[-4, 2, 2]} intensity={0.9} color="#F7ECE1" />
      {/* Specular champagne point light creating subtle reflections */}
      <pointLight position={[1, 2, 2.5]} intensity={1.4} color="#E8D6BA" distance={10} />

      {/* Floating 3D Typography Moment: "ARTISTRY" layered behind the bride */}
      <group ref={typographyGroup} position={[0, 0, -0.6]}>
        {/* Subtle 3D background plane for the typography shadow / atmosphere */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
          <meshBasicMaterial color="#FBF8F3" />
        </mesh>
      </group>

      {/* Main Bridal Portrait Group */}
      <group ref={portraitGroup} position={[isMobile ? 0 : 0.4, -0.05, 0]}>
        {/* Soft realistic drop shadow behind the photograph */}
        <mesh position={[0, -0.08, -0.05]}>
          <planeGeometry args={[portraitWidth * 1.04, portraitHeight * 1.04]} />
          <meshBasicMaterial color="#49382F" transparent opacity={0.07} />
        </mesh>

        {/* Delicate champagne accent border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[portraitWidth + 0.05, portraitHeight + 0.05]} />
          <meshStandardMaterial color="#E8D6BA" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* The Bridal Portrait Plane with custom feathered brush shader */}
        <mesh ref={portraitMesh}>
          <planeGeometry args={[portraitWidth, portraitHeight, 16, 16]} />
          <shaderMaterial
            vertexShader={portraitVertexShader}
            fragmentShader={portraitFragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>
      </group>

      {/* 3D Luxury Makeup Brush */}
      <LuxuryMakeupBrush progress={progress} pointer={pointer.current} />

      {/* Floating Bridal Depth Elements (Jasmine petals, delicate gold ornaments) */}
      <group ref={floatingGroup} position={[0, 0, 0.4]}>
        <JasminePetal position={[-2.4, 1.8, 0.6]} rotation={[0.2, 0.4, 0.8]} scale={1.1} />
        <JasminePetal position={[2.6, -1.4, 0.9]} rotation={[-0.3, 0.2, 1.4]} scale={0.9} />
        <JasminePetal position={[-1.8, -1.9, -0.3]} rotation={[0.4, -0.3, 2.1]} scale={0.8} />
        <JasminePetal position={[2.2, 2.1, -0.2]} rotation={[0.1, 0.5, 0.3]} scale={1.0} />

        {/* Delicate golden heirloom gem glint */}
        <group position={[2.1, 0.6, 0.3]} rotation={[0.2, 0.4, 0]}>
          <mesh scale={[0.6, 1, 0.5]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color="#E8D6BA" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* Fine Cosmetic Powder Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[powderData, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#D9B8B0"
          size={isMobile ? 0.016 : 0.022}
          transparent
          opacity={0.38}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </>
  );
}

export default function LuxuryHeroCanvas({ progress }: { progress: number }) {
  return (
    <div className="luxury-hero-canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
