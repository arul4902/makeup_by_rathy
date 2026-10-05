"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ========================================================
// 1. BILLOWING SHEER CURTAIN (Translucent Organza in Breeze)
// ========================================================
function SheerCurtain({ position, scale = [1, 1, 1] }: { position: [number, number, number]; scale?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Custom vertex displacement for soft wind breathing
  useFrame((state) => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry as THREE.PlaneGeometry;
    const pos = geom.attributes.position;
    const time = state.clock.elapsedTime * 0.9;

    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + 1.5) / 3;
      const v = (pos.getY(i) + 2.5) / 5;
      // Gentle wind flutter, stronger towards bottom and inner edge
      const wave = Math.sin(time + v * 3.5 + u * 2.0) * 0.12 * v +
                   Math.cos(time * 1.4 + u * 4.0) * 0.05 * v;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[2.8, 5.2, 24, 36]} />
      <meshPhysicalMaterial
        color="#FFFDF9"
        transmission={0.88}
        opacity={0.85}
        transparent
        roughness={0.42}
        metalness={0.05}
        ior={1.25}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ========================================================
// 2. VOLUMETRIC SUNLIGHT BEAMS (Golden Hour Light Shafts)
// ========================================================
function SunRays({ intensity = 1 }: { intensity?: number }) {
  const rayGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (rayGroup.current) {
      // Very slow breathing shimmer
      const shimmer = Math.sin(state.clock.elapsedTime * 0.6) * 0.08 + 1.0;
      rayGroup.current.scale.set(shimmer, 1, shimmer);
    }
  });

  return (
    <group ref={rayGroup} position={[-2.8, 2.6, -1.2]} rotation={[0.42, 0.65, -0.32]}>
      {/* Primary diagonal sunbeam shaft */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.7, 2.4, 6.5, 32, 1, true]} />
        <meshBasicMaterial
          color="#FFE8C2"
          transparent
          opacity={0.16 * intensity}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary softer core beam */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.35, 1.6, 5.8, 24, 1, true]} />
        <meshBasicMaterial
          color="#FFF2DF"
          transparent
          opacity={0.24 * intensity}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ========================================================
