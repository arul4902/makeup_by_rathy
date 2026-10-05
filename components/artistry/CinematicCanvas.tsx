"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import CinematicStudio from "./CinematicStudio";

// ========================================================
// CINEMATOGRAPHER CAMERA CONTROLLER
// Uses 24fps motion weight, 50mm/85mm/100mm lens framing
// ========================================================
function CinematicCameraController({ progress }: { progress: number }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 1.25, 0));
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // Cinematic camera waypoint interpolation
    let targetPos = new THREE.Vector3(0, 1.45, 5.6);
    let targetLook = new THREE.Vector3(0, 1.25, 0);
    let targetFov = 44;

    if (progress < 0.08) {
      // Scene 01: Golden Hour Opening
      const t = progress / 0.08;
      targetPos.set(0, 1.45, THREE.MathUtils.lerp(5.6, 5.2, t));
      targetLook.set(0, 1.25, 0);
      targetFov = 44;
    } else if (progress < 0.18) {
      // Scene 02: Entering Bridal Studio (Dolly In)
      const t = (progress - 0.08) / 0.1;
      targetPos.set(
        THREE.MathUtils.lerp(0, 0.2, t),
        THREE.MathUtils.lerp(1.45, 1.35, t),
        THREE.MathUtils.lerp(5.2, 4.0, t)
      );
      targetLook.set(0, THREE.MathUtils.lerp(1.25, 1.15, t), -0.6);
      targetFov = THREE.MathUtils.lerp(44, 40, t);
    } else if (progress < 0.28) {
      // Scene 03: Vanity Reveal
      const t = (progress - 0.18) / 0.1;
      targetPos.set(
        THREE.MathUtils.lerp(0.2, 0.38, t),
        THREE.MathUtils.lerp(1.35, 0.98, t),
        THREE.MathUtils.lerp(4.0, 2.5, t)
      );
      targetLook.set(0, THREE.MathUtils.lerp(1.15, 0.85, t), -0.6);
      targetFov = THREE.MathUtils.lerp(40, 36, t);
    } else if (progress < 0.38) {
      // Scene 04: Macro Beauty Shots (100mm Macro Feel)
      const t = (progress - 0.28) / 0.1;
      targetPos.set(
        THREE.MathUtils.lerp(0.38, 0.58, t),
        THREE.MathUtils.lerp(0.98, 0.72, t),
        THREE.MathUtils.lerp(2.5, 1.35, t)
      );
      targetLook.set(0.75, 0.12, 0.32);
      targetFov = THREE.MathUtils.lerp(36, 28, t);
    } else if (progress < 0.46) {
      // Scene 05: Crystal Tiara Discovery (Rack Focus & Micro-Orbit)
      const t = (progress - 0.38) / 0.08;
      targetPos.set(
        THREE.MathUtils.lerp(0.58, -0.42, t),
        THREE.MathUtils.lerp(0.72, 0.68, t),
        THREE.MathUtils.lerp(1.35, 1.12, t)
      );
      targetLook.set(-0.45, 0.15, 0.38);
      targetFov = THREE.MathUtils.lerp(28, 26, t);
    } else if (progress < 0.54) {
      // Scene 06: The Veil Transition
      const t = (progress - 0.46) / 0.08;
      targetPos.set(
        THREE.MathUtils.lerp(-0.42, 0, t),
        THREE.MathUtils.lerp(0.68, 1.05, t),
        THREE.MathUtils.lerp(1.12, 2.2, t)
      );
      targetLook.set(0, 0.95, 0);
      targetFov = THREE.MathUtils.lerp(26, 40, t);
    } else if (progress < 0.62) {
      // Scene 07: Rathy Brand Reveal
      const t = (progress - 0.54) / 0.08;
      targetPos.set(0, 0.95, THREE.MathUtils.lerp(2.2, 3.2, t));
      targetLook.set(0, 0.9, 0);
      targetFov = 38;
    } else if (progress < 0.70) {
      // Scene 08: Signature Makeup Brush Tracking
      const t = (progress - 0.62) / 0.08;
      targetPos.set(
        THREE.MathUtils.lerp(0, 0.22, t),
        THREE.MathUtils.lerp(0.95, 0.88, t),
        THREE.MathUtils.lerp(3.2, 2.9, t)
      );
      targetLook.set(0.2, 0.85, 0);
      targetFov = 36;
    } else if (progress < 0.84) {
      // Scene 09: Brush Reveals the Bride
      const t = (progress - 0.70) / 0.14;
      targetPos.set(
        THREE.MathUtils.lerp(0.22, 0.32, t),
        THREE.MathUtils.lerp(0.88, 0.85, t),
        THREE.MathUtils.lerp(2.9, 3.5, t)
      );
      targetLook.set(0.3, 0.85, 0);
      targetFov = 39;
    } else if (progress < 0.94) {
      // Scene 10 & 11: Bridal Portrait & Beauty Montage
      const t = (progress - 0.84) / 0.1;
      targetPos.set(
        THREE.MathUtils.lerp(0.32, 0.2, t),
        0.85,
        THREE.MathUtils.lerp(3.5, 3.3, t)
      );
      targetLook.set(0.2, 0.85, 0);
      targetFov = 38;
    } else {
      // Scene 12: Final Hero Shot & Seamless Transition Release
      const t = (progress - 0.94) / 0.06;
      targetPos.set(
        THREE.MathUtils.lerp(0.2, 0, t),
        THREE.MathUtils.lerp(0.85, 0.78, t),
        THREE.MathUtils.lerp(3.3, 3.9, t)
      );
      targetLook.set(0, 0.78, 0);
      targetFov = 42;
    }

    // Add cinematic handheld micro-drift (subtle human breathing, never robotic)
    const driftX = Math.sin(state.clock.elapsedTime * 0.45) * 0.025;
    const driftY = Math.cos(state.clock.elapsedTime * 0.35) * 0.018;

    targetPos.x += driftX;
    targetPos.y += driftY;

    // Smooth 24fps camera inertia
    camera.position.lerp(targetPos, 5.0 * delta);
    lookTarget.current.lerp(targetLook, 5.0 * delta);
    camera.lookAt(lookTarget.current);

    // Dynamic FOV update
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 4.0 * delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// ========================================================
// STUDIO LIGHTING RIG (Golden Hour Warmth)
// ========================================================
function StudioLighting() {
  return (
    <>
      {/* Soft warm golden ambient base */}
      <ambientLight intensity={1.3} color="#FFF8F0" />

      {/* Main Golden Hour Sun through left window */}
      <directionalLight
        position={[-5, 4.5, -0.5]}
        intensity={2.8}
        color="#FFE5B8"
        castShadow
      />

      {/* Warm room bounce fill */}
      <directionalLight position={[4, 2, 3]} intensity={0.8} color="#F7ECE1" />

      {/* Specular golden point light on vanity */}
      <pointLight position={[0.2, 1.4, 0.6]} intensity={1.6} color="#FFE6BA" distance={8} />
    </>
  );
}

// ========================================================
// CANVAS WRAPPER WITH ADAPTIVE DPR
// ========================================================
export default function CinematicCanvas({ progress }: { progress: number }) {
  return (
    <div className="luxury-hero-canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.45, 5.6], fov: 44, near: 0.1, far: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <StudioLighting />
        <CinematicCameraController progress={progress} />
        <Suspense fallback={null}>
          <CinematicStudio progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
