"use client";

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";

// Smaller padding => larger brick in its canvas (size/movement unchanged, just framing).
// Tweaked to "zoom in" a bit more while keeping a safe margin to avoid clipping at small sizes.
const PADDING = 1.03; // space around the model
const ROT_SPEED = 0.35;

function BlueprintModel({ onBox }: { onBox: (box: THREE.Box3) => void }) {
  const group = useRef<THREE.Group>(null);
  // Keep the exact same dimensions; only add rounded edges.
  const boxGeom = useMemo(() => new RoundedBoxGeometry(120, 60, 40, 8, 6), []);
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(boxGeom, 25), [boxGeom]);

  // Tiny procedural "scratches" textures so we don't fetch any assets.
  // Generated once (useMemo) -> not CPU hungry per-frame.
  const { scratchNormalMap, scratchRoughnessMap } = useMemo(() => {
    const size = 64;
    const normal = new Uint8Array(size * size * 4);
    const rough = new Uint8Array(size * size); // LuminanceFormat

    // Base values
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const o = i * 4;
        normal[o + 0] = 128;
        normal[o + 1] = 128;
        normal[o + 2] = 255;
        normal[o + 3] = 255;
        rough[i] = 90; // ~0.35 roughness baseline
      }
    }

    // Add a few thin scratch lines (mostly horizontal) + tiny noise
    const scratchCount = 20;
    for (let s = 0; s < scratchCount; s++) {
      const y0 = Math.floor(Math.random() * size);
      const x0 = Math.floor(Math.random() * size);
      const len = Math.floor(size * (0.4 + Math.random() * 0.6));
      const dx = 1;
      const dy = Math.random() < 0.8 ? 0 : (Math.random() < 0.5 ? 1 : -1);

      for (let k = 0; k < len; k++) {
        const x = (x0 + k * dx) % size;
        const y = (y0 + k * dy + size) % size;
        const i = y * size + x;
        const o = i * 4;

        // Slight tangent shift in normal (very subtle)
        normal[o + 0] = 128 + 18; // push X
        normal[o + 1] = 128;
        // Make scratch a bit rougher (more diffuse)
        rough[i] = 160;

        // Feather 1px around
        const i2 = y * size + ((x + 1) % size);
        rough[i2] = Math.max(rough[i2], 130);
      }
    }

    // Light noise everywhere to break banding
    for (let i = 0; i < size * size; i++) {
      const o = i * 4;
      const n = (Math.random() * 2 - 1) * 6;
      normal[o + 0] = THREE.MathUtils.clamp(normal[o + 0] + n, 0, 255);
      normal[o + 1] = THREE.MathUtils.clamp(normal[o + 1] + n, 0, 255);
      rough[i] = THREE.MathUtils.clamp(rough[i] + (Math.random() * 2 - 1) * 10, 0, 255);
    }

    const normalTex = new THREE.DataTexture(normal, size, size, THREE.RGBAFormat);
    normalTex.needsUpdate = true;
    normalTex.wrapS = THREE.RepeatWrapping;
    normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.repeat.set(2.5, 2.5);

    // Three r180+ dropped LuminanceFormat; RedFormat is the 1-channel replacement.
    const roughTex = new THREE.DataTexture(rough, size, size, THREE.RedFormat);
    roughTex.needsUpdate = true;
    roughTex.wrapS = THREE.RepeatWrapping;
    roughTex.wrapT = THREE.RepeatWrapping;
    roughTex.repeat.set(2.5, 2.5);
    roughTex.colorSpace = THREE.NoColorSpace;

    return { scratchNormalMap: normalTex, scratchRoughnessMap: roughTex };
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        // Lightweight glass w/ refraction + subtle scratches (no external textures).
        color: 0xf6fbff,
        metalness: 0.0,
        roughness: 0.18,
        roughnessMap: scratchRoughnessMap,
        transmission: 1.0,
        ior: 1.52,
        thickness: 12,
        // Slight blue tint in absorption (subtle; most visible in thicker areas)
        attenuationColor: new THREE.Color(0xcfe6ff),
        attenuationDistance: 220,
        // Make HDR reflections show up more
        envMapIntensity: 1,
        specularIntensity: 0.75,
        reflectivity: 1,
        clearcoat: 0.12,
        clearcoatRoughness: 0.18,
        normalMap: scratchNormalMap,
        normalScale: new THREE.Vector2(0.06, 0.06),
      }),
    [scratchNormalMap, scratchRoughnessMap]
  );

  useEffect(() => {
    if (!group.current) return;
    
    const box = new THREE.Box3().setFromObject(group.current);
    onBox(box);
  }, [onBox]);

  // Smooth time-based rotation
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * ROT_SPEED;
  });

  return (
    <group ref={group}>
      <mesh geometry={boxGeom} material={material} />
      {/* Cheap visibility boost on light backgrounds: subtle outline */}
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color="#000000" transparent opacity={0.14} />
      </lineSegments>
    </group>
  );
}

       function OrthoController({
         box,
         padding = PADDING,
       }: {
         box: THREE.Box3 | null;
         padding?: number;
       }) {
         const { camera, size } = useThree();
         const cam = camera as THREE.OrthographicCamera;

         const fit = useCallback(() => {
           if (!box || size.width === 0 || size.height === 0) return;

           // model dimensions in world units (after rotation)
           const dims = new THREE.Vector3();
           box.getSize(dims);

           const vw = size.width;
           const vh = size.height;
           if (vw <= 0 || vh <= 0) return;

           // IMPORTANT: Make the ortho frustum match the canvas pixel size.
           // If we don't do this, left/right/top/bottom may stay at default -1..1 and
           // any alignment math becomes unreliable.
           cam.left = -vw / 2;
           cam.right = vw / 2;
           cam.top = vh / 2;
           cam.bottom = -vh / 2;

           // compute zoom to fit with padding
           const w = Math.max(dims.x, 1e-6);
           const h = Math.max(dims.y, 1e-6);
           const zoom = Math.min(vw / (w * padding), vh / (h * padding));
           cam.zoom = zoom;

           // center the view on the model's bounding-box center (we'll override X for desktop alignment)
           const center = new THREE.Vector3();
           box.getCenter(center);

           // Straight-on view (no isometric angle). The model itself rotates on Y.
           const dist = 200; // feel free to tweak
           // Keep the brick centered in the canvas (avoid large empty space on one side).
           const targetX = center.x;
           cam.position.set(targetX, center.y, center.z + dist);
           cam.up.set(0, 1, 0);
           cam.lookAt(targetX, center.y, center.z);
           cam.updateProjectionMatrix();
         }, [box, size.width, size.height, cam, padding]);

         useEffect(() => {
           fit();
         }, [fit]);

         return null;
       }

export default function BlueprintModelComponent() {
  const [box, setBox] = React.useState<THREE.Box3 | null>(null);

  return (
    <>
      <BlueprintModel onBox={setBox} />
      <OrthoController box={box} />
    </>
  );
}