// 3. CRYSTAL BRIDAL TIARA (High-Refractive Specular Sparkle)
// ========================================================
function CrystalTiara({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const tiaraRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (tiaraRef.current) {
      // Subtle micro-sway catching sunlight
      tiaraRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.035;
    }
  });

  // Generate delicate crystal stones
  const crystals = useMemo(() => {
    return Array.from({ length: 17 }, (_, i) => {
      const angle = (i / 16 - 0.5) * Math.PI * 0.68;
      const radius = 0.52;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - radius * 0.8;
      const heightScale = Math.cos(angle) * (i % 2 === 0 ? 1.0 : 0.68);
      return { x, z, angle, heightScale, isCenter: i === 8 };
    });
  }, []);

  return (
    <group ref={tiaraRef} position={position} scale={scale} rotation={[0.08, -0.15, 0]}>
      {/* Champagne gold arch band */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.016, 16, 64, Math.PI * 0.72]} />
        <meshStandardMaterial color="#DFC69C" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Crystal stone clusters */}
      {crystals.map((c, i) => (
        <group key={i} position={[c.x, 0.04 + c.heightScale * 0.07, c.z]} rotation={[0, -c.angle, 0]}>
          {/* Marquise / teardrop faceted crystal */}
          <mesh scale={[0.045, 0.09 * c.heightScale, 0.035]}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color="#FFFDF9"
              transmission={0.96}
              opacity={0.98}
              transparent
              roughness={0.05}
              metalness={0.08}
              ior={2.3}
              reflectivity={0.95}
              clearcoat={1.0}
              clearcoatRoughness={0.04}
            />
          </mesh>
          {/* Small diamond prong base in champagne gold */}
          <mesh position={[0, -0.05 * c.heightScale, 0]} scale={[0.02, 0.02, 0.02]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Velvet cushion stand under the tiara */}
      <mesh position={[0, -0.06, -0.08]} scale={[0.85, 0.12, 0.65]}>
        <cylinderGeometry args={[0.55, 0.58, 0.35, 32]} />
        <meshStandardMaterial color="#F5EFE7" roughness={0.88} />
      </mesh>
    </group>
  );
}

// ========================================================
// 4. ILLUMINATED VANITY TABLE & MIRROR
// ========================================================
function StudioVanity({ position }: { position: [number, number, number] }) {
  // Vanity bulbs positioned around mirror arch
  const bulbs = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 8) * Math.PI;
      const rx = 1.15;
      const ry = 1.45;
      return {
        x: Math.cos(angle) * rx,
        y: Math.sin(angle) * ry + 0.3,
        z: 0.06,
      };
    });
  }, []);

  return (
    <group position={position}>
      {/* --- Vanity Table Top (Polished Ivory Marble) --- */}
      <mesh position={[0, -0.02, 0.15]}>
        <boxGeometry args={[3.2, 0.08, 1.4]} />
        <meshPhysicalMaterial
          color="#FAF7F2"
          roughness={0.16}
          metalness={0.05}
          reflectivity={0.65}
          clearcoat={0.9}
        />
      </mesh>

      {/* Table apron & champagne gold fluted trim */}
      <mesh position={[0, -0.1, 0.15]}>
        <boxGeometry args={[3.16, 0.08, 1.36]} />
        <meshStandardMaterial color="#E8D6BA" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Table Legs in champagne brass */}
      {[
        [-1.48, -0.65, 0.72],
        [1.48, -0.65, 0.72],
        [-1.48, -0.65, -0.45],
        [1.48, -0.65, -0.45],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.035, 0.025, 1.1, 16]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* --- Large Arched Vanity Mirror --- */}
      <group position={[0, 1.25, -0.45]}>
        {/* Mirror Frame (Champagne Gold) */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.035, 16, 64, Math.PI]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Mirror rectangular lower frame */}
        <mesh position={[-1.2, -0.6, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.2, 16]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[1.2, -0.6, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.2, 16]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 2.4, 16]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Mirror Reflective Surface */}
        <mesh position={[0, -0.25, -0.01]}>
          <planeGeometry args={[2.36, 2.1]} />
          <meshPhysicalMaterial
            color="#FFFBF5"
            metalness={0.95}
            roughness={0.08}
            reflectivity={0.98}
            clearcoat={1.0}
          />
        </mesh>

        {/* Vanity Bulbs with soft warm bloom glow */}
        {bulbs.map((b, i) => (
          <group key={i} position={[b.x, b.y, b.z]}>
            {/* Glowing bulb core */}
            <mesh>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial
                color="#FFEEC7"
                emissive="#FFE0A0"
                emissiveIntensity={2.8}
                roughness={0.15}
              />
            </mesh>
            {/* Warm bokeh halo plane */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.42, 0.42]} />
              <meshBasicMaterial
                color="#FFDE9A"
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- Tabletop Cosmetics & Props --- */}
      {/* 1. Rose Gold Compact (Open) */}
      <group position={[0.75, 0.08, 0.32]} rotation={[0, -0.35, 0]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.035, 32]} />
          <meshStandardMaterial color="#D8A996" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* Powder cake inside */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.015, 32]} />
          <meshStandardMaterial color="#D9B8B0" roughness={0.95} />
        </mesh>
        {/* Open Lid */}
        <group position={[0, 0.02, -0.22]} rotation={[-1.15, 0, 0]}>
          <mesh position={[0, 0, 0.22]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
            <meshStandardMaterial color="#D8A996" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.012, 0.22]}>
            <cylinderGeometry args={[0.19, 0.19, 0.005, 32]} />
            <meshPhysicalMaterial color="#FFF" metalness={0.98} roughness={0.05} />
          </mesh>
        </group>
      </group>

      {/* 2. Luxury Lipstick */}
      <group position={[0.42, 0.12, 0.45]} rotation={[0, 0.2, 0]}>
        {/* Tube base */}
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.18, 20]} />
          <meshStandardMaterial color="#2B211C" metalness={0.2} roughness={0.2} />
        </mesh>
        {/* Gold sleeve */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.07, 20]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Crimson bullet */}
        <mesh position={[0, 0.18, 0]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.032, 0.11, 16]} />
          <meshStandardMaterial color="#8E2A38" roughness={0.4} />
        </mesh>
      </group>

      {/* 3. Luxury Perfume Flacon (Clear Glass + Gold Cap) */}
      <group position={[-0.85, 0.2, 0.15]}>
        {/* Faceted glass bottle */}
        <mesh>
          <boxGeometry args={[0.24, 0.32, 0.18]} />
          <meshPhysicalMaterial
            color="#FFFBF5"
            transmission={0.95}
            roughness={0.06}
            ior={1.52}
            clearcoat={1.0}
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Golden perfume liquid inside */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.2, 0.24, 0.14]} />
          <meshBasicMaterial color="#E8C896" transparent opacity={0.65} />
        </mesh>
        {/* Gold collar & atomizer cap */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
          <meshStandardMaterial color="#DFC69C" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* 4. Strand of Luminous Pearls */}
      <group position={[0.05, 0.03, 0.52]} rotation={[0, 0.3, 0]}>
        {Array.from({ length: 18 }, (_, i) => {
          const t = i / 17;
          const x = (t - 0.5) * 0.65 + Math.sin(t * Math.PI) * 0.08;
          const z = Math.cos(t * Math.PI * 1.5) * 0.09;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshPhysicalMaterial
                color="#FFFDF9"
                roughness={0.18}
                metalness={0.1}
                clearcoat={0.95}
                reflectivity={0.9}
              />
            </mesh>
          );
        })}
      </group>

      {/* 5. Crystal Bridal Tiara placed on left side of vanity */}
      <CrystalTiara position={[-0.45, 0.08, 0.38]} scale={0.88} />
    </group>
  );
}

// ========================================================
// 5. TRANSLUCENT BRIDAL VEIL (Dreamy Soft Cloth Transition)
// ========================================================
function FloatingVeil({ progress }: { progress: number }) {
  const veilMesh = useRef<THREE.Mesh>(null);

  // During Scene 06 (0.46 -> 0.56), the veil floats across the camera lens
  useFrame((state) => {
    if (!veilMesh.current) return;
    const geom = veilMesh.current.geometry as THREE.PlaneGeometry;
    const pos = geom.attributes.position;
    const time = state.clock.elapsedTime * 0.8;

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const wave = Math.sin(time + u * 1.8 + v * 2.2) * 0.22 +
                   Math.cos(time * 1.3 + v * 3.0) * 0.1;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    // Position tracks progress:
    // Enters from right at 0.44, crosses center around 0.50, exits left at 0.58
    if (progress >= 0.42 && progress <= 0.62) {
      const t = (progress - 0.42) / 0.2;
      veilMesh.current.position.x = THREE.MathUtils.lerp(3.2, -3.2, t);
      veilMesh.current.position.z = THREE.MathUtils.lerp(1.8, 1.2, Math.sin(t * Math.PI));
      veilMesh.current.visible = true;
    } else {
      veilMesh.current.visible = false;
    }
  });

  return (
    <mesh ref={veilMesh} position={[3.2, 1.2, 1.5]} rotation={[0.1, -0.2, 0.15]}>
      <planeGeometry args={[4.2, 3.2, 28, 28]} />
      <meshPhysicalMaterial
        color="#FFFDF9"
        transmission={0.92}
        opacity={0.85}
        transparent
        roughness={0.35}
        ior={1.22}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ========================================================
// 6. HERO MAKEUP BRUSH & BRUSH REVEAL SHADER (Scene 08 & 09)
// ========================================================
const bridalRevealVertex = `
varying vec2 vUv;
varying vec3 vWorldPos;
uniform float uProgress;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const bridalRevealFragment = `
uniform sampler2D uBrideBase;
uniform sampler2D uBrideEyes;
uniform sampler2D uBrideJewel;
uniform sampler2D uBrideHair;
uniform sampler2D uBrideFinal;

uniform float uProgress;
uniform float uSweepProgress;
uniform float uMontagePhase;
uniform float uExposure;
varying vec2 vUv;
varying vec3 vWorldPos;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec4 basePhoto = texture2D(uBrideBase, vUv);
  vec4 eyesPhoto = texture2D(uBrideEyes, vUv);
  vec4 jewelPhoto = texture2D(uBrideJewel, vUv);
  vec4 hairPhoto = texture2D(uBrideHair, vUv);
  vec4 finalPhoto = texture2D(uBrideFinal, vUv);

  // Montage transitions (Scene 11): 0.88 -> 0.94
  vec4 currentPhoto = basePhoto;
  if (uMontagePhase > 0.05 && uMontagePhase < 0.35) {
    float f = smoothstep(0.05, 0.18, uMontagePhase) * (1.0 - smoothstep(0.25, 0.35, uMontagePhase));
    currentPhoto = mix(currentPhoto, eyesPhoto, f);
  } else if (uMontagePhase >= 0.35 && uMontagePhase < 0.65) {
    float f = smoothstep(0.35, 0.48, uMontagePhase) * (1.0 - smoothstep(0.55, 0.65, uMontagePhase));
    currentPhoto = mix(currentPhoto, jewelPhoto, f);
  } else if (uMontagePhase >= 0.65 && uMontagePhase < 0.95) {
    float f = smoothstep(0.65, 0.78, uMontagePhase) * (1.0 - smoothstep(0.85, 0.95, uMontagePhase));
    currentPhoto = mix(currentPhoto, hairPhoto, f);
  } else if (uMontagePhase >= 0.95) {
    currentPhoto = mix(currentPhoto, finalPhoto, smoothstep(0.95, 1.0, uMontagePhase));
  }

  // Brush sweep reveal (Scene 09):
  // Curved sweep starting top-left heading diagonally across
  vec2 sweepPath = vec2(0.12 + uSweepProgress * 0.76, 0.88 - uSweepProgress * 0.76);
  float distToSweep = length(vUv - sweepPath);

  float organicWave = sin(vUv.y * 32.0 + vUv.x * 16.0) * 0.04;
  float grainNoise = (hash(vUv * 320.0) - 0.5) * 0.035;

  // Reveal factor
  float strokeMask = smoothstep(0.48 + organicWave + grainNoise, -0.05, distToSweep - (uSweepProgress * 1.45));
  float fullBloom = smoothstep(0.82, 0.98, uSweepProgress);
  float totalReveal = clamp(max(strokeMask, fullBloom), 0.0, 1.0);

  // Soft cosmetic powder edge (warm blush #D9B8B0)
  float powderFringe = smoothstep(0.02, 0.25, totalReveal) * (1.0 - smoothstep(0.25, 0.95, totalReveal));
  vec3 blushTone = vec3(0.85, 0.72, 0.69); // #D9B8B0
  vec3 outputRgb = mix(currentPhoto.rgb, blushTone, powderFringe * 0.38);

  // Golden hour specular sweep across portrait
  float specularGlance = exp(-pow((vUv.x * 0.8 + vUv.y * 0.4) - (uProgress * 1.5), 2.0) * 10.0) * 0.18;
  outputRgb += vec3(specularGlance * 1.0, specularGlance * 0.9, specularGlance * 0.75);

  gl_FragColor = vec4(outputRgb, totalReveal);
  #include <colorspace_fragment>
}
`;

function HeroBrushAndPortrait({ progress }: { progress: number }) {
  const brushGroup = useRef<THREE.Group>(null);
  const portraitMesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const loader = useMemo(() => new THREE.TextureLoader(), []);
  const textures = useMemo(() => {
    const tBase = loader.load("/media/look-2.webp");
    tBase.colorSpace = THREE.SRGBColorSpace;
    const tEyes = loader.load("/media/look-2.webp");
    tEyes.colorSpace = THREE.SRGBColorSpace;
    const tJewel = loader.load("/media/look-3.webp");
    tJewel.colorSpace = THREE.SRGBColorSpace;
    const tHair = loader.load("/media/look-6.webp");
    tHair.colorSpace = THREE.SRGBColorSpace;
    const tFinal = loader.load("/media/look-5.webp");
    tFinal.colorSpace = THREE.SRGBColorSpace;
    return { tBase, tEyes, tJewel, tHair, tFinal };
  }, [loader]);

  const uniforms = useMemo(() => ({
    uBrideBase: { value: textures.tBase },
    uBrideEyes: { value: textures.tEyes },
    uBrideJewel: { value: textures.tJewel },
    uBrideHair: { value: textures.tHair },
    uBrideFinal: { value: textures.tFinal },
    uProgress: { value: 0 },
    uSweepProgress: { value: 0 },
    uMontagePhase: { value: 0 },
    uExposure: { value: 1.0 },
  }), [textures]);

  useFrame((_, delta) => {
    uniforms.uProgress.value = progress;

    // Brush paint sweep (Scene 09): active between 0.68 and 0.84
    const sweep = THREE.MathUtils.smoothstep(progress, 0.68, 0.84);
    uniforms.uSweepProgress.value = sweep;

    // Beauty montage (Scene 11): 0.86 to 0.96
    const montage = THREE.MathUtils.smoothstep(progress, 0.86, 0.96);
    uniforms.uMontagePhase.value = montage;

    // Hero Makeup Brush Tracking
    if (brushGroup.current) {
      if (progress >= 0.62 && progress <= 0.85) {
        brushGroup.current.visible = true;
        const t = (progress - 0.62) / 0.23;
        // Brush sweeps in from top-right and tracks across the portrait plane
        const bx = THREE.MathUtils.lerp(2.2, -1.1, t) + Math.sin(t * Math.PI) * 0.3;
        const by = THREE.MathUtils.lerp(1.6, -0.9, t) + Math.cos(t * Math.PI) * 0.25;
        const bz = THREE.MathUtils.lerp(0.5, 0.15, Math.sin(t * Math.PI));

        brushGroup.current.position.x = THREE.MathUtils.damp(brushGroup.current.position.x, bx, 6, delta);
        brushGroup.current.position.y = THREE.MathUtils.damp(brushGroup.current.position.y, by, 6, delta);
        brushGroup.current.position.z = THREE.MathUtils.damp(brushGroup.current.position.z, bz, 6, delta);

        brushGroup.current.rotation.z = THREE.MathUtils.lerp(0.5, -0.25, t);
        brushGroup.current.rotation.x = 0.35 + Math.sin(t * Math.PI) * 0.15;
      } else {
        brushGroup.current.visible = false;
      }
    }

    // Portrait Plane positioning and subtle 2.5D scaling
    if (portraitMesh.current) {
      if (progress >= 0.66) {
        portraitMesh.current.visible = true;
        // Subtle dolly expansion into final 16:9 editorial hero frame
        const scale = THREE.MathUtils.lerp(0.9, 1.06, THREE.MathUtils.smoothstep(progress, 0.75, 1.0));
        portraitMesh.current.scale.set(scale, scale, 1);
      } else {
        portraitMesh.current.visible = false;
      }
    }
  });

  const isMobile = viewport.width < 7.5;
  const pHeight = viewport.height * (isMobile ? 0.65 : 0.74);
  const pWidth = pHeight * (592 / 798);

  return (
    <group position={[isMobile ? 0 : 0.35, 0.05, 0]}>
      {/* Bridal Portrait Plane with custom reveal shader */}
      <mesh ref={portraitMesh} position={[0, 0, 0]}>
        <planeGeometry args={[pWidth, pHeight, 16, 16]} />
        <shaderMaterial
          vertexShader={bridalRevealVertex}
          fragmentShader={bridalRevealFragment}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Hero Makeup Brush */}
      <group ref={brushGroup} position={[2.5, 2, 0.5]}>
        {/* Lacquered luxury handle in deep espresso with rose-gold dip */}
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.08, 0.055, 1.9, 32]} />
          <meshPhysicalMaterial
            color="#2A201A"
            roughness={0.16}
            metalness={0.15}
            clearcoat={0.95}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Polished Rose-Gold / Champagne metallic ferrule */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.135, 0.088, 0.6, 32]} />
          <meshStandardMaterial
            color="#DFC69C"
            metalness={0.94}
            roughness={0.18}
            envMapIntensity={1.8}
          />
        </mesh>
        {/* Soft tapered dual-tone bristles */}
        <mesh position={[0, 0.58, 0]} scale={[1, 1.3, 0.88]}>
          <cylinderGeometry args={[0.185, 0.13, 0.35, 28]} />
          <meshStandardMaterial color="#D6B8A2" roughness={0.98} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.84, 0]} scale={[1, 1.38, 0.86]}>
          <sphereGeometry args={[0.195, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
          <meshStandardMaterial color="#FFF9F2" roughness={0.98} metalness={0.01} />
        </mesh>
      </group>
    </group>
  );
}

// ========================================================
// 7. ATMOSPHERIC GOLDEN COSMETIC DUST
// ========================================================
function GoldenAtmosphericDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime * 0.06;
    pointsRef.current.rotation.y = time * 0.4;
    pointsRef.current.rotation.x = Math.sin(time) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#F2D7B3"
        size={0.024}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ========================================================
// MASTER CINEMATIC STUDIO COMPONENT
// ========================================================
export default function CinematicStudio({ progress }: { progress: number }) {
  // studio opacity: fades gracefully as progress approaches 1.0 for seamless release
  const studioOpacity = progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) / 0.12) : 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Studio Room Architecture */}
      <group visible={studioOpacity > 0.02}>
        {/* Soft warm ivory back wall */}
        <mesh position={[0, 1.8, -3.2]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial color="#FAF6F0" roughness={0.7} />
        </mesh>

        {/* Polished studio floor with soft reflections */}
        <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 12]} />
          <meshPhysicalMaterial
            color="#F5EFE7"
            roughness={0.22}
            metalness={0.08}
            reflectivity={0.65}
            clearcoat={0.8}
          />
        </mesh>

        {/* Left Studio Window with Sheer Billowing Curtains */}
        <SheerCurtain position={[-3.6, 1.4, -1.2]} />
        <SheerCurtain position={[-2.4, 1.4, -1.0]} scale={[0.85, 1, 1]} />

        {/* Volumetric Sunbeams Streaming In */}
        <SunRays intensity={studioOpacity} />

        {/* The Luxury Bridal Vanity Table & Mirror */}
        <StudioVanity position={[0, -0.15, -0.6]} />
      </group>

      {/* Floating Bridal Veil (Dreamy Scene 06 Transition) */}
      <FloatingVeil progress={progress} />

      {/* Hero Makeup Brush & Bridal Portrait Reveal (Scene 08, 09, 10, 11) */}
      <HeroBrushAndPortrait progress={progress} />

      {/* Golden Cosmetic Dust Particles */}
      <GoldenAtmosphericDust />
    </group>
  );
}
